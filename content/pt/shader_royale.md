---
title: "Shader Royale"
summary: "Participa no maior evento de programação simultanea de shaders do mundo"
---
>


### Bonzomatic

O evento Shader Royale utiliza a versão em rede mais recente do programa Bonzomatic. Podes fazer download através destas hiperligações:

* https://github.com/wrightwriter/Bonzomatic-Compute/releases/tag/v1.0.1 - Versão mais recente
* https://github.com/TheNuSan/Bonzomatic/releases/tag/v13 - Ainda podes utilizar a versão da Nusan, sem suporte de compute shaders mas é retrocompativel

Só precisas de extrair os ficheiros do arquivo.

Para os utilizadores MacOS e Linux: Infelizmente não há um build oficial para estas plataformas, tens de o compilar a partir do código fonte. Não te esqueças de também copiar as fontes e texturas da build de Windows e colocá-las na directoria certa. Não há garantias de estabilidade nestas plataformas, pequenas diferenças nos compiladores de shader entre as plataformas por vezes são a fonte de problemas.

### Instalar Texturas Extra

Um pacote com texturas extra para esta sessão está disponivel em [Inercia2025Textures.zip](/Inercia2025Textures.zip).

Copia os conteúdos da directoria `textures` para a directoria do mesmo nome do Bonzomatic. Deverá parecer algo como:
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
          
Dentro da directoria do Bonzomatic actualiza o `config.json` para adicionar as referências às novas texturas, deverá parecer algo assim:
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

Apaga ou renomeia o ficheiro `shader.glsl` se ele existir na tua directoria do Bonzomatic e executa o programa. Deverás ter umas novas referências uniform de texturas listadas no topo: `texInercia2025`, `texInerciaID` e `texInerciaBW`.

Podes utilizar o código exemplo de `testTexture.glsl` para validar que as texturas estão a funcionar. O código também inclui uma função getTexture que redimensiona a textura para o aspect ratio correcto e invert o eixo dos Y.

```
            vec4 getTexture(sampler2D sampler, vec2 uv){
                vec2 size = textureSize(sampler,0);
                float ratio = size.x/size.y;
                return texture(sampler,uv*vec2(1.,-1.*ratio)-.5);
            }
```

### Como connectar durante o evento

Executa Bonzomatic.exe, a janela deverá abrir a pedir configurações. No painel de Network tens de garantir que:

* estás em modo SENDER
* Server: ws://drone.alkama.com:9000
* Room: inercia2025
* Nickname: {your nickname}
* Clica no Run

Se estás em MacOs ou Linux tens de actualizar o config.json para alterar o parâmetro serverUrl para: `ws://drone.alkama.com:9000/inercia2025/{yourhandle}`

Quando a janela de código do Bonzomatic abre verifica se tens ou não um bloco vermelho ao lado do teu nome, ter o bloco vermelho indica problemas de ligação ao servidor.

### Resolução de conflitos

Já aconteceu no passado por vezes o serviço de DNS não estar a funcionar devidamente, em alternativa a ligares a `ws://drone.alkama.com:9000` podes tentar ligar directamente a `ws://37.187.21.171:9000` para testar se é esse o problema.
