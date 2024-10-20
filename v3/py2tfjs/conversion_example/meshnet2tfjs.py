import torch
import numpy as np
import json
import os


# Assuming `tfjs_spec` is your final dictionary containing the TensorFlow.js model specification
# Let's save it to a file named 'model.json'
def save_tfjs_model_spec(tfjs_spec, file_name="model.json"):
    with open(file_name, "w") as json_file:
        # Set `indent` to 4 for pretty-printing which makes the JSON file human-readable
        # Ensure `ensure_ascii` is False so that the file is saved in UTF-8 encoding
        json.dump(tfjs_spec, json_file, indent=4, ensure_ascii=False)


def add_conv3d_layer(
    layers, filters, kernel_size, dilation, stride, layer_name
):
    layers.append(
        {
            "class_name": "Conv3D",
            "config": {
                "name": layer_name,
                "trainable": False,
                "filters": filters,
                "kernel_size": kernel_size,
                "strides": stride,
                "dilation_rate": dilation,
                "padding": "same",
                "data_format": "channels_last",
                "activation": "linear",  # We will add the activation layer separately
                "use_bias": True,
                "dtype": "float32",
            },
            "name": layer_name,
            "inbound_nodes": [[[layers[-1]["name"], 0, 0, {}]]],
        }
    )


def add_activation_layer(layers, activation, layer_name):
    layers.append(
        {
            "class_name": "Activation",
            "config": {
                "name": layer_name,
                "trainable": False,
                "dtype": "float32",
                "activation": activation,
            },
            "name": layer_name,
            "inbound_nodes": [[[layers[-1]["name"], 0, 0, {}]]],
        }
    )


def get_activation_name(pytorch_activation):
    tfjs_activations_map = {
        "ReLU": "relu",
        "ELU": "elu",
        "Sigmoid": "sigmoid",
        "Tanh": "tanh",
        "LeakyReLU": "leaky_relu",
        # Add more mappings as needed
    }

    class_name = pytorch_activation.__class__.__name__
    if class_name in tfjs_activations_map:
        return tfjs_activations_map[class_name]
    else:
        raise ValueError(f"Unsupported PyTorch activation type: {class_name}")


def convert_pytorch_to_tfjs(pytorch_model, cube_size):
    layers = [
        {
            "class_name": "InputLayer",
            "config": {
                "batch_input_shape": [None, cube_size, cube_size, cube_size, 1],
                "dtype": "float32",
                "sparse": False,
                "ragged": False,
                "name": "input",
            },
            "name": "input",
            "inbound_nodes": [],
        }
    ]

    layer_count = 0  # Counter for naming layers

    # Process each PyTorch layer and add corresponding layers to the config
    for i, module in enumerate(pytorch_model.model):
        if isinstance(module, torch.nn.Sequential):
            for layer in module:
                if isinstance(layer, torch.nn.Conv3d):
                    layer_name = f"conv3d_{layer_count}"
                    add_conv3d_layer(
                        layers,
                        layer.out_channels,
                        list(layer.kernel_size),
                        list(layer.dilation),
                        list(layer.stride),
                        layer_name,
                    )
                else:
                    activation_name = f"activation_{layer_count}"
                    add_activation_layer(
                        layers, get_activation_name(layer), activation_name
                    )
                layer_count += 1
        elif isinstance(module, torch.nn.Conv3d):
            layer_name = "output"
            add_conv3d_layer(
                layers,
                module.out_channels,
                list(module.kernel_size),
                list(module.dilation),
                list(module.stride),
                layer_name,
            )
            layer_count += 1

    # Name the last layer "output"
    layers[-1]["name"] = "output"

    # Generate the output model specification for TensorFlow.js
    tfjs_spec = {
        "format": "layers-model",
        "generatedBy": "keras v2.7.0",
        "convertedBy": "TensorFlow.js Converter v3.9.0",
        "modelTopology": {
            "keras_version": "2.6.0",
            "backend": "tensorflow",
            "model_config": {
                "class_name": "Functional",
                "config": {
                    "name": "model",
                    "layers": layers,
                    "input_layers": [["input", 0, 0]],
                    "output_layers": [[layers[-1]["name"], 0, 0]],
                },
            },
        },
    }

    # Initialize the weights manifest list
    weights_manifest = []

    input_channels = 1
    # Iterate through each layer in the layers list
    for layer in layers:
        class_name = layer["class_name"]
        if class_name == "Conv3D":
            # For Conv3D layers, we have 'kernel' (weights) and 'bias'
            kernel_name = f"{layer['name']}/kernel"
            bias_name = f"{layer['name']}/bias"

            # Get the shape of the kernel and bias
            config = layer["config"]
            kernel_shape = [
                config["kernel_size"][0],
                config["kernel_size"][1],
                config["kernel_size"][2],
                input_channels,
                config["filters"],
            ]
            bias_shape = [config["filters"]]
            cube_size = config["filters"]  # Update cube size for the next layer

            # Append the weights and bias configurations to the weights manifest
            weights_manifest.extend(
                [
                    {
                        "name": kernel_name,
                        "shape": kernel_shape,
                        "dtype": "float32",
                    },
                    {
                        "name": bias_name,
                        "shape": bias_shape,
                        "dtype": "float32",
                    },
                ]
            )
            # set input channels for the next layer
            input_channels = config["filters"]

    # Add the weightsManifest to the tfjs_spec
    tfjs_spec["weightsManifest"] = [
        {"paths": ["model.bin"], "weights": weights_manifest}
    ]

    return tfjs_spec


