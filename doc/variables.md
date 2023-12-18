## Variables Types

### Boolean
type: bool \
settings: 
- **value:** true | false
- **label:** Variable label

### Text
type: text \
settings:
- **value:** string value
- **required:** bool value
- **label:** Variable label

### Textarea
type: textarea \
settings:
- **value:** string value
- **required:** bool value
- **label:** Variable label

### Integer
type: int \
settings:
- **value:** integer
- **label:** Variable label
- **min:** integer
- **max:** integer
- **step:** integer

### Number
type: number \
settings:
- **value:** number
- **label:** Variable label
- **min:** integer
- **max:** integer
- **step:** integer

### Slider
type: slider \
settings:
- **value:** number
- **label:** Variable label
- **min:** integer
- **max:** integer
- **step:** integer

### Seed
type: seed \
settings:
- **value:** number | random: create a random value on task open, -1: create a random value on every prompt
- **label:** Variable label
- **max:** integer

### Combo
type: combo \
settings:
- **value:** string
- **label:** Variable label
- **options:** Array of strings

### Model Combo
type: model | clip | clipVision | controlnet | diffusers | embeddings | gligen | hypernetworks | loras, | styleModels, | upscaleModels, | vae \
settings: 
- **value:** string
- **label:** Variable label

### Row
type: row \
A row is a container

### Advance
All variables in the key advance will appear as "Advanced Options"

### Tips
The Value **-1** will be replaced with a random seed\
**Strings** can be concatenated e.g. `"#positive#, cartoon style"`\
**Numbers** can use expression e.g. `"#steps# + 10"`
