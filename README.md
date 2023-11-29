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

A task is a prompt (workflow) which is sent to the server. You can find an example task here: [tasks](plugin%2Ftasks)

``` Json
{
  "config": {
    "uploadSize": 1024,
    "mode": "loop"
  },
  "variables": {
    "positive": {
      "type": "textarea",
      "value": "a cute cat",
      "label": "Positive Prompt:"
    },
    "negative": {
      "type": "text",
      "value": "text, watermark",
      "label": "Negative Prompt:"
    },
    "row1": {
      "type": "row",
      "seed": {
        "type": "seed",
        "value": "random",
        "label": "Seed:"
      },
      "denoise": {
        "type": "slider",
        "value": 0.8,
        "min": 0.01,
        "max": 1,
        "step": 0.01,
        "mapMax": 1,
        "label": "AI Freedom (Denoise):"
      }
    },
    "row2": {
      "type": "row",
      "model": {
        "type": "model",
        "value": "sd_xl_base_1.0.safetensors",
        "label": "Model:"
      },
      "lora": {
        "type": "lora",
        "value": "lcm_lora_weights.safetensors",
        "label": "LCM Lora:"
      }
    }
  },
  "prompt": {
    "3": {
      "inputs": {
        "seed": "#seed#",
        "steps": 5,
        "cfg": 1.3,
        "sampler_name": "lcm",
        "scheduler": "sgm_uniform",
        "denoise": "#denoise#",
        "model": [
          "17",
          0
        ],
        "positive": [
          "6",
          0
        ],
        "negative": [
          "7",
          0
        ],
        "latent_image": [
          "20",
          0
        ]
      },
      "class_type": "KSampler"
    },
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
    "7": {
      "inputs": {
        "text": "#negative#",
        "clip": [
          "16",
          1
        ]
      },
      "class_type": "CLIPTextEncode"
    },
    "8": {
      "inputs": {
        "samples": [
          "3",
          0
        ],
        "vae": [
          "16",
          2
        ]
      },
      "class_type": "VAEDecode"
    },
    "9": {
      "inputs": {
        "filename_prefix": "ComfyUI",
        "images": [
          "8",
          0
        ]
      },
      "class_type": "SaveImage"
    },
    "16": {
      "inputs": {
        "ckpt_name": "#model#"
      },
      "class_type": "CheckpointLoaderSimple"
    },
    "17": {
      "inputs": {
        "lora_name": "#lora#",
        "strength_model": 1,
        "strength_clip": 1,
        "model": [
          "16",
          0
        ],
        "clip": [
          "16",
          1
        ]
      },
      "class_type": "LoraLoader"
    },
    "18": {
      "inputs": {
        "image": "#image#",
        "choose file to upload": "image"
      },
      "class_type": "LoadImage"
    },
    "20": {
      "inputs": {
        "pixels": [
          "18",
          0
        ],
        "vae": [
          "16",
          2
        ]
      },
      "class_type": "VAEEncode"
    }
  }
}
```

A task has a Config, variables and a prompt section.
The prompt section is the prompt payload that is sent to the server. \
In ComfyUI you get this by clicking on "Save (API Format)". The developer mode must be active.

The config area has some settings for the Task.

``` Json
  "config": {
    "uploadSize": 1024,
    "mode": "loop"
  },
```

**uploadSize** means the largest side of the upload image. The default value is 512.\
**mode** The mode for the task. Currently there is "single" or "loop". In loop mode, the plugin waits for changes and
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
This makes it possible to build special tasks for specific tasks.

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
- model
    - settings: value, label
- lora
    - settings: value, label
- controlNet (models)
    - settings: value, label
- row
    - is a container

### Debug Mode

In debug mode you can view the last prompt sent. \
To activate the debug mode open the panel menu \
![debugmode.png](assets%2Fdebugmode.png)

### Known Issues

On every "redraw" the scrollbar jumps to the Top. Current there is no way to fix this, UXP not supported Scroll
Events. \
Please make the window size bigger to avoid this. 