def extract_weights(layer):
    # Extract the weights and biases, move to CPU and convert to numpy arrays
    layer_weight = layer.weight.data.cpu().numpy()
    layer_bias = layer.bias.data.cpu().numpy()
    # Transpose the weights to match TensorFlow.js's expected order
    # From: (out_channels, in_channels, depth, height, width)
    # To:   (height, width, depth, in_channels, out_channels)
    layer_weight_tfjs = np.transpose(layer_weight, (2, 3, 4, 1, 0)).flatten()

    # Flatten the biases
    layer_bias_tfjs = layer_bias.flatten()

    return layer_weight_tfjs, layer_bias_tfjs


def save_pytorch_weights_to_bin(pytorch_model, bin_file_path="model.bin"):
    # This will hold all weights and biases in the correct order
    all_weights = []

    # Loop through each model layer
    for layer in pytorch_model.model:
        # If the layer is a Sequential, recursively process its layers
        if isinstance(layer, torch.nn.Sequential):
            for sublayer in layer:
                if isinstance(sublayer, torch.nn.Conv3d):
                    weights, biases = extract_weights(sublayer)
                    all_weights.extend([weights, biases])
        elif isinstance(layer, torch.nn.Conv3d):
            weights, biases = extract_weights(layer)
            all_weights.extend([weights, biases])

    # Concatenate all the flattened weights and biases
    combined_weights = np.concatenate(all_weights)

    # Convert the concatenated array to bytes
    weights_bytes = combined_weights.tobytes()

    # Write the bytes to a .bin file
    with open(bin_file_path, "wb") as bin_file:
        bin_file.write(weights_bytes)


def meshnet2tfjs(model, dirname):
    # Ensure the directory exists
    if not os.path.exists(dirname):
        os.makedirs(dirname)

    # Convert the PyTorch model to TensorFlow.js model specification
    tfjs_model_spec = convert_pytorch_to_tfjs(model, 256)

    # Save the TensorFlow.js model specification JSON file
    model_json_path = os.path.join(dirname, "model.json")
    save_tfjs_model_spec(tfjs_model_spec, model_json_path)

    # Save the PyTorch model weights to a binary file
    model_bin_path = os.path.join(dirname, "model.bin")
    save_pytorch_weights_to_bin(model, model_bin_path)


# meshnet2tfjs(model, "/tmp/testmodel")
