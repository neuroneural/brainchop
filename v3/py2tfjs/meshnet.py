import torch
import torch.nn as nn
import torch.nn.functional as F


MeshNet_38_or_64_kwargs = [
    {
        "in_channels": -1,
        "kernel_size": 3,
        "out_channels": 21,
        "padding": 1,
        "stride": 1,
        "dilation": 1,
    },
    {
        "in_channels": 21,
        "kernel_size": 3,
        "out_channels": 21,
        "padding": 1,
        "stride": 1,
        "dilation": 1,
    },
    {
        "in_channels": 21,
        "kernel_size": 3,
        "out_channels": 21,
        "padding": 1,
        "stride": 1,
        "dilation": 1,
    },
    {
        "in_channels": 21,
        "kernel_size": 3,
        "out_channels": 21,
        "padding": 2,
        "stride": 1,
        "dilation": 2,
    },
    {
        "in_channels": 21,
        "kernel_size": 3,
        "out_channels": 21,
        "padding": 4,
        "stride": 1,
        "dilation": 4,
    },
    {
        "in_channels": 21,
        "kernel_size": 3,
        "out_channels": 21,
        "padding": 8,
        "stride": 1,
        "dilation": 8,
    },
    {
        "in_channels": 21,
        "kernel_size": 3,
        "out_channels": 21,
        "padding": 1,
        "stride": 1,
        "dilation": 1,
    },
    {
        "in_channels": 21,
        "kernel_size": 1,
        "out_channels": -1,
        "padding": 0,
        "stride": 1,
        "dilation": 1,
    },
]

MeshNet_68_kwargs = [
    {
        "in_channels": -1,
        "kernel_size": 3,
        "out_channels": 71,
        "padding": 1,
        "stride": 1,
        "dilation": 1,
    },
    {
        "in_channels": 71,
        "kernel_size": 3,
        "out_channels": 71,
        "padding": 1,
        "stride": 1,
        "dilation": 1,
    },
    {
        "in_channels": 71,
        "kernel_size": 3,
        "out_channels": 71,
        "padding": 2,
        "stride": 1,
        "dilation": 2,
    },
    {
        "in_channels": 71,
        "kernel_size": 3,
        "out_channels": 71,
        "padding": 4,
        "stride": 1,
        "dilation": 4,
    },
    {
        "in_channels": 71,
        "kernel_size": 3,
        "out_channels": 71,
        "padding": 8,
        "stride": 1,
        "dilation": 8,
    },
    {
        "in_channels": 71,
        "kernel_size": 3,
        "out_channels": 71,
        "padding": 16,
        "stride": 1,
        "dilation": 16,
    },
    {
        "in_channels": 71,
        "kernel_size": 3,
        "out_channels": 71,
        "padding": 1,
        "stride": 1,
        "dilation": 1,
    },
    {
        "in_channels": 71,
        "kernel_size": 1,
        "out_channels": -1,
        "padding": 0,
        "stride": 1,
        "dilation": 1,
    },
]


def conv_w_bn_before_act(dropout_p=0, *args, **kwargs):
    """Configurable Conv block with Batchnorm and Dropout"""
    return nn.Sequential(
        nn.Conv3d(*args, **kwargs),
        nn.BatchNorm3d(kwargs["out_channels"]),
        nn.ReLU(inplace=True),
        nn.Dropout3d(dropout_p),
    )


def init_weights(model):
    """Set weights to be xavier normal for all Convs"""
    for m in model.modules():
        if isinstance(m, (nn.Conv2d, nn.Conv3d, nn.ConvTranspose2d, nn.ConvTranspose3d)):
            nn.init.xavier_normal_(m.weight, gain=nn.init.calculate_gain("relu"))
            nn.init.constant_(m.bias, 0.0)


class MeshNet(nn.Module):
    """Configurable MeshNet from https://arxiv.org/pdf/1612.00940.pdf"""

    def __init__(self, n_channels, n_classes, large=True, dropout_p=0):
        """Init"""
        if large:
            params = MeshNet_68_kwargs
        else:
            params = MeshNet_38_or_64_kwargs

        super(MeshNet, self).__init__()
        params[0]["in_channels"] = n_channels
        params[-1]["out_channels"] = n_classes
        layers = [
            conv_w_bn_before_act(dropout_p=dropout_p, **block_kwargs)
            for block_kwargs in params[:-1]
        ]
        layers.append(nn.Conv3d(**params[-1]))
        self.model = nn.Sequential(*layers)
        init_weights(self.model,)

    def forward(self, x):
        """Forward pass"""
        x = self.model(x)
        return x
