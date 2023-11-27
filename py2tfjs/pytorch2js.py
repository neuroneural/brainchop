from blendbatchnorm import fuse_bn_recursively
import onnx
from onnx2keras import onnx_to_keras
import torch
import numpy as np
from meshnet import MeshNet
import tensorflowjs as tfjs
from fixmodeljson import fixjson_file

def preprocess_image(img):
    """Unit interval preprocessing"""
    img = (img - img.min()) / (img.max() - img.min())
    return img

volume_shape = [256, 256, 256]
subvolume_shape = [38, 38, 38]
n_subvolumes = 1024
n_classes = 3
atlas_classes = 104
scube = 64

model_path = '../meshnet_gmwm_dropout_train.30_full.pth'
#'meshnet_gmwm_dropout_train.30_full.pth'#'meshnet_gmwm_train.30_full.pth'

device_name = "cuda:0" if torch.cuda.is_available() else "cpu"
device = torch.device(device_name)
meshnet_model = MeshNet(n_channels=1, n_classes=n_classes, large=False)

meshnet_model.load_state_dict(torch.load(model_path, map_location=device)['model_state_dict'])

meshnet_model.to(device)
mnm = fuse_bn_recursively(meshnet_model)
mnm.model.eval();

x = torch.randn(1, 1, scube, scube, scube, requires_grad=True)
torch.onnx.export(mnm, x.to(device), '/tmp/mnm_model_large.onnx', export_params=True, opset_version=13, do_constant_folding=True, input_names = ['input'], output_names = ['output'],dynamic_axes={'input' : {0 : 'batch_size'},'output' : {0 : 'batch_size'}})
onnx_model = onnx.load('/tmp/mnm_model_large.onnx')
k_model = onnx_to_keras(onnx_model, ['input'])

tfjs.converters.save_keras_model(k_model, '/tmp/mnm_gmwm_dropout256')
fixjson_file('/tmp/mnm_gmwm_dropout256/model.json', scube=scube)
