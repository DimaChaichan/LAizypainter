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
- **required:** bool value
- **label:** Variable label
- **restore:** true | false: restore last saved value

### Textarea
type: textarea \
settings:
- **value:** string value
- **required:** bool value
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
- **restore:** true | false: restore last saved value

### Seed
type: seed \
settings:
- **value:** number | random: create a random value on task open, -1: create a random value on every prompt
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
type: model | clip | clipVision | controlnet | diffusers | embeddings | gligen | hypernetworks | loras, | styleModels, | upscaleModels, | vae \
settings: 
- **value:** string
- **label:** Variable label
- **restore:** true | false: restore last saved value

### Layer
type: layer \
settings:
- **label:** Variable label

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
The Value **-1** will be replaced with a random seed\
**Strings** can be concatenated e.g. `"#positive#, cartoon style"`\
**Numbers** can use expression e.g. `"#steps# + 10"`
