# ECI — Electronic Commerce Indicator

O **ECI** é o código que a bandeira devolve após o 3DS. Ele diz se o portador foi autenticado e **quem assume o risco de chargeback** se a loja autorizar a transação.

## Decisão rápida

```
ECI autenticado?  →  Sim  →  Pode autorizar. Chargeback tende a ser do emissor/bandeira.
                 →  Não  →  Pode autorizar, mas chargeback fica com o estabelecimento.
```

> ⚠️ Envie o ECI na autorização: campo `Payment.ExternalAuthentication.Eci` (API Braspag).

---

## Tabela por bandeira

### ✅ Autenticada — chargeback do emissor

| Bandeira | ECI | Como autenticou |
| -------- | --- | --------------- |
| Mastercard | `02` | Emissor |
| Mastercard | `01` | Bandeira |
| Visa | `05` | Emissor |
| Visa | `06` | Bandeira |
| Elo | `05` | Emissor |
| Elo | `06` | Bandeira |
| Amex | `05` | Emissor |
| Amex | `06` | Bandeira |

**Resumo:** portador autenticado. Risco de chargeback **sai do merchant**.

---

### ❌ Não autenticada — chargeback do estabelecimento

| Bandeira | ECI | Situação |
| -------- | --- | -------- |
| Mastercard | qualquer valor **exceto** `01`, `02`, `04` | Não autenticada |
| Visa | qualquer valor **exceto** `05`, `06`, `07` | Não autenticada |
| Elo | qualquer valor **exceto** `05`, `06` | Não autenticada |
| Amex | qualquer valor **exceto** `05`, `06` | Não autenticada |

**Resumo:** transação **pode** ir para autorização, mas o merchant **assume o chargeback**.

---

### 📋 Data Only — não autenticada (notify only)

| Bandeira | ECI | Situação |
| -------- | --- | -------- |
| Mastercard | `04` | Data Only |
| Visa | `07` | Data Only |
| Elo | — | — |
| Amex | — | — |

**Resumo:** fluxo sem challenge de autenticação. Chargeback **permanece com o estabelecimento**.

---

## Visão consolidada

| Mastercard | Visa | Elo | Amex | Resultado | Autenticada? |
| ---------- | ---- | --- | ---- | --------- | ------------ |
| `02` | `05` | `05` | `05` | ✅ Autenticada pelo **emissor** | Sim |
| `01` | `06` | `06` | `06` | ✅ Autenticada pela **bandeira** | Sim |
| ∉ `01`,`02`,`04` | ∉ `05`,`06`,`07` | ∉ `05`,`06` | ∉ `05`,`06` | ❌ Não autenticada | Não |
| `04` | `07` | — | — | 📋 **Data Only** | Não |

---

## Para quem implementa o SDK

| Helper (público) | Usa ECI? | Pergunta que responde |
| ---------------- | -------- | --------------------- |
| `isAuthenticated(result)` | Sim | Houve autenticação 3DS válida? |
| `isLiabilityShiftToIssuer(result)` | Sim | O chargeback passou para o emissor? |

Regras exatas desses helpers → US-14 (`stark3ds.js`).

Fluxo que gera o ECI → [`authenticate()`](../architecture/authenticate-flow.md).
