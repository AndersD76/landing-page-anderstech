# SPEC — Rodapé assinado dos artefatos (proposta e case)

Para aplicar no **gerador Python externo** (ReportLab/Playwright). Este repo não
gera proposta: ele só hospeda a rota `/r/<código>` que recebe o scan.

> Todo o texto abaixo é **[REVISAR — Anders valida]**. Medidas, cores e o
> contrato da URL são técnicos e podem ser aplicados como estão.

---

## 1. O contrato da URL — a única parte que não pode divergir

**O QR codifica exatamente isto, e nada mais:**

```
https://anderstech.net/r/<código>
```

Sem UTM, sem query, sem `?`. **As UTMs são acrescentadas pelo servidor** no
redirecionamento — é isso que mantém o QR curto (e portanto legível impresso) e
garante que a marcação nunca fique errada por erro de digitação no gerador.

O que o servidor faz ao receber o scan (implementação na FASE 4):

1. registra o evento `artifact_scan` com o código, o tipo e o referrer;
2. redireciona 302 para:

```
https://anderstech.net/?utm_source=anderstech&utm_medium=artifact&utm_campaign=<tipo>&utm_content=<código>
```

### Formato do código

```
<tipo><7 caracteres aleatórios>     →  8 caracteres, tudo minúsculo
```

| Parte | Regra |
|---|---|
| `<tipo>` | `p` = proposta · `c` = case · `r` = relatorio-auditoria · `e` = certificado-ead · `a` = apresentação |
| Aleatórios | 7 caracteres do alfabeto `abcdefghjkmnpqrstuvwxyz23456789` |
| Alfabeto | 31 símbolos — **sem `0`, `1`, `i`, `l`, `o`**, que se confundem quando alguém digita o link lido no papel |
| Espaço | 31⁷ ≈ 27,5 bilhões por tipo — colisão acidental é irrelevante |

Exemplos: `p7k2m9x4` (proposta) · `c3nq8wzr` (case) · `r5hx4mtn` (relatório) · `e8jw2qkv` (certificado).

**Um código por artefato enviado**, não por modelo. Duas propostas para dois
clientes = dois códigos. É o que torna o scan atribuível a quem recebeu.

O gerador Python registra o código via API antes de embutir no QR:

```
POST https://anderstech.net/api/admin/artifacts
Authorization: Bearer <ADMIN_KEY>
Content-Type: application/json

{"tipo": "proposta", "destino": "https://anderstech.net", "label": "Empresa X - ISO 9001"}
```

Resposta (201):

```json
{"codigo": "p7k2m9x4", "tipo": "proposta", "url_completa": "https://anderstech.net/r/p7k2m9x4", "url_qr": "https://anderstech.net/r/p7k2m9x4"}
```

Tipos válidos: `proposta`, `case`, `relatorio-auditoria`, `certificado-ead`, `apresentacao`.

O `destino` é a URL para onde o scan redireciona (landing, página de serviço,
etc.). O `label` é texto livre para identificação interna. O `url_qr` é o que
vai codificado no QR — **sem UTMs, que o servidor acrescenta no redirect**.

**Filtro de bot**: bots de preview (WhatsApp, Telegram, Facebook, LinkedIn)
**não** registram `artifact_scan` — o redirect funciona normalmente, mas o
evento não entra no funil. Sem isso, cada proposta compartilhada no WhatsApp
geraria um scan fantasma no ato do envio.

---

## 2. QR — parâmetros técnicos

| Parâmetro | Valor | Por quê |
|---|---|---|
| Conteúdo | `https://anderstech.net/r/<código>` (33 caracteres) | — |
| Modo | Byte | a URL tem minúsculas; modo alfanumérico exige maiúsculas |
| Versão | **3** (29 × 29 módulos) | versão 2 comporta 26 bytes em EC M — não cabe |
| Correção de erro | **M (15%)** | mantém a versão baixa, e portanto o módulo grande |
| Tamanho impresso | **20 × 20 mm** (≈ 56,7 pt) | módulo ≈ 0,69 mm, acima do piso de 0,4 mm para impressão |
| Zona de silêncio | **3 mm brancos** nos quatro lados | nenhum elemento pode invadir |
| Cor dos módulos | `#0B1730` (navy) sobre branco puro | navy é quase preto — contraste sobra e fica na identidade |
| Logo no centro | **não** | exigiria EC H, subiria a versão e encolheria o módulo |

```python
import qrcode
qr = qrcode.QRCode(version=3, error_correction=qrcode.constants.ERROR_CORRECT_M, box_size=10, border=0)
qr.add_data(f"https://anderstech.net/r/{codigo}")
qr.make(fit=False)          # fit=False trava a versão 3
img = qr.make_image(fill_color="#0B1730", back_color="white")
```

