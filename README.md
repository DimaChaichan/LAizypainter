# ![Logo](./plugin/icons/dark@1x.png) LAizypainter
<p align="center">
  <img src="./assets/logo_big.png" width="300"/>
</p>

LAizypainter is a Photoshop plugin with which you can send tasks directly to a Stable Diffusion server. \
Currently only ComfyUI is supported. Fooocus and A1111 are in planning.

LAizypainter sends every change to the image to the server, so you can draw in peace and see what the AI does with your image. \
It is recommended to use ICM Models to get a fast result.

# ![Demo](./assets/demo.gif)

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

A task is a prompt (workflow) which is sent to the server. You can find example tasks here: [tasks](plugin%2Ftasks)

A task has a Config, variables and a prompt section. \
The prompt section is the prompt payload that is sent to the server. \
In ComfyUI you get this by clicking on "Save (API Format)". The developer mode must be active.

The config area has some settings for the Task.

``` Json
  "config": {
    "uploadSize": 1024,
    "mode": "loop"
  },
```

**uploadSize:** means the largest side of the upload image. The default value is 512.\
**mode:** The mode for the task. Currently there is "single" or "loop". In loop mode, the plugin waits for changes and
executes the task again and again. The default value is loop.

In the Variables area you can define variables and use them in the prompt. e.g

``` Json
  "variables": {
    "positive": {
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

The value **#image#** stands for the current image in Photoshop.

### Variables Types

- bool
    - settings: value, label
- text
    - settings: value, label
- textarea
    - settings: value, label
- int
    - settings: value, label
- number
    - settings: value, label
- slider
    - settings: value, min, max, step, label
- seed
    - settings: value (random create a random value on load), label
- combo
  - settings: value, label, options
- model
    - settings: value, label
- lora
    - settings: value, label
- controlNet (models)
    - settings: value, label
- row
    - is a container

**Strings** can be concatenated e.g. `"#positive#, cartoon style"`
**Numbers** can use expression e.g. `"#steps# + 10"`

### Debug Mode

In debug mode you can view the last prompt sent. \
To activate the debug mode open the panel menu \
![debugmode.png](assets%2Fdebugmode.png)

### Known Issues

On every "redraw" the scrollbar jumps to the Top. Current there is no way to fix this, UXP not supported Scroll
Events. \
Please make the window size bigger to avoid this. 