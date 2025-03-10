import torch

from blendbatchnorm import fuse_bn_recursively
from meshnet2tfjs import meshnet2tfjs

from meshnet import (
    MeshNet,
    enMesh_checkpoint,
)

device_name = "cuda:0" if torch.cuda.is_available() else "cpu"
device = torch.device(device_name)


def preprocess_image(img, qmin=0.01, qmax=0.99):
    """Unit interval preprocessing"""
    img = (img - img.quantile(qmin)) / (img.quantile(qmax) - img.quantile(qmin))
    return img


# def preprocess_image(img):
#     """Unit interval preprocessing"""
#     img = (img - img.min()) / (img.max() - img.min())
#     return img


# specify how many classes does the model predict
n_classes = 3
# specify the architecture
config_file = "modelAE.json"
# how many channels does the saved model have
model_channels = 15
# path to the saved model
model_path = "model.pth"
# tfjs model output directory
tfjs_model_dir = "model_tfjs"

meshnet_model = enMesh_checkpoint(
    in_channels=1,
    n_classes=n_classes,
    channels=model_channels,
    config_file=config_file,
)

checkpoint = torch.load(model_path)
meshnet_model.load_state_dict(checkpoint)

meshnet_model.eval()

meshnet_model.to(device)
mnm = fuse_bn_recursively(meshnet_model)
del meshnet_model
mnm.model.eval()


meshnet2tfjs(mnm, tfjs_model_dir)
