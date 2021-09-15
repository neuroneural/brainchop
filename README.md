# 3D Brain Segmentation  [![Version](https://img.shields.io/badge/Version-1.0.0-brightgreen)]()
Mohamed Masoud - Sergey Plis - 2021


## Whole Brain Inference at the Browser
Demo shows segmenation of 3D brain MRI at the browser based on a pretrained MeshNet model.

Main settings
	-input_shape=(1, 38, 38, 38, 1)
    

To run the server:
	-Open a terminal window.
	-Navigate to the directory root directory .
	-Execute the command to start the server.
		For Python 2 run server with free port 80xx (e.g.  `python -m SimpleHTTPServer 8020` )
		For Python 3 run server with free port 80xx (e.g.  `python -m http.server 8020` )


       
       -In the browser url
      
           `http://localhost:8020/`


       - Open browser console by press F12 to see the sample outputs 

       - click on Browse File button, and navigate to "MRI Sample" folder

       - Please DON'T change batch size, it is static to 1 for now.

## Live Demo

Live demo can be found with this [link](https://neuroneural.github.io/brainchop/)

## Visual Guidelines

# Integrated with Papaya viewers

![Interface](https://github.com/Mmasoud1/Portfolios/blob/master/ShowMe/BrainInference/SimpleUI_Demo.gif)
