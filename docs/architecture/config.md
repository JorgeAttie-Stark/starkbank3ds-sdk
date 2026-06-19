# `config.js`

> Código: [`providers/braspag/config.js`](../../providers/braspag/config.js)

## Problema de negócio

A Braspag opera em **dois ambientes** — sandbox (homologação) e production (live). Cada um tem CDN MPI diferente e código de ambiente (`SDB` / `PRD`) que o fluxo 3DS precisa enviar nos campos ocultos.

## Problema técnico

No projeto antigo as URLs apareciam **espalhadas** pelo código — mudar ambiente ou endpoint exigia caçar string em vários arquivos. Agora fica isolado: **um mapa de ambientes + uma função que resolve o certo**.

## O que `getConfig` evita

- URL MPI hardcoded em `scriptLoader.js`, testes ou orquestrador;
- divergência entre sandbox e produção (cada ambiente tem `scriptUrl` e `code` próprios);
- seguir adiante com ambiente inválido (`getConfig('invalido')` lança `Error` com mensagem descritiva);
- expor o mapa interno — só `getConfig` é API pública; `ENVIRONMENTS` fica privado ao módulo.

## Ambientes

| Chave | `code` | `scriptUrl` |
| ----- | ------ | ----------- |
| `sandbox` | `SDB` | `https://mpisandbox.braspag.com.br/Scripts/BP.Mpi.3ds20.min.js` |
| `production` | `PRD` | `https://mpi.braspag.com.br/Scripts/BP.Mpi.3ds20.min.js` |

## Resumo

Esse módulo resolve **centralizar URLs e constantes de ambiente Braspag num único lugar** — passo 6 do fluxo ([`authenticate()`](./authenticate-flow.md): quem orquestra passa o ambiente, `getConfig` devolve `scriptUrl` e `code`).

## Fluxo

```mermaid
flowchart TD
    A[providers/braspag/index.js] -->|environment sandbox ou production| B[getConfig]
    B -->|hit| C[{ code, scriptUrl }]
    B -->|miss| D[throw Error Environment not found]
    C -->|scriptUrl| E[scriptLoader.js loadScript]
    C -->|code SDB ou PRD| F[renderHiddenFields.js bpmpi_*]
```

## Onde ficam as URLs

**Todas** as URLs MPI Braspag vivem só em `config.js`. Nenhum outro arquivo do projeto deve repetir `https://mpi…braspag…`. Testes e loader consomem via `getConfig('sandbox').scriptUrl` (ou `production`).
