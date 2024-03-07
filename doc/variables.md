## Variables Types

### Boolean
type: bool \
settings: 
- **value:** true | false
- **label:** Variable label
- **restore:** true | false: restore last saved value

### Text
type: text \
settings:
- **value:** string value
- **label:** Variable label
- **restore:** true | false: restore last saved value

### Textarea
type: textarea \
settings:
- **value:** string value
- **label:** Variable label
- **restore:** true | false: restore last saved value

### Integer
type: int \
settings:
- **value:** integer
- **label:** Variable label
- **min:** integer
- **max:** integer
- **step:** integer
- **restore:** true | false: restore last saved value

### Number
type: number \
settings:
- **value:** number
- **label:** Variable label
- **min:** integer
- **max:** integer
- **step:** integer
- **restore:** true | false: restore last saved value

### Slider
type: slider \
settings:
- **value:** number
- **label:** Variable label
- **min:** integer
- **max:** integer
- **step:** integer
- **restore:** true | false: restore last saved value [ipadapter_im2img](..%2Fplugin%2Ftasks%2Fipadapter%2Fipadapter_im2img)

### Seed
type: seed \
settings:
- **value:** number, -2: create a random value on task open, -1: create a random value on every prompt
- **label:** Variable label
- **max:** integer
- **restore:** true | false: restore last saved value

### Combo
type: combo \
settings:
- **value:** string
- **label:** Variable label
- **options:** Array of strings
- **restore:** true | false: restore last saved value

### Model Combo
type: model | clip | clipVision | controlNet | diffusers | embeddings | gligen | hypernetworks | loras, | styleModels, | upscaleModels, | vae \
settings: 
- **value:** string
- **label:** Variable label
- **restore:** true | false: restore last saved value

### Layer
type: layer \
settings:
- **label:** Variable label \

You can select a single Layer or a Document. \
You have access to the width and height with `"#layer.width#"` or `"#layer.height#"` \
You have access to the x and y position with `"#layer.x#"` or `"#layer.y#"`

### Row
type: row \
A row is a container

### Advance
All variables in the key advance will appear as "Advanced Options"

```json
...
"advanced": {
        "steps": {
          "type": "number",
          "value": 5,
          "label": "Steps:"
        }
      },
...
```

### Tips
**Strings** can be concatenated e.g. `"#positive#, cartoon style"`\
**Numbers** can use expression e.g. `"#steps# + 10"`
