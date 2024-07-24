import json
import torch
import torch.nn as nn
import numpy as np

device_name = "cuda:0" if torch.cuda.is_available() else "cpu"
device = torch.device(device_name)


def normalize(img):
    """Unit interval preprocessing"""
    img = (img - img.min()) / (img.max() - img.min())
    return img


def load_tfjs_model(json_path, bin_path):
    # Load JSON specification
    with open(json_path, "r") as f:
        model_spec = json.load(f)

    # Load binary weights
    with open(bin_path, "rb") as f:
        weights_data = np.frombuffer(f.read(), dtype=np.float32)

    return model_spec, weights_data


def create_activation(activation_name):
    activation_map = {
        "relu": nn.ReLU(),
        "elu": nn.ELU(),
        "sigmoid": nn.Sigmoid(),
        "tanh": nn.Tanh(),
        "leaky_relu": nn.LeakyReLU(),
    }
    return activation_map.get(activation_name, nn.Identity())


def calculate_same_padding(kernel_size, dilation):
    if isinstance(kernel_size, int):
        kernel_size = (kernel_size,) * 3
    if isinstance(dilation, int):
        dilation = (dilation,) * 3

    padding = []
    for k, d in zip(kernel_size, dilation):
        padding.append((k - 1) * d // 2)
    return tuple(padding)


def create_pytorch_model(model_spec, weights_data):
    layers = []
    weight_index = 0
    in_channels = 1  # Start with 1 input channel

    for layer in model_spec["modelTopology"]["model_config"]["config"][
        "layers"
    ][
        1:
    ]:  # Skip input layer
        if layer["class_name"] == "Conv3D":
            config = layer["config"]
            padding = calculate_same_padding(
                config["kernel_size"], config["dilation_rate"]
            )
            conv = nn.Conv3d(
                in_channels=in_channels,
                out_channels=config["filters"],
                kernel_size=config["kernel_size"],
                stride=config["strides"],
                padding=padding,
                dilation=config["dilation_rate"],
            )

            # Load weights and biases
            weight_shape = conv.weight.shape
            # putting the shape into tfjs order
            weight_shape = [weight_shape[i] for i in (2, 3, 4, 1, 0)]
            bias_shape = conv.bias.shape

            weight_size = np.prod(weight_shape)
            bias_size = np.prod(bias_shape)

            weight = weights_data[
                weight_index : weight_index + weight_size
            ].reshape(weight_shape)
            # restoring pytorch order
            weight = np.transpose(weight, (4, 3, 0, 1, 2))
            weight_index += weight_size

            bias = weights_data[
                weight_index : weight_index + bias_size
            ].reshape(bias_shape)
            weight_index += bias_size

            conv.weight.data = torch.from_numpy(weight.copy())
            conv.bias.data = torch.from_numpy(bias.copy())

            layers.append(conv)

            # Update in_channels for the next layer
            in_channels = config["filters"]

        elif layer["class_name"] == "Activation":
            activation = create_activation(layer["config"]["activation"])
            layers.append(activation)

    return nn.Sequential(*layers)


def tfjs_to_pytorch(json_path, bin_path):
    model_spec, weights_data = load_tfjs_model(json_path, bin_path)
    pytorch_model = create_pytorch_model(model_spec, weights_data)
    return pytorch_model


def export_to_onnx(model, input_shape, onnx_path):
    dummy_input = torch.randn(input_shape)
    torch.onnx.export(
        model,
        dummy_input,
        onnx_path,
        opset_version=14,
        input_names=["input"],
        output_names=["output"],
        dynamic_axes={"input": {0: "batch_size"}, "output": {0: "batch_size"}},
    )


if __name__ == "__main__":
    # Specify your own paths
    json_path = "model.json"
    bin_path = "model.bin"
    onnx_path = "model.onnx"

    pytorch_model = tfjs_to_pytorch(json_path, bin_path)

    # Assuming input shape is [batch_size, channels, depth, height, width]
    input_shape = (1, 1, 256, 256, 256)  # Modify as needed

    export_to_onnx(pytorch_model, input_shape, onnx_path)
