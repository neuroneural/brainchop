---
title: 'Brainchop: In-browser MRI volumetric segmentation and rendering'
tags:
    - visualization
    - Web machine learning
    - Magnetic resonance imaging
authors:
    - name: Mohamed Masoud^[corresponding author]
      orcid: 0000-0002-5365-242X
      affiliation: 1
    - name: Farfalla Hu
      orcid: 0000-0002-1816-2011
      affiliation: "1, 2"
    - name: Sergey Plis
      orcid: 0000-0003-0040-0365
      affiliation: "1, 2"
affiliations:
  - name: Tri-institutional Center for Translational Research in Neuroimaging and Data Science (TReNDS), Georgia State University, Georgia Institute of Technology, Emory University, Atlanta, GA, USA
    index: 1
  - name: Georgia State University, Department of Computer Science, Atlanta, GA, USA
    index: 2
date: 9 December 2022
bibliography: paper.bib
---

# Summary

[Brainchop](https://github.com/neuroneural/brainchop) brings high fidelity pre-trained deep learning models for volumetric analysis of structural magnetic resonance imaging (MRI) right to the browsers of scientists and clinicians with no requirement on their technical skills in setting up AI solutions.  All of this in an extensible open-source framework. 

Our tool is the first front-end MRI segmentation tool on the web that supports full brain volumetric processing in a single pass inside a browser. This property is powered by the lightweight and reliable deep learning model Meshnet [@Fedorov:2017]. Our modified Meshnet model enables voxel-based segmentation of the entire brain at once by using volumetric dilated convolutions [@Yu:2016], which leads to increased accuracy with modest computational requirements. High-quality client-side processing solves the privacy problem, as the data does not need to leave the client. Moreover, browser-based implementation can take advantage of available hardware acceleration regardless of the brand or architecture.



# Statement of needs

Extracting brain tissue from MRI volumes and segmenting it either into gray and white matter or into a more elaborate brain atlas is an essential step in many brain imaging analysis pipelines.  Surgical planning, measuring brain changes, and visualizing its anatomical structures are just a few clinical applications commonly dependent on MRI segmentation. However, not many places in the world have clinicians and scientists who are simultaneously skilled in their domain and are experts in machine learning and computational infrastructure to be able to take advantage of the benefits enabled by AI-assisted neuroimaging. Yet, the value and potential of modern AI-assisted solutions are difficult to overestimate, especially for specialists in rural areas and developing countries. Web applications could address the many challenges faced by practitioners, but the constrained browser environment is a challenge for high-quality AI models. The common fall-back to server-side processing violates data privacy and usually limits the portability by locking-in on a single type of hardware to run AI on servers. We developed brainchop to address these challenges by creating in-browser machine learning pipelines for volumetric neuroimaging. The high accessibility, scalability, low latency,  ease of use, lack of installation requirements, and cross-platform operation are just a few of the unique and enabling features that brainchop can provide while also preserving end-user data privacy.



# Pipeline

In order to deploy the PyTorch MeshNet model in the browser, there is a  need to convert it first to a workable tensorflow.js (tfjs) [@tensorflow-js]. The tool has a pre-processing pipeline, full-volume and sub-volume inference options, 3D input/output rendering, and post-processing capability as illustrated in \autoref{fig:Brainchop-Pipleline} for the brainchop high-level architecture.

![Brainchop high-level architecture.\label{fig:Brainchop-Pipleline}](BrainchopPipleline.png)

# Preprocessing

Brainchop is designed to support T1 weighted MRI volume segmentation. The input is read in Nifti format [@NIfTI-Reader]. T1 image needs to be in shape 256x256x256, scaled, and resampled to 1mm isotropic voxels as a preprocessing step for proper results. This preprocessing can be made in brainchop by using mri_convert.js which uses pyodide [@pyodide_2022] to deploy the conform function used by FastSurfer [@Henschel:2020] for reshaping,  scaling, and re-sampling  MRI T1 raw image data as shown in  \autoref{fig:Convert-Enhance-Pipeline} (a).

![Brainchop preprocessing pipeline (a) Conform operation (b) MRI enhancement operations.\label{fig:Convert-Enhance-Pipeline}](ConvertAndEnhancePipeline.png)


The rest of the preprocessing pipeline is to remove input noisy voxels and enhance input volume intensities as in \autoref{fig:Enhancement-Pipeline} for improving the segmentation accuracy \autoref{fig:Convert-Enhance-Pipeline} (b). In addition, brainchop also supports  MRI tissue cropping to speed up the inference process and lowering memory use. 




# Inference Model

The advantage of MeshNet small size is due to its simple architecture and using dilated convolution in which a typical model for the segmentation task can be constructed with few layers as shown in \autoref{fig:MeshNet-Arch}.

![MeshNet architecture.\label{fig:MeshNet-Arch}](MeshNetArch.png)

While MeshNet Model has fewer parameters compared to the classical segmentation model U-Net, it is also can achieve a competitive DICE score as shown in \autoref{tab:Table-1}.


\begin{table}[h] \centering \caption{\label{tab:Table-1} Segmentation models performance.}  \begin{tabular}{l|ccc} \hline  {\bf Model} & {\bf Inference Speed} & {\bf Model Size} & {\bf Macro DICE} \\\hline MeshNet GMWM & 116 subvolumes/sec & .89 mb & 0.96 \\ U-Net GMWM & 13  subvolumes/sec &  288 mb & 0.96 \\ MeshNet GMWM (full brain model) & 0.001 sec/volume &  0.022 mb & 0.96\\\hline \end{tabular} \end{table}


# Results

Multiple pre-trained models are available with brainchop for full-volume and sub-volume inference including brain masking, gray matter white matter (GMWM) segmentation models, in addition to brain atlas models for 50 cortical regions and 104 cortical and sub-cortical structures as shown in \autoref{fig:Gallery-1}.

![Brainchop outputs.\label{fig:Gallery-1}](Gallery.png)

Normally 3D noisy regions may result from the inference process due to possible bias, variance and irreducible error (e.g. noise with data). To remove these noisy volumes we designed a 3D connected components algorithm to filter out those noisy regions. 

Papaya [@Papaya] viewers is used to visualize the input and output images, and a composite operation also provided to subjectively verify the output image accuracy comparing to the input. 

Also, brainchop supports 3D real-time rendering of the input and output volume by using Three.js [@threejs] with capability of Region of Interest (ROI) selection as shown in \autoref{fig:rendering}.

![Brainchop rendering segmentation output in 3D.\label{fig:rendering}](Output.png)


Detailed step-by-step [documentation](https://github.com/neuroneural/brainchop/wiki) is provided alongside the [source code](https://github.com/neuroneural/brainchop). Built-in models also are provided with brainchop  [live demo](https://neuroneural.github.io/brainchop/). 


# Acknowledgments

This work was funded by the NIH grant RF1MH121885. Additional support from NIH R01MH123610, R01EB006841 and NSF 2112455.


# References


