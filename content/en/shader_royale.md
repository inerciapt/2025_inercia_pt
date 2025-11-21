---
title: "Shader Royale"
summary: "Join the largest simultaneous shader livecoding event in the world"
---
>


### Bonzomatic

The Shader Royale Jam will be using the latest networked version of Bonzomatic. You can download the program here:

* https://github.com/wrightwriter/Bonzomatic-Compute/releases/tag/v1.0.1 - Get this one by default
* https://github.com/TheNuSan/Bonzomatic/releases/tag/v13 - You can still use Nusan's version without compute shader if you want

You just need to unzip the file.

MacOS and Linux users: There is unfortunatelly no official build, so you will have to build from source. Be sure to also fetch the font and textures from the Windows build and place them in the right directory. Also, there is no stability guarantee on theses platforms, small differences in the shader compilers between the platforms sometimes cause issues.

### Extra Texture Installation

A package with extra textures will be available for the jam.

Download zip file [Inercia2025Textures.zip](/Inercia2025Textures.zip) and unzip to a directory.

Copy the content of the textures directory and paste everythning inside your Bonzomatic `textures` directory. Your Bonzomatic directory should look like this:
```
            C:\Path\to\Bonzomatic
            textures\
                checker.png
                noise.png
                tex1.jpg
                [...]
                Inercia2025.png
                InerciaID.png
                InerciaBW.png
```
          
Inside you bonzomatic folder, update your `config.json` to add the texture like this:
```
          [...]
          "textures": {
              "texChecker": "textures/checker.png",
              "texNoise": "textures/noise.png",
              "texTex1": "textures/tex1.jpg",
              "texTex2": "textures/tex2.jpg",
              "texTex3": "textures/tex3.jpg",
              "texTex4": "textures/tex4.jpg",
              "texInercia2025": "textures/Inercia2025.png",
              "texInerciaID": "textures/InerciaID.png",
              "texInerciaBW": "textures/InerciaBW.png"
            },
            [...]
```

Erase or move the `shader.glsl` if it exists on your Bonzomatic directory and start Bonzomatic. You should see a few new textures called `texInercia2025`, `texInerciaID` and `texInerciaBW`in the list of uniform texture at the top of the file.

You can use the `testTexture.glsl` to check it works. The testTexture.glsl also contain a helper function getTexture that resize the texture to the correct ratio and reverse the Y axis.

```
            vec4 getTexture(sampler2D sampler, vec2 uv){
                vec2 size = textureSize(sampler,0);
                float ratio = size.x/size.y;
                return texture(sampler,uv*vec2(1.,-1.*ratio)-.5);
            }
```

### How to connect during the Jam

Click on Bonzomatic.exe, a window should open asking your for configuration. On the Network panel ensure you have the following settings :

* SENDER is checked
* Server: ws://drone.alkama.com:9000
* Room: inercia2025
* Nickname: {your nickname}
* Click on Run

If you're on MacOs or Linux, you need to update config.json and update the serverUrl to: `ws://drone.alkama.com:9000/inercia2025/{yourhandle}`

If you don't see a Red Block next to your name on the bottom right of Bonzomatic main window, it means you're OK. Otherwise there might be an issue.

### Troubleshooting

Sometimes the DNS resolution isn't working properly, instead of `ws://drone.alkama.com:9000` you can use `ws://37.187.21.171:9000` to avoid this issue.
