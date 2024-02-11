## Example Tasks

### Base
#### Text to Image
Example file: [tex2img.lzy](..%2Fplugin%2Ftasks%2Ftex2img.lzy) \
Text to Image. \
Node Requirements: none
![tex2img.png](..%2Fplugin%2Ftasks%2Ftex2img.png)

#### Image to Image
Example file: [img2img.lzy](..%2Fplugin%2Ftasks%2Fimg2img.lzy) \
Image to Image. \
Node Requirements: none
![img2img.png](..%2Fplugin%2Ftasks%2Fimg2img.png)

#### Upscale
Example file: [upscale.lzy](..%2Fplugin%2Ftasks%2Fupscale.lzy) \
Upscale Image. \
Node Requirements: none

### ControlNet
#### ControlNet ICM
Example file: [icm_controlNet.lzy](..%2Fplugin%2Ftasks%2Fcontrolnet%2Ficm_controlNet.lzy) \
ControlNet with ICM Lora. \
Node Requirements: none

#### ControlNet ICM Layer
Example file: [icm_controlNet_layer.lzy](..%2Fplugin%2Ftasks%2Fcontrolnet%2Ficm_controlNet_layer.lzy) \
ControlNet with ICM Lora for special Layer. \
Node Requirements: none

### IPAdapter
#### IPAdapter IMG2IMG
Example file: [img2img.lzy](..%2Fplugin%2Ftasks%2Fipadapter%2Fimg2img.lzy) \
IPAdapter with Img2Img based on a selected Layer. \
Node Requirements: [ComfyUI IPAdapter plus](https://github.com/cubiq/ComfyUI_IPAdapter_plus)

#### IPAdapter Controlnet
Example file: [ipadapter_controlnet.lzy](..%2Fplugin%2Ftasks%2Fipadapter%2Fipadapter_controlnet.lzy)\
IPAdapter with controlnet, with a reference Layer. \
Node Requirements:  [ComfyUI IPAdapter plus](https://github.com/cubiq/ComfyUI_IPAdapter_plus)
![ipadapter_controlnet.png](..%2Fplugin%2Ftasks%2Fipadapter%2Fipadapter_controlnet.png)

#### IPAdapter Face
Example file: [ipadapter_face.lzy](..%2Fplugin%2Ftasks%2Fipadapter%2Fipadapter_face.lzy)\
IPAdapter with [Face Swap](https://github.com/cubiq/ComfyUI_IPAdapter_plus?tab=readme-ov-file#ipadapter-face) , with a reference Layer. \
Node Requirements:  [ComfyUI IPAdapter plus](https://github.com/cubiq/ComfyUI_IPAdapter_plus)
![ipadapter_face.png](..%2Fplugin%2Ftasks%2Fipadapter%2Fipadapter_face.png)

#### IPAdapter Inpaint
Example file: [ipadapter_inpaint.lzy](..%2Fplugin%2Ftasks%2Fipadapter%2Fipadapter_inpaint.lzy)\
IPAdapter with inpaint function, use a reference Layer. \
Node Requirements:  [ComfyUI IPAdapter plus](https://github.com/cubiq/ComfyUI_IPAdapter_plus)
![ipadapter_inpaint.png](..%2Fplugin%2Ftasks%2Fipadapter%2Fipadapter_inpaint.png)

#### IPAdapter Batch
Example file: [ipadapter_batch.lzy](..%2Fplugin%2Ftasks%2Fipadapter%2Fipadapter_batch.lzy)\
IPAdapter with inpaint function, use a reference Layer. \
Node Requirements:  [ComfyUI IPAdapter plus](https://github.com/cubiq/ComfyUI_IPAdapter_plus)
![ipadapter_batch.png](..%2Fplugin%2Ftasks%2Fipadapter%2Fipadapter_batch.png)

### ICM
#### ICM Text to Image
Example file: [icm_tex2img.lzy](..%2Fplugin%2Ftasks%2Flcm%2Ficm_tex2img.lzy) \
Text to Image with ICM Lora. \
Node Requirements: none

#### ICM Image to Image
Example file: [lcm_img2img.lzy](..%2Fplugin%2Ftasks%2Flcm%2Flcm_img2img.lzy) \
Image to Image with ICM Lora. \
Node Requirements: none

#### ICM Image to Image Lora
Example file: [lcm_img2img_lora.lzy](..%2Fplugin%2Ftasks%2Flcm%2Flcm_img2img_lora.lzy) \
Image to Image with ICM Lora and a extra Lora \
Node Requirements: none

### Inpaint
#### Inpaint 
Example file: [inpaint.lzy](..%2Fplu gin%2Ftasks%2Finp aint%2Finpaint.lzy) \
Use the document with the mask for inpainting. \
Node Requirements: none 
![inpaint.png](..%2Fplugin%2Ftasks%2Finpaint%2Finpaint.png)

#### Inpaint Layer
Example file: [inpaint_layer.lzy](..%2Fplugin%2Ftasks%2Finpaint%2Finpaint_layer.lzy) \
Use the selected Layer with the mask for inpainting. \
Node Requirements: none
![inpaint_layer.png](..%2Fplugin%2Ftasks%2Finpaint%2Finpaint_layer.png)

#### Inpaint Selection
Example file: [inpaint_select.lzy](..%2Fplugin%2Ftasks%2Finpaint%2Finpaint_select.lzy)\
Use the document with the selection for inpainting. \
Node Requirements: none
![inpaint_select.png](..%2Fplugin%2Ftasks%2Finpaint%2Finpaint_select.png)

#### Inpaint Selection
Example file: [inpaint_select_layer.lzy](..%2Fplugin%2Ftasks%2Finpaint%2Finpaint_select_layer.lzy)\
Use the selected Layer with the selection for inpainting. \
Node Requirements: none
![inpaint_select_layer.png](..%2Fplugin%2Ftasks%2Finpaint%2Finpaint_select_layer.png)

### PreProcess
#### canny
Example file: [preprocess_canny.lzy](..%2Fplugin%2Ftasks%2Fpreprocess%2Fpreprocess_canny.lzy)\
Line Extractors: Canny Edges \
Node Requirements: [ComfyUI's ControlNet Auxiliary Preprocessors](https://github.com/Fannovel16/comfyui_controlnet_aux)
![preprocess_canny.png](..%2Fplugin%2Ftasks%2Fpreprocess%2Fpreprocess_canny.png)

#### HED Lines
Example file: [preprocess_hedLines.lzy](..%2Fplugin%2Ftasks%2Fpreprocess%2Fpreprocess_hedLines.lzy)\
Line Extractors: HED Lines \
Node Requirements: [ComfyUI's ControlNet Auxiliary Preprocessors](https://github.com/Fannovel16/comfyui_controlnet_aux)
![preprocess_canny.png](..%2Fplugin%2Ftasks%2Fpreprocess%2Fpreprocess_canny.png)

#### Realistic Lineart
Example file: [preprocess_realisticLines.lzy](..%2Fplugin%2Ftasks%2Fpreprocess%2Fpreprocess_realisticLines.lzy)\
Line Extractors: Realistic Lineart \
Node Requirements: [ComfyUI's ControlNet Auxiliary Preprocessors](https://github.com/Fannovel16/comfyui_controlnet_aux)
![preprocess_realisticLines.png](..%2Fplugin%2Ftasks%2Fpreprocess%2Fpreprocess_realisticLines.png)

#### Scribble
Example file: [preprocess_scribble.lzy](..%2Fplugin%2Ftasks%2Fpreprocess%2Fpreprocess_scribble.lzy)\
Line Extractors: Scribble \
Node Requirements: [ComfyUI's ControlNet Auxiliary Preprocessors](https://github.com/Fannovel16/comfyui_controlnet_aux)
![preprocess_scribble.png](..%2Fplugin%2Ftasks%2Fpreprocess%2Fpreprocess_scribble.png)

#### PiDiNet
Example file: [preprocess_pidinet.lzy](..%2Fplugin%2Ftasks%2Fpreprocess%2Fpreprocess_pidinet.lzy)\
Line Extractors: PiDINet Lines \
Node Requirements: [ComfyUI's ControlNet Auxiliary Preprocessors](https://github.com/Fannovel16/comfyui_controlnet_aux)
![preprocess_pidinet.png](..%2Fplugin%2Ftasks%2Fpreprocess%2Fpreprocess_pidinet.png)

#### Binary Lines
Example file: [preprocess_binaryLines.lzy](..%2Fplugin%2Ftasks%2Fpreprocess%2Fpreprocess_binaryLines.lzy)\
Line Extractors: Binary Lines \
Node Requirements: [ComfyUI's ControlNet Auxiliary Preprocessors](https://github.com/Fannovel16/comfyui_controlnet_aux)
![preprocess_binaryLines.png](..%2Fplugin%2Ftasks%2Fpreprocess%2Fpreprocess_binaryLines.png)

#### Color Palette
Example file: [preprocess_colorPalette.lzy](..%2Fplugin%2Ftasks%2Fpreprocess%2Fpreprocess_colorPalette.lzy)\
create Color Palette image \
Node Requirements: [ComfyUI's ControlNet Auxiliary Preprocessors](https://github.com/Fannovel16/comfyui_controlnet_aux)
![preprocess_colorPalette.png](..%2Fplugin%2Ftasks%2Fpreprocess%2Fpreprocess_colorPalette.png)

#### MiDaS Normal map
Example file: [preprocess_MiDaSNormal.lzy](..%2Fplugin%2Ftasks%2Fpreprocess%2Fpreprocess_MiDaSNormal.lzy)\
create MiDaS Normal map \
Node Requirements: [ComfyUI's ControlNet Auxiliary Preprocessors](https://github.com/Fannovel16/comfyui_controlnet_aux)
![preprocess_MiDaSNormal.png](..%2Fplugin%2Ftasks%2Fpreprocess%2Fpreprocess_MiDaSNormal.png)

#### MiDaS Depth map
Example file: [preprocess_MiDaSDepth.lzy](..%2Fplugin%2Ftasks%2Fpreprocess%2Fpreprocess_MiDaSDepth.lzy)\
create MiDaS Depth map \
Node Requirements: [ComfyUI's ControlNet Auxiliary Preprocessors](https://github.com/Fannovel16/comfyui_controlnet_aux)
![preprocess_MiDaSDepth.png](..%2Fplugin%2Ftasks%2Fpreprocess%2Fpreprocess_MiDaSDepth.png)

#### LeRes Depth map
Example file: [preprocess_LeResDepth.lzy](..%2Fplugin%2Ftasks%2Fpreprocess%2Fpreprocess_LeResDepth.lzy)\
create LeRes Depth map \
Node Requirements: [ComfyUI's ControlNet Auxiliary Preprocessors](https://github.com/Fannovel16/comfyui_controlnet_aux)
![preprocess_LeResDepth.png](..%2Fplugin%2Ftasks%2Fpreprocess%2Fpreprocess_LeResDepth.png)
### Custom
#### DDColor
Example file: [DDColor.lzy](..%2Fplugin%2Ftasks%2Fcustom%2FDDColor.lzy)\
Colourise Images with DDColor \
Node Requirements: [DDcolor](https://github.com/kijai/ComfyUI-DDColor?tab=readme-ov-file)
![DDColor.png](..%2Fplugin%2Ftasks%2Fcustom%2FDDColor.png)