> `border=0` porque a zona de silêncio é reservada no layout (item 3), não na
> imagem. Se preferir embutir, use `border=4` e desenhe a 25,6 mm.

---

## 3. Layout do rodapé — A4 retrato (210 × 297 mm)

**Em todas as páginas**, não só na última: proposta encaminhada internamente
costuma ser lida em pedaço, e o rodapé é o que sobrevive ao recorte.

Origem `(0,0)` no **canto inferior esquerdo** — convenção do ReportLab.
Margens laterais: 20 mm.

```
    20mm                                                              190mm
      │                                                                 │
 28mm ├─────────────────────────────────────────────────────────────────┤  filete 0,5pt #C9D2E0
      │                                                                 │
 25mm │                                                    ┌──────────┐ │  ← topo do QR
      │  ◆ ANDERS TECH                                     │          │ │
 20mm │                                   Cases e prazos   │    QR    │ │
      │  Consultoria ISO 9001 · PBQP-H ·   aponte a câmera→│  20×20mm │ │
 15mm │  Sebrae Unio — Passo Fundo/RS                      │          │ │
      │                                anderstech.net/r/…  │          │ │
 10mm │  anderstech.net                                    └──────────┘ │  ← base do QR em 5mm
      │                                                                 │
  0mm └─────────────────────────────────────────────────────────────────┘
                                                          170mm      190mm
```

### Bloco esquerdo — x = 20 mm

| Linha | Baseline | Texto | Fonte | Cor |
|---|---|---|---|---|
| 1 | y = 20 mm | ◆ + `ANDERS TECH` | Poppins SemiBold 8 pt, tracking 0,10 em | `#0B1730` |
| 2 | y = 15,5 mm | `Consultoria ISO 9001 · PBQP-H · Sebrae Unio` | Poppins Regular 7 pt | `#46577A` |
| 3 | y = 11,5 mm | `Passo Fundo/RS · anderstech.net` | Poppins Regular 7 pt | `#46577A` |

**◆ diamante**: quadrado de 2 × 2 mm em `#FE0000`, rotacionado 45°, centro na
altura da maiúscula da linha 1, 3 mm à esquerda do texto (ou seja, começa em
x = 20 mm e o texto em x = 25 mm).

### Bloco do QR — canto inferior direito

| Elemento | Posição |
|---|---|
| QR | x: 170 → 190 mm · y: 5 → 25 mm |
| Zona de silêncio | 3 mm em volta — nada entre x = 167–193 mm e y = 2–28 mm |

### Legenda do QR — alinhada à direita, terminando em x = 166 mm

| Linha | Baseline | Texto | Fonte | Cor |
|---|---|---|---|---|
| 1 | y = 18 mm | `Cases, prazos e como trabalho` | Poppins Medium 7 pt | `#0B1730` |
| 2 | y = 14 mm | `aponte a câmera →` | Poppins Regular 6,5 pt | `#46577A` |
| 3 | y = 9 mm | `anderstech.net/r/<código>` | Poppins Regular 6 pt | `#8190AC` |

A linha 3 existe para quem lê no papel e prefere digitar — é por causa dela que
o alfabeto do código não tem `0`, `1`, `i`, `l` nem `o`.

### Filete separador

Linha de 0,5 pt em `#C9D2E0`, de x = 20 mm a x = 190 mm, em y = 28 mm.

---

## 4. Constantes para o gerador

```python
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor

NAVY      = HexColor("#0B1730")
NAVY_SOFT = HexColor("#46577A")
NAVY_MUTE = HexColor("#8190AC")
VERMELHO  = HexColor("#FE0000")
FILETE    = HexColor("#C9D2E0")

MARGEM_ESQ, MARGEM_DIR = 20 * mm, 190 * mm
FILETE_Y   = 28 * mm
QR_X, QR_Y, QR_LADO = 170 * mm, 5 * mm, 20 * mm
LEGENDA_DIR = 166 * mm
```

---

## 5. Checklist antes de mandar a primeira proposta

- [ ] QR impresso em papel comum escaneia a ~25 cm, em luz de escritório
- [ ] O código impresso confere com o registrado no seu mapa `código → cliente`
- [ ] Rodapé aparece em **todas** as páginas
- [ ] Nada invade a zona de silêncio de 3 mm do QR
- [ ] Poppins embarcada no PDF (`pdfmetrics.registerFont`) — sem ela o leitor
      substitui a fonte e o rodapé desalinha
- [ ] `https://anderstech.net/r/<código>` responde **302** para a landing com
      `utm_medium=artifact` — **só depois da FASE 4**; antes disso a rota é 404

> **Ordem de trabalho**: pode aplicar o rodapé agora. Enquanto a FASE 4 não
> subir a rota, o QR leva a 404 — então **não envie proposta com QR ao cliente
> antes de a rota estar no ar**. Gerar e conferir o layout, pode.
