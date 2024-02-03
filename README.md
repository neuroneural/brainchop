
# Brainchop  [![Version](https://img.shields.io/badge/Version-2.1.0-brightgreen)]() [![JS ](https://img.shields.io/badge/Types-JavaScript-blue)]() [![MIT-License ](https://img.shields.io/badge/license-MIT-green)](https://github.com/neuroneural/brainchop/blob/master/LICENSE) [![tfjs](https://img.shields.io/badge/tfjs-Pre--trained%20Model-blue)](https://github.com/neuroneural/brainchop/tree/master/models/mnm_tfjs_me_test) [![DOI](https://joss.theoj.org/papers/10.21105/joss.05098/status.svg)](https://doi.org/10.21105/joss.05098)


<div align="center">
  <a href="https://neuroneural.github.io/brainchop">
    <img width="100%" src="https://github.com/neuroneural/brainchop/blob/master/css/images/Banner.png">
  </a>


**Frontend For Neuroimaging.  Open Source**

**[Demo](https://neuroneural.github.io/brainchop) &emsp;  [Updates](#Updates) &emsp; [Doc](https://github.com/neuroneural/brainchop/wiki/) &emsp; [News!](#News) &emsp; [Cite](#Citation)**

</div>


<br>
 <img src="https://github.com/neuroneural/brainchop/blob/master/css/logo/brainchop_logo.png"  width="25%" align="right">

 <p align="justify">
 <b><a href="https://neuroneural.github.io/brainchop/"  style="text-decoration: none"> Brainchop</a></b> brings automatic 3D MRI  volumetric segmentation  capability to neuroimaging  by running a lightweight deep learning model (e.g., <a href="https://medium.com/pytorch/catalyst-neuro-a-3d-brain-segmentation-pipeline-for-mri-b1bb1109276a" target="_blank"  style="text-decoration: none"> MeshNet</a>) in the web-browser for inference on the user side. 
 </p>

 <p align="justify">
 We make the implementation of Brainchop freely available, releasing its pure javascript code as open-source. The user interface (UI)  provides a web-based end-to-end solution for 3D MRI segmentation. <b><a href="https://rii-mango.github.io/Papaya/"  style="text-decoration: none">Papaya</a></b> viewer is integrated with the tool for MRI visualization. In version 1.3.0, <b><a href="https://threejs.org/"  style="text-decoration: none">Three.js</a></b> is used for MRI 3D rendering.  For more information about Brainchop, please refer to this detailed <b><a href="https://github.com/neuroneural/brainchop/wiki/"  style="text-decoration: none">Wiki</a></b> and this <b><a href="https://trendscenter.org/in-browser-3d-mri-segmentation-brainchop-org/"  style="text-decoration: none"> Blog</a></b>.

  For questions or to share ideas, please refer to our  <b><a href="https://github.com/neuroneural/brainchop/discussions/"  style="text-decoration: none"> Discussions </a></b> board.

 </p>

<div align="center">

![Interface](https://github.com/neuroneural/brainchop/blob/master/css/images/brainchop_Arch.png)

**Brainchop high-level architecture**
</div>


<div align="center">

![Interface](https://github.com/neuroneural/brainchop/blob/master/css/images/DL_Arch.png)

**MeshNet deep learning architecture used for inference with Brainchop** (MeshNet  <a href="https://arxiv.org/pdf/1612.00940.pdf" target="_blank"  style="text-decoration: none"> paper</a>)
</div>


## MeshNet Example
This basic example provides an overview of the training pipeline for the MeshNet model. 

* [![Open In Colab](https://colab.research.google.com/assets/colab-badge.svg)](https://colab.research.google.com/github/neuroneural/brainchop/blob/master/py2tfjs/MeshNet_Training_Example.ipynb) [MeshNet Basic Training example](./py2tfjs/MeshNet_Training_Example.ipynb)



## Live Demo

To see Brainchop in action please click  [here](https://neuroneural.github.io/brainchop).


## Updates

<div align="center">

![Interface](https://github.com/neuroneural/brainchop/blob/master/css/images/Brainchop3D.gif)


**Brainchop V1.3.0 rendering segmentation output in 3D**
</div>

<br>

<div align="center">

![Interface](https://github.com/neuroneural/brainchop/blob/master/css/images/Input3DEnhancements.gif)

**Brainchop V1.4.0 rendering MRI Nifti file in 3D**
</div>

## News!

* Brainchop paper is accepted in the 21st IEEE International Symposium on Biomedical Imaging [ISBI 2024](https://biomedicalimaging.org/2024/). Lengthy arXiv version can be found [here](https://arxiv.org/abs/2310.16162).

<div align="center">
   <img src="https://github.com/neuroneural/brainchop/blob/master/css/news/ISBI_2024.jpeg"  width="40%">
</div>

* Brainchop [paper](https://doi.org/10.21105/joss.05098) is published in the Journal of Open Source Software (JOSS) on March 28, 2023.

<div align="center">
   <a href="https://doi.org/10.21105/joss.05098"><img src="https://github.com/neuroneural/brainchop/blob/master/css/news/JOSS_Logo.png"></a>
</div>

<br>
<br>

* Brainchop abstract is accepted for poster presentation during the 2023 [OHBM](https://www.humanbrainmapping.org/) Annual Meeting.

<div align="center">
   <img src="https://github.com/neuroneural/brainchop/blob/master/css/news/OHBM_2023.jpeg"  width="40%">
</div>

<br>
<br>

* Brainchop 1-page abstract and poster is accepted in 20th IEEE International Symposium on Biomedical Imaging ([ISBI 2023](https://2023.biomedicalimaging.org/en/))

<div align="center">
   <img src="https://github.com/neuroneural/brainchop/blob/master/css/news/ISBI_2023.png"  width="40%">
</div>

<br>
<br>

* Google, Tensorflow community spotlight award for brainchop (Sept 2022) on [Linkedin](https://www.linkedin.com/posts/tensorflow-community_github-neuroneuralbrainchop-brainchop-activity-6978796859532181504-cfCW?utm_source=share&utm_medium=member_desktop) and [Twitter](https://twitter.com/TensorFlow/status/1572980019999264774)

<div align="center">
   <img src="https://github.com/neuroneural/brainchop/blob/master/css/news/TF_CommunityAward.png"  width="60%">
</div>

<br>
<br>

* Brainchop  invited to [Pytorch](https://pytorch.org/ecosystem/ptc/2022) flag conference, New Orleans, Louisiana (Dec 2022) 

<div align="center">
  <img src="https://github.com/neuroneural/brainchop/blob/master/css/news/Pytorch_Poster.jpg"  width="50%">
</div>


<br>
<br>

* Brainchop  invited to TensorFlow.js Show & Tell episode #7 (Jul 2022). 

<div align="center">
  <img src="https://github.com/neuroneural/brainchop/blob/master/css/news/TF_show_tell.png"  width="50%">
</div>

## Citation

Brainchop [paper](https://doi.org/10.21105/joss.05098) for v2.1.0 is published on March 28, 2023, in the Journal of Open Source Software (JOSS) [![DOI](https://joss.theoj.org/papers/10.21105/joss.05098/status.svg)](https://doi.org/10.21105/joss.05098) 


<br>

For **APA** style, the paper can be **cited** as: 

> Masoud, M., Hu, F., & Plis, S. (2023). Brainchop: In-browser MRI volumetric segmentation and rendering. Journal of Open Source Software, 8(83), 5098. https://doi.org/10.21105/joss.05098

<br>

For **BibTeX** format that is used by some publishers,  please use: 

```BibTeX: 
@article{Masoud2023, 
  doi = {10.21105/joss.05098}, 
  url = {https://doi.org/10.21105/joss.05098}, 
  year = {2023}, 
  publisher = {The Open Journal}, 
  volume = {8}, 
  number = {83}, 
  pages = {5098}, 
  author = {Mohamed Masoud and Farfalla Hu and Sergey Plis}, 
  title = {Brainchop: In-browser MRI volumetric segmentation and rendering}, 
  journal = {Journal of Open Source Software} 
} 
```
<br>

For **MLA** style: 

> Masoud, Mohamed, Farfalla Hu, and Sergey Plis. ‘Brainchop: In-Browser MRI Volumetric Segmentation and Rendering’. Journal of Open Source Software, vol. 8, no. 83, The Open Journal, 2023, p. 5098, https://doi.org10.21105/joss.05098.

<br>

For **IEEE** style:

> M. Masoud, F. Hu, and S. Plis, ‘Brainchop: In-browser MRI volumetric segmentation and rendering’, Journal of Open Source Software, vol. 8, no. 83, p. 5098, 2023. doi:10.21105/joss.05098


<br>

## Funding

This work was funded by the NIH grant RF1MH121885. Additional support from NIH R01MH123610, R01EB006841 and NSF 2112455.

<br />
<div align="center">

<img src='https://github.com/neuroneural/brainchop/blob/master/css/logo/TReNDS_logo.jpg' width='300' height='100'></img>

**Mohamed Masoud - Sergey Plis - 2023**
</div>
