Thank you for taking the time to contribute to Brainchop!.

The following is our set of guidelines to ease your contribution. 

#### Table Of Contents

[Code of Conduct](#code-of-conduct)

[Having a Question](#Having-a-question)

[ Project Structure ](#Project-Structure)

[How To Contribute?](#how-can-i-contribute)
  * [Reporting Bugs](#reporting-bugs)
  * [Your First Code Contribution](#your-first-code-contribution)




## Code of Conduct

This project and everyone participating in it is governed by the [Code of Conduct](https://github.com/neuroneural/brainchop/wiki/CODE-OF-CONDUCT). By participating, you are expected to uphold this code. Please report unacceptable behavior to [brainchop@github.com](mailto:brainchop@github.com).

## Having a question? 

> **Note:** Please don't file an issue to ask a question. You'll get faster results by using the resources below.

* [Brainchop Discussions Board](https://github.com/neuroneural/brainchop/discussions)
* [Brainchop Q&A](https://github.com/neuroneural/brainchop/discussions/categories/q-a)



## Project Structure 

  * **Root**  
    * style 
    * lib
    * js 
       * mainMeshNetFunctions.js ( Brainchop main functions)
       * mainNiftiReadingFunctions.js (Nifti functions)
       * mainParameters.js 
    * python  
    * MRI (data) 
    * ExperimentalMode 
    * ModelToLoad (Models)
       * model11_gw_ae 
           * colorLUT.json (Seg ROI Color Data)
           * labels.json (Seg ROI Labels)
           * group1-shard1of1.bin (Model Weights Binary file)
           * model.json (Model JSON file)         
 


## How Can I Contribute?

### Reporting Bugs

Bugs are tracked as [GitHub issues](https://guides.github.com/features/issues/). To report a bug create an issue  to explain the problem and include additional details to help maintainers reproduce the problem:

* **Use a clear and descriptive title** for the issue to identify the problem.
* **Describe the exact steps which reproduce the problem** in as many details as possible. 
* **Provide specific examples to demonstrate the steps**. 
* **Describe the behavior you observed after following the steps** 
* **Explain which behavior you expected to see instead and why.**
* **Include screenshots and animated GIFs** 


Include details about your configuration and environment:

* **Which version of OS, Browser, GPU, CPU  you are using**?
* **What size of RAM you are using**?
* **Which model you used with the  problem**?




## Your First Code Contribution

### Pull Requests


Please follow these steps to have your contribution considered by the maintainers:

1. Fork Brainchop repository to have a copy on your github.
2. Push your updates to the forked Brainchop repository on your github.
3. Into your forked Brainchop repository create a pull request, it should show you the base repository (original one)  and the head repository (forked one), choose master branch for each and create pull request
4. After you submit your pull request, verify that all [status checks](https://help.github.com/articles/about-status-checks/) are passing <details><summary>What if the status checks are failing?</summary>If a status check is failing, and you believe that the failure is unrelated to your change, please leave a comment on the pull request explaining why you believe the failure is unrelated. A maintainer will re-run the status check for you. If we conclude that the failure was a false positive, then we will open an issue to track that problem with our status check suite.</details>

5. Don't delete your forked repository until your pull request approved and merged. 
