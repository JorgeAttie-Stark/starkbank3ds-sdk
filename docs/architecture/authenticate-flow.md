# `authenticate()`

**Legenda**

| Cor | Significado |
| --- | ----------- |
| Azul (`->>`) | Chamada — quem manda |
| Verde (`-->>`) | Resposta — quem devolve |

## Fluxo

1. Integrador importa `Stark3DS` via `index.js`
2. `index.js` só reexporta — é transparente, não faz nada
3. Merchant chama `authenticate(input)`
4. `stark3ds.js` valida os dados com `schemas/types.js` — se inválido, para aqui com `ValidationError`
5. Validou? Delega tudo para `providers/braspag/index.js`
6. Braspag consulta `config.js` para saber qual URL e código de ambiente (SDB/PRD)
7. Braspag manda `scriptLoader.js` injetar o `<script>` MPI no DOM e espera o `onReady`
8. Braspag manda `renderHiddenFields.js` injetar todos os `<input class="bpmpi_*">` no DOM
9. Resultado sobe de volta para `stark3ds.js`
10. Merchant recebe o challenge ou o erro

## Diagrama

```mermaid
sequenceDiagram
    box rgb(26, 108, 246, 0.08) Camada 1 — API pública
        participant I as Integrador
        participant idx as index.js
        participant s3 as stark3ds.js
        participant types as schemas/types.js
    end
    box rgb(214, 158, 46, 0.08) Camada 2 — Provider Braspag
        participant bp as providers/braspag/index.js
        participant cfg as config.js
        participant sl as scriptLoader.js
        participant rf as renderHiddenFields.js
    end

    I->>idx: 1. import Stark3DS
    idx->>s3: 2. reexport (transparente)
    I->>s3: 3. authenticate(input)
    s3->>types: 4. validate(input)
    types-->>s3: ok / ValidationError
    s3->>bp: 5. authenticateWithBraspag(input)
    bp->>cfg: 6. getConfig(env)
    cfg-->>bp: scriptUrl, code (SDB/PRD)
    bp->>sl: 7. loadScript — injeta script MPI
    sl-->>bp: onReady
    bp->>rf: 8. renderHiddenFields — injeta bpmpi_*
    rf-->>bp: inputs prontos
    bp-->>s3: 9. status, cavv, eci, ...
    s3-->>I: 10. challenge / erro

    linkStyle 0,1,2,3,5,6,8,10 stroke:#63b3ed,stroke-width:2px
    linkStyle 4,7,9,11,12,13 stroke:#68d391,stroke-width:2px
```
