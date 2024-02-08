# ![Logo](./plugin/icons/dark@1x.png) LAizypainter

<p align="center">
  <img src="./assets/logo_big.png" width="300"/>
</p>

LAizypainter is a Photoshop plugin that lets you work interactively with Stable Diffusion without leaving Photoshop. \
Currently only ComfyUI is supported. Fooocus and A1111 will be supported in the future.

LAizypainter sends every change you make in your art to your chosen SD server, so you can draw in peace and see what the AI does with your image. \
It is recommended to use LCM Models to get fast (near real-time) results.

# ![Demo 1](./assets/demo_1.gif)
# ![Demo 2](./assets/demo_2.gif)

### Requirements
Min. Photoshop version: 25.0.0 (September 2023)\
The Plugin need the [Permissions](https://developer.adobe.com/photoshop/uxp/2022/guides/uxp_guide/uxp-misc/manifest-v5) localFileSystem:request and network:domains:all. \
**localFileSystem** for loading tasks, **network:domains** for connecting to a Stable Diffusion server

### Install
Download the current version `.ccx` under [Releases](https://github.com/DimaChaichan/LAizypainter/releases). \
Open the file and install the plugin over Adobe Creative Cloud. \
examples of tasks can also be found in the release. Download the Task.zip and unzip it.

### Build

You need NodeJs and NPM

```
npm install
npm run build
```

Import the plugin to UXP Developer Tool, the Manifest file is under `/dist`

## Server

### ComfUI

Install instructions you will find here: https://github.com/comfyanonymous/ComfyUI
It is recommended to enable the preview `--preview-method auto`

If you use a service like https://rundiffusion.com. You can simply copy the URL from Iframe. Use the WebTool from your
browser for this.

## Task
A task is a prompt (workflow) which is sent to the server. You can find example tasks here: [tasks](doc%2Ftask.md)

A task has a Config, variables and a prompt section. \
The prompt section is the prompt payload that is sent to the server. \
In ComfyUI you get this by clicking on "Save (API Format)". The developer mode must be active.

You can use this ComfyUI Plugin to create simple Task from you exist Workflows: [LAizypainter-Exporter-ComfyUI](https://github.com/DimaChaichan/LAizypainter-Exporter-ComfyUI) 

The config area has some settings for the Task.

``` Json
  "config": {
    "label": "Img2Img",
    "mode": "loop"
  },
```
**label:** Set the label for the Task, default: Filename \
**mode:** The mode for the task. Currently there is "single" or "loop". In loop mode, the plugin waits for changes and
executes the task again and again. default: loop.

In the Variables area you can define variables and use them in the prompt. e.g

``` Json
  "variables": {
    "positive": {
      "type": "textarea",
      "type": "textarea",
      "value": "a cute cat",
      "label": "Positive Prompt:"
    },
    ...
  "prompt": {
    "6": {
      "inputs": {
        "text": "#positive#",
        "clip": [
          "16",
          1
        ]
      },
      "class_type": "CLIPTextEncode"
    },
  ...
```

#positive# is now replaced with the text from the text box. \
This makes it possible to build special tasks.

The value **#image#** stands for the current image in Photoshop. \
With **#image.width#**, **#image.height#** you get the current width and height from Image. \
The value **#selection#** stands for selection as image like a [Quick Mask](https://helpx.adobe.com/photoshop/using/create-temporary-quick-mask.html) \
The value **#selectionImage#** stands for selection in the current image.

### Variables Types
See here: [Variables](doc%2Fvariables.md)

### Debug Mode

In debug mode you can view the last prompt sent. \
To activate the debug mode open the panel menu \
![debugmode.png](assets%2Fdebugmode.png)
