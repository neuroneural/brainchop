import tensorflowjs as tfjs
import json

# After saving keras model with ZeroPadding3D as model.json  Modify with this code:


def fixjson_file(model_file, verbose=False, scube=38):
    # Open json file to modify
    with open(model_file) as f:
        model_dict = json.load(f)

    # Convert
    for layer in model_dict['modelTopology']['model_config']['config']['layers']:
        if layer['class_name'] == "ZeroPadding3D":
            model_dict['modelTopology']['model_config']['config']['layers'].remove(layer)

    prev_layer_name = ""
    for layer in model_dict['modelTopology']['model_config']['config']['layers']:
        if layer['class_name'] == "InputLayer":
            layer["config"]["batch_input_shape"] = [None, scube, scube, scube, 1]

        if layer['class_name'] == "Conv3D":
            layer["config"]["padding"] = "same"
            layer["config"]["data_format"] = "channels_last"
            layer['inbound_nodes'][0][0][0] = prev_layer_name

        prev_layer_name = layer["config"]["name"]

    if verbose:
        # Verification
        for layer in model_dict['modelTopology']['model_config']['config']['layers']:
            print(layer)
            print("-------------------------------------------------------")

    # Save model.json file
    with open(model_file, 'w') as fp:
        json.dump(model_dict, fp)
