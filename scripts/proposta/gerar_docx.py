"""Versão editável (.docx) da proposta comercial — mesmo JSON do gerar.mjs.

Uso:  python scripts/proposta/gerar_docx.py <dados.json> [saida.docx]

23/11/2026, no visual do site (o Anders recusou a versão com cara de
"artefato"): Space Grotesk / Inter / Space Mono, capa = hero do site (fundo
desenhado em imagem, texto editável por cima), cabeçalho "01 / NOME" + etiqueta
mono com losango, cartões de borda fina. Mesma ordem e conteúdo do PDF.
As fontes precisam estar instaladas: python scripts/proposta/fontes_word.py
Requer: pip install python-docx pillow
"""
import io
import json
import sys
from pathlib import Path

from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ROW_HEIGHT_RULE, WD_CELL_VERTICAL_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_TAB_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import qn, nsdecls
from docx.shared import Cm, Pt, RGBColor, Twips

RAIZ = Path(__file__).resolve().parents[2]
# Tokens do styles.css
NAVY, NAVY9, NAVY95, RED, RED_AC = "203864", "12233F", "0B1730", "FE0000", "FF6A6A"
PAPER, INK, SOFT, MUTE = "F4F6FA", "16233F", "46577A", "8190AC"
LINE, LINE_SOFT, ON_SOFT, ON_MUTE = "D9DFE9", "ECEFF4", "B9C8E4", "7589AD"
LINE_NAVY, PAINEL = "2D384D", "121E36"  # rgba(255,255,255,.14) e .03 sobre o navy-950
D, D_MED, D_SEMI = "Space Grotesk", "Space Grotesk Medium", "Space Grotesk SemiBold"
B, B_MED, B_SEMI = "Inter", "Inter Medium", "Inter SemiBold"
M = "Space Mono"
LARG = 17.0
TIPOS = {"consultoria": "Consultoria", "treinamento": "Treinamento", "auditoria": "Auditoria"}
MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"]
J, R_, C_ = WD_ALIGN_PARAGRAPH.JUSTIFY, WD_ALIGN_PARAGRAPH.RIGHT, WD_ALIGN_PARAGRAPH.CENTER


def moeda(v):
    return "R$ " + f"{v:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")


def horas(h):
    return f"{h:g}".replace(".", ",") + " h"


def data(iso):
    a, m, d = iso.split("-")
    return f"{d}/{m}/{a}"


def data_extenso(iso):
    a, m, d = (int(x) for x in iso.split("-"))
    return f"{d} de {MESES[m - 1]} de {a}"


def calcular(d):
    por = {}
    for f in d["cronograma"]:
        for i in f["itens"]:
            por[i["tipo"]] = por.get(i["tipo"], 0) + i["horas"]
    vh = d["investimento"]["valorHora"]
    linhas = [{"descricao": TIPOS[t], "horas": por[t], "valor": por[t] * vh} for t in TIPOS if por.get(t)]
    total_h, total = sum(l["horas"] for l in linhas), sum(l["valor"] for l in linhas)
    av = d["pagamento"].get("avista")
    return linhas, total_h, total, (round(total * (1 - av["descontoPct"] / 100), 2) if av else None)


# ── XML na ordem do esquema (fora de ordem, o Word acusa "conteúdo ilegível") ──
_RPR = ["rStyle", "rFonts", "b", "bCs", "i", "iCs", "caps", "smallCaps", "strike", "dstrike", "outline", "shadow", "emboss", "imprint",
        "noProof", "snapToGrid", "vanish", "webHidden", "color", "spacing", "w", "kern", "position", "sz", "szCs", "highlight", "u",
        "effect", "bdr", "shd", "fitText", "vertAlign", "rtl", "cs", "em", "lang", "eastAsianLayout", "specVanish", "oMath"]
_PPR = ["pStyle", "keepNext", "keepLines", "pageBreakBefore", "framePr", "widowControl", "numPr", "suppressLineNumbers", "pBdr", "shd",
        "tabs", "suppressAutoHyphens", "kinsoku", "wordWrap", "overflowPunct", "topLinePunct", "autoSpaceDE", "autoSpaceDN", "bidi",
        "adjustRightInd", "snapToGrid", "spacing", "ind", "contextualSpacing", "mirrorIndents", "suppressOverlap", "jc", "textDirection",
        "textAlignment", "textboxTightWrap", "outlineLvl", "divId", "cnfStyle", "rPr", "sectPr", "pPrChange"]
ORDEM = {
    "tcPr": ["cnfStyle", "tcW", "gridSpan", "hMerge", "vMerge", "tcBorders", "shd", "noWrap", "tcMar", "textDirection", "tcFitText", "vAlign", "hideMark"],
    "tcBorders": ["top", "left", "start", "bottom", "right", "end", "insideH", "insideV", "tl2br", "tr2bl"],
    "tcMar": ["top", "left", "start", "bottom", "right", "end"],
    "tblPr": ["tblStyle", "tblpPr", "tblOverlap", "bidiVisual", "tblStyleRowBandSize", "tblStyleColBandSize", "tblW", "jc", "tblCellSpacing",
              "tblInd", "tblBorders", "shd", "tblLayout", "tblCellMar", "tblLook", "tblCaption", "tblDescription"],
    "tblBorders": ["top", "left", "start", "bottom", "right", "end", "insideH", "insideV"],
    "pBdr": ["top", "left", "bottom", "right", "between", "bar"],
    "rPr": _RPR, "pPr": _PPR,
}


def _local(tag):
    return tag.split("}")[1] if "}" in tag else tag


def _set(el, tag, **attrs):
    sub = el.find(qn(tag))
    if sub is None:
        sub = OxmlElement(tag)
        ordem, nome, antes = ORDEM.get(_local(el.tag)), tag.split(":")[1], None
        if ordem and nome in ordem:
            pos = ordem.index(nome)
            antes = next((f for f in el if _local(f.tag) in ordem and ordem.index(_local(f.tag)) > pos), None)
        antes.addprevious(sub) if antes is not None else el.append(sub)
    for k, v in attrs.items():
        sub.set(qn(k), str(v))
    return sub


def sombra(cell, cor):
    _set(cell._tc.get_or_add_tcPr(), "w:shd", **{"w:val": "clear", "w:color": "auto", "w:fill": cor})


def bordas(cell, **lados):
    b = _set(cell._tc.get_or_add_tcPr(), "w:tcBorders")
    for lado, (cor, tam) in lados.items():
        _set(b, f"w:{lado}", **{"w:val": "single" if tam else "nil", "w:sz": tam, "w:color": cor, "w:space": 0})


def caixa(cell, cor=LINE, tam=4):
    bordas(cell, top=(cor, tam), left=(cor, tam), bottom=(cor, tam), right=(cor, tam))


def margens(cell, t=0.12, b=0.12, l=0.25, r=0.25):
    m = _set(cell._tc.get_or_add_tcPr(), "w:tcMar")
    for lado, v in (("top", t), ("left", l), ("bottom", b), ("right", r)):
        _set(m, f"w:{lado}", **{"w:w": int(v * 567), "w:type": "dxa"})


def tabela(alvo, linhas, colunas, larguras, linhas_h=True, espaco=0, cor_linha=LINE_SOFT):
    try:
        t = alvo.add_table(linhas, colunas)
    except TypeError:
        t = alvo.add_table(linhas, colunas, Cm(sum(larguras)))
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    t.autofit = False
    tblPr = t._tbl.tblPr
    _set(tblPr, "w:tblW", **{"w:w": int(sum(larguras) * 567), "w:type": "dxa"})
    if espaco:
        _set(tblPr, "w:tblCellSpacing", **{"w:w": int(espaco * 567 / 2), "w:type": "dxa"})
    _set(tblPr, "w:tblLayout", **{"w:type": "fixed"})
    b = _set(tblPr, "w:tblBorders")
    for lado in ("top", "left", "bottom", "right", "insideH", "insideV"):
        com = linhas_h and lado in ("insideH", "bottom")
        _set(b, f"w:{lado}", **{"w:val": "single" if com else "nil", "w:sz": 4, "w:color": cor_linha, "w:space": 0})
    for i, col in enumerate(t.columns):
        col.width = Cm(larguras[i])
    for row in t.rows:
        for i, cell in enumerate(row.cells):
            cell.width = Cm(larguras[i])
            margens(cell)
    return t


def linha(row, cabecalho=False, altura=None, exata=False):
    trPr = row._tr.get_or_add_trPr()
    _set(trPr, "w:cantSplit")
    if cabecalho:
        _set(trPr, "w:tblHeader")
    if altura:
        row.height = Cm(altura)
        row.height_rule = WD_ROW_HEIGHT_RULE.EXACTLY if exata else WD_ROW_HEIGHT_RULE.AT_LEAST


def par(alvo, texto="", tam=9.6, cor=INK, fonte=B, negrito=False, alinhar=None, antes=0, depois=4, entre=1.25, **kw):
    p = alvo.add_paragraph()
    pf = p.paragraph_format
    pf.space_before, pf.space_after, pf.line_spacing = Pt(antes), Pt(depois), entre
    if alinhar is not None:
        p.alignment = alinhar
    if texto:
        trecho(p, texto, tam, cor, fonte, negrito, **kw)
    return p


def trecho(p, texto, tam=9.6, cor=INK, fonte=B, negrito=False, caixa_alta=False, espacado=0, fundo=None, contorno=False):
    r = p.add_run(texto)
    r.font.size, r.font.name, r.font.bold = Pt(tam), fonte, negrito
    r.font.color.rgb = RGBColor.from_string(cor)
    rPr = r._r.get_or_add_rPr()
    rPr.rFonts.set(qn("w:cs"), fonte)
    if caixa_alta:
        r.font.all_caps = True
    if contorno:
        _set(rPr, "w:outline")
    if espacado:
        _set(rPr, "w:spacing", **{"w:val": int(espacado * 20)})
    if fundo:
        _set(rPr, "w:shd", **{"w:val": "clear", "w:color": "auto", "w:fill": fundo})
    return r


def primeiro(cell):
    p = cell.paragraphs[0]
    p.paragraph_format.space_after = Pt(0)
    p.paragraph_format.line_spacing = 1.25
    return p


def losango(p, cor=RED, tam=7):
    return trecho(p, "◆  ", tam, cor, "Segoe UI Symbol")


def etiqueta(p, texto, cor=RED, tam=7):
    """.tag do site: Space Mono, caixa alta, espaçada, com losango."""
    losango(p, cor, tam - 1)
    return trecho(p, texto, tam, cor, M, caixa_alta=True, espacado=1.2)


def borda_par(p, lado, cor, tam, espaco=4):
    _set(_set(p._p.get_or_add_pPr(), "w:pBdr"), f"w:{lado}", **{"w:val": "single", "w:sz": tam, "w:color": cor, "w:space": espaco})


def campo(p, instr, tam, cor):
    r = trecho(p, "", tam, cor, M)
    for tipo in ("begin", "instr", "separate", "texto", "end"):
        if tipo == "instr":
            el = OxmlElement("w:instrText")
            el.set(qn("xml:space"), "preserve")
            el.text = f" {instr} "
        elif tipo == "texto":
            el = OxmlElement("w:t")
            el.text = "1"
        else:
            el = OxmlElement("w:fldChar")
            el.set(qn("w:fldCharType"), tipo)
        r._r.append(el)


def link(p, url, texto, tam=9):
    rid = p.part.relate_to(url, "http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink", is_external=True)
    h = OxmlElement("w:hyperlink")
    h.set(qn("r:id"), rid)
    r = trecho(p, texto, tam, NAVY)
    r.font.underline = True
    h.append(r._r)
    p._p.append(h)


def cabecalho_secao(doc, num, indice, rotulo, titulo, sub=None, quebra=True):
    """.sec-head do site: índice "01 / NOME" à esquerda, etiqueta + título à direita."""
    t = tabela(doc, 1, 2, [3.6, LARG - 3.6], linhas_h=False)
    esq, dir_ = t.rows[0].cells
    esq.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.BOTTOM
    for c in (esq, dir_):
        margens(c, 0, 0, 0, 0)
    pi = primeiro(esq)
    pi.paragraph_format.space_after = Pt(5)
    trecho(pi, num, 7.4, RED, M, negrito=True)
    trecho(pi, f" / {indice}", 7.4, MUTE, M, caixa_alta=True, espacado=0.6)
    pt = primeiro(dir_)
    etiqueta(pt, rotulo)
    ph = par(dir_, titulo, 24, NAVY, D_SEMI, antes=6, depois=0, entre=1.0, espacado=-0.6)
    ph.paragraph_format.keep_with_next = True
    if sub:
        par(dir_, sub, 10.4, SOFT, antes=5, depois=0)
    if quebra:  # parágrafo mínimo com quebra de página antes da tabela do cabeçalho
        marca = OxmlElement("w:p")
        ppr = OxmlElement("w:pPr")
        _set(ppr, "w:pageBreakBefore")
        _set(ppr, "w:spacing", **{"w:before": 0, "w:after": 0, "w:line": 20, "w:lineRule": "exact"})
        marca.append(ppr)
        t._tbl.addprevious(marca)
    par(doc, depois=12, entre=1.0)


# ── capa: fundo desenhado igual ao hero do site ──
def fundo_capa_png():
    from PIL import Image, ImageDraw
    px = 150 / 25.4
    W, H = round(210 * px), round(297 * px)

    def cor(h):
        return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))

    # linear-gradient(160deg, navy 0%, navy-900 58%, navy-950 100%)
    grad = Image.linear_gradient("L").resize((W * 2, H * 2)).rotate(-20, expand=False).crop((W // 2, H // 2, W // 2 + W, H // 2 + H))
    base = Image.new("RGB", (W, H), cor(NAVY95))
    meio = Image.composite(Image.new("RGB", (W, H), cor(NAVY9)), Image.new("RGB", (W, H), cor(NAVY)), grad.point(lambda v: min(255, int(v / 0.58))))
    img = Image.composite(base, meio, grad.point(lambda v: max(0, int((v - 148) / (255 - 148) * 255)) if v > 148 else 0))

    def radial(cx, cy, rx, ry, hexcor, alcance):
        m = Image.radial_gradient("L").resize((int(rx * 2), int(ry * 2)))
        m = m.point(lambda v: max(0, int(255 - v / alcance)))
        camada = Image.new("L", (W, H), 0)
        camada.paste(m, (int(cx - rx), int(cy - ry)))
        return Image.composite(Image.new("RGB", (W, H), cor(hexcor)), img, camada)

    img = radial(0.08 * W, 0.04 * H, 0.8 * W, 0.7 * H, "2C4D8C", 0.52)
    img = radial(1.02 * W, 1.02 * H, 0.7 * W, 0.9 * H, "16294C", 0.55)
    dr = ImageDraw.Draw(img, "RGBA")
    passo = 12 * px
    for k in range(int(max(W, H) / passo) + 1):  # grade, mais forte no alto à esquerda
        x, y = k * passo, k * passo
        if x <= W:
            dr.line([(x, 0), (x, H * 0.62)], fill=(255, 255, 255, 7), width=1)
        if y <= H * 0.62:
            dr.line([(0, y), (W, y)], fill=(255, 255, 255, 7), width=1)

    def losango(cx_mm, cy_mm, lado_mm, rgba, largura=2):
        h = lado_mm * 2 ** 0.5 / 2 * px
        cx, cy = cx_mm * px, cy_mm * px
        dr.polygon([(cx, cy - h), (cx + h, cy), (cx, cy + h), (cx - h, cy)], outline=rgba, width=largura)

    losango(178, 118, 132, (185, 200, 228, 36))
    losango(178, 118, 132 * 0.76, (254, 0, 0, 72))
    losango(178, 118, 132 * 0.40, (185, 200, 228, 26))
    # moldura de planta com marcas "+" vermelhas
    x0, y0, x1, y1 = 8 * px, 8 * px, W - 8 * px, H - 28 * px
    dr.rectangle([x0, y0, x1, y1], outline=(255, 255, 255, 36), width=1)
    t = 1.5 * px
    for (x, y) in ((x0, y0), (x1, y0), (x0, y1), (x1, y1)):
        dr.line([(x - t, y), (x + t, y)], fill=cor(RED), width=2)
        dr.line([(x, y - t), (x, y + t)], fill=cor(RED), width=2)
    # rodapé da capa igual ao das páginas
    yb = H - 14.5 * px
    dr.line([(20 * px, yb), (W - 20 * px, yb)], fill=(129, 144, 172, 90), width=1)
    buf = io.BytesIO()
    img.save(buf, format="PNG", optimize=True)
    buf.seek(0)
    return buf


def imagem_atras(p, png, largura_cm, altura_cm):
    run = p.add_run()
    inline = run.add_picture(png, width=Cm(largura_cm), height=Cm(altura_cm))._inline
    anchor = parse_xml(
        f'<wp:anchor {nsdecls("wp", "a", "pic", "r")} distT="0" distB="0" distL="0" distR="0" simplePos="0" '
        f'relativeHeight="0" behindDoc="1" locked="1" layoutInCell="1" allowOverlap="1">'
        f'<wp:simplePos x="0" y="0"/>'
        f'<wp:positionH relativeFrom="page"><wp:posOffset>0</wp:posOffset></wp:positionH>'
        f'<wp:positionV relativeFrom="page"><wp:posOffset>0</wp:posOffset></wp:positionV>'
        f'<wp:extent cx="{int(Cm(largura_cm))}" cy="{int(Cm(altura_cm))}"/>'
        f'<wp:effectExtent l="0" t="0" r="0" b="0"/><wp:wrapNone/>'
        f'<wp:docPr id="{inline.docPr.get("id")}" name="Fundo da capa"/><wp:cNvGraphicFramePr/>{inline.graphic.xml}</wp:anchor>'
    )
    inline.getparent().replace(inline, anchor)


def capa(doc, d):
    cli = d["contratante"].get("fantasia") or d["contratante"]["razaoSocial"]
    p0 = par(doc, "", depois=0, entre=1.0)
    imagem_atras(p0, fundo_capa_png(), 21.0, 29.7)
    p0.add_run().add_picture(str(RAIZ / "assets" / "logo-horizontal-white-2x.png"), width=Cm(5.0))
    pm = par(doc, "", antes=88, depois=20)
    etiqueta(pm, "Proposta de consultoria", RED_AC, 7)
    for txt in (d["norma"], d["contratante"]["cidade"].replace("/", " · ")):
        trecho(pm, "      ——  ", 6.8, LINE_NAVY, M)
        trecho(pm, txt, 6.8, ON_MUTE, M, caixa_alta=True, espacado=1)
    for txt, corx, contorno in (("Implantação da", "FFFFFF", False), (d["norma"], "C8D1E3", True), (f"na {cli}", RED, False)):
        ph = par(doc, "", depois=0)
        ph.paragraph_format.line_spacing = Pt(44)
        trecho(ph, txt, 44, corx, D_MED, espacado=-1.7, contorno=contorno)
    ps = par(doc, "", antes=24, depois=0)
    ps.paragraph_format.line_spacing = Pt(18.5)
    ps.paragraph_format.right_indent = Cm(4.2)
    trecho(ps, f"{d['titulo']} para a ", 12, ON_SOFT)
    trecho(ps, d["contratante"]["razaoSocial"], 12, "FFFFFF", B_SEMI)
    trecho(ps, ", da preparação da equipe até a auditoria de certificação.", 12, ON_SOFT)
    par(doc, "", antes=118, depois=0)
    ro = tabela(doc, 1, 1, [LARG], linhas_h=False)
    c = ro.rows[0].cells[0]
    sombra(c, PAINEL)
    caixa(c, LINE_NAVY, 4)
    margens(c, 0.45, 0.5, 0.55, 0.55)
    ph = primeiro(c)
    ph.paragraph_format.tab_stops.add_tab_stop(Cm(LARG - 1.15), WD_TAB_ALIGNMENT.RIGHT)
    borda_par(ph, "bottom", LINE_NAVY, 4, 7)
    trecho(ph, "Resumo da proposta", 6.8, ON_MUTE, M, caixa_alta=True, espacado=1.2)
    trecho(ph, "\t◆", 7, RED, "Segoe UI Symbol")
    meta = tabela(c, 1, 4, [4.6, 3.6, 3.6, 4.1], linhas_h=False)
    for cell, (k, v) in zip(meta.rows[0].cells, [("Proposta nº", d["numero"]), ("Data", data(d["data"])), ("Válida até", data(d["validade"])), ("Consultor", d["consultor"]["nome"])]):
        margens(cell, 0.3, 0, 0, 0.2)
        trecho(primeiro(cell), k, 6.4, ON_MUTE, M, caixa_alta=True, espacado=1)
        par(cell, v, 10.5, "FFFFFF", D_SEMI, depois=0, antes=2)
    pr = par(doc, "", antes=112, depois=0)  # rodapé da capa: logo abaixo da linha desenhada no fundo
    pr.paragraph_format.tab_stops.add_tab_stop(Cm(LARG), WD_TAB_ALIGNMENT.RIGHT)
    trecho(pr, "Anders ", 6.4, MUTE, M, caixa_alta=True, espacado=0.6)
    trecho(pr, "Tech", 6.4, RED, M, negrito=True, caixa_alta=True, espacado=0.6)
    trecho(pr, f" · Proposta {d['numero']}\tanderstech.net · {d['contratado']['telefone']} · 1", 6.4, MUTE, M, caixa_alta=True, espacado=0.6)


def rodape(secao_, d):
    secao_.footer.is_linked_to_previous = False
    secao_.footer_distance = Cm(0.9)
    p = secao_.footer.paragraphs[0]
    p.paragraph_format.space_after = Pt(0)
    for pos in (4680, 9360):  # tabulações do estilo "Footer" colavam o texto da direita
        p.paragraph_format.tab_stops.add_tab_stop(Twips(pos), WD_TAB_ALIGNMENT.CLEAR)
    p.paragraph_format.tab_stops.add_tab_stop(Cm(LARG), WD_TAB_ALIGNMENT.RIGHT)
    borda_par(p, "top", "C5CCD8", 4, 6)
    trecho(p, "Anders ", 6.4, MUTE, M, caixa_alta=True, espacado=0.6)
    trecho(p, "Tech", 6.4, RED, M, negrito=True, caixa_alta=True, espacado=0.6)
    trecho(p, f" · Proposta {d['numero']}\tanderstech.net · {d['contratado']['telefone']} · ", 6.4, MUTE, M, caixa_alta=True, espacado=0.6)
    campo(p, "PAGE", 6.4, MUTE)
    trecho(p, "/", 6.4, MUTE, M)
    campo(p, "NUMPAGES", 6.4, MUTE)


# ── seções ──
def resumo(doc, d, total_h):
    cli = d["contratante"].get("fantasia") or d["contratante"]["razaoSocial"]
    cabecalho_secao(doc, "01", "Resumo", "O que vocês recebem", f"O que a {cli} vai receber", quebra=False)
    stats = [("Carga horária", horas(total_h), "de trabalho presencial na empresa"), ("Prazo", f"{d['resultado']['prazoMeses']} meses", "até a auditoria de certificação"),
             ("Método", f"{len(d['cronograma'])} etapas", "do treinamento à certificação"), ("Sistema", d["prismabiz"]["nome"] if d.get("prismabiz") else "—", "licença vitalícia incluída")]
    t = tabela(doc, 1, 4, [LARG / 4] * 4, linhas_h=False)
    for i, (cell, (k, v, s)) in enumerate(zip(t.rows[0].cells, stats)):
        caixa(cell, LINE, 4)
        margens(cell, 0.45, 0.45, 0.4, 0.3)
        etiqueta(primeiro(cell), k, MUTE, 6.6)
        par(cell, v, 18, NAVY, D_SEMI, antes=6, depois=2, entre=1.0, espacado=-0.5)
        par(cell, s, 8, SOFT, depois=0, entre=1.2)
    par(doc, depois=12, entre=1.0)
    for e in d.get("entregas", []):
        p = par(doc, "", depois=8, entre=1.4)
        p.paragraph_format.left_indent = Cm(0.7)
        p.paragraph_format.first_line_indent = Cm(-0.7)
        borda_par(p, "bottom", LINE_SOFT, 4, 8)
        losango(p, RED, 7)
        trecho(p, e, 10.4, SOFT)
    if d.get("nota"):
        par(doc, depois=14, entre=1.0)
        n = tabela(doc, 1, 1, [LARG], linhas_h=False)
        cell = n.rows[0].cells[0]
        bordas(cell, left=(NAVY, 24))
        margens(cell, 0.05, 0.05, 0.6, 0)
        trecho(primeiro(cell), d["nota"]["titulo"], 12, NAVY, D_SEMI)
        par(cell, d["nota"]["texto"], 9.2, SOFT, antes=4, depois=0, entre=1.4)


def etapas(doc, d):
    cabecalho_secao(doc, "02", "Como funciona", "Do treinamento à certificação", f"{len(d['cronograma'])} etapas, no ritmo da produção")
    painel = tabela(doc, 1, 1, [LARG], linhas_h=False)
    pc = painel.rows[0].cells[0]
    sombra(pc, NAVY95)
    margens(pc, 0.6, 0.6, 0.6, 0.6)
    n = len(d["cronograma"])
    linhas_ = (n + 1) // 2
    t = tabela(pc, linhas_, 2, [7.8, 7.8], linhas_h=False, espaco=0.35)
    for i, f in enumerate(d["cronograma"]):
        row = t.rows[i // 2]
        linha(row)
        cell = row.cells[i % 2]
        if i == n - 1 and n % 2:
            cell = row.cells[0].merge(row.cells[1])
        sombra(cell, PAINEL)
        caixa(cell, LINE_NAVY, 4)
        margens(cell, 0.5, 0.45, 0.5, 0.5)
        trecho(primeiro(cell), f"{i + 1:02d}", 8, RED_AC, M, espacado=0.8)
        par(cell, f["fase"], 13, "FFFFFF", D_SEMI, antes=5, depois=4, entre=1.05)
        par(cell, f.get("descricao", ""), 8.8, ON_SOFT, depois=8, entre=1.45)
        po = par(cell, f"Carga: {horas(sum(x['horas'] for x in f['itens']))}", 7, ON_MUTE, M, depois=0)
        borda_par(po, "top", LINE_NAVY, 4, 6)
    pc.paragraphs[-1].paragraph_format.space_after = Pt(0)
    par(doc, f"Encontros presenciais na empresa, com agenda {d['agenda']} O cronograma detalhado, atividade por atividade, vem a seguir.", 8.4, MUTE, antes=10)


def cronograma(doc, d, total_h):
    cabecalho_secao(doc, "03", "Cronograma", "Atividade por atividade", "Cronograma detalhado")
    n = 1 + sum(1 + len(f["itens"]) for f in d["cronograma"]) + 1
    t = tabela(doc, n, 2, [14.6, 2.4])
    cab = t.rows[0]
    linha(cab, cabecalho=True)
    for i, (cell, txt) in enumerate(zip(cab.cells, ("Atividade", "Horas"))):
        sombra(cell, PAPER)
        bordas(cell, bottom=(NAVY, 6))
        p = primeiro(cell)
        if i:
            p.alignment = R_
        trecho(p, txt, 6.6, MUTE, M, caixa_alta=True, espacado=1)
    r = 0
    for fi, f in enumerate(d["cronograma"], 1):
        r += 1
        row = t.rows[r]
        linha(row)
        for cell in row.cells:
            margens(cell, 0.3, 0.12, 0.25, 0.25)
            bordas(cell, bottom=(LINE, 4))
        p = primeiro(row.cells[0])
        p.paragraph_format.keep_with_next = True
        trecho(p, f"{fi:02d}    ", 7.6, RED, M, negrito=True)
        trecho(p, f["fase"], 10, NAVY, D_SEMI)
        ph = primeiro(row.cells[1])
        ph.alignment = R_
        trecho(ph, horas(sum(i["horas"] for i in f["itens"])), 10, NAVY, D_SEMI)
        for i in f["itens"]:
            r += 1
            row = t.rows[r]
            linha(row)
            p = primeiro(row.cells[0])
            trecho(p, i["atividade"], 9)
            if i["tipo"] == "auditoria":
                trecho(p, " · auditoria", 9, MUTE)
            ph = primeiro(row.cells[1])
            ph.alignment = R_
            trecho(ph, horas(i["horas"]), 9)
    row = t.rows[-1]
    for i, (cell, txt) in enumerate(zip(row.cells, ("Total", horas(total_h)))):
        bordas(cell, top=(NAVY, 6))
        margens(cell, 0.3, 0.1, 0.25, 0.25)
        p = primeiro(cell)
        if i:
            p.alignment = R_
        trecho(p, txt, 10.5, NAVY, D_SEMI)


def prisma(doc, d):
    x = d.get("prismabiz")
    if not x:
        return
    cabecalho_secao(doc, "04", "Sistema", "Incluído na proposta", x["titulo"])
    par(doc, x["oQueE"], 8.8, SOFT, depois=8, entre=1.35)
    t = tabela(doc, len(x["requisitos"]) + 1, 2, [7.8, 9.2])
    linha(t.rows[0], cabecalho=True)
    for cell, txt in zip(t.rows[0].cells, ("Requisito da ISO 9001", f"Onde fica no {x['nome']}")):
        sombra(cell, PAPER)
        bordas(cell, bottom=(NAVY, 6))
        trecho(primeiro(cell), txt, 6.6, MUTE, M, caixa_alta=True, espacado=1)
    for row, (rq, md) in zip(t.rows[1:], x["requisitos"]):
        linha(row)
        for cell in row.cells:
            margens(cell, 0.03, 0.03, 0.25, 0.25)
        a, b = primeiro(row.cells[0]), primeiro(row.cells[1])
        a.paragraph_format.line_spacing = b.paragraph_format.line_spacing = 1.0
        trecho(a, rq, 7.5, NAVY, B_MED)
        trecho(b, md, 7.5, SOFT)
    par(doc, depois=6, entre=1.0)
    lay = tabela(doc, 1, 2, [8.35, 8.35], linhas_h=False, espaco=0.3)
    linha(lay.rows[0])
    esq, dir_ = lay.rows[0].cells
    caixa(esq, LINE, 4)
    margens(esq, 0.45, 0.45, 0.5, 0.5)
    etiqueta(primeiro(esq), "Na prática", MUTE, 6.6)
    par(esq, x["naPratica"], 8.4, SOFT, antes=4, depois=0, entre=1.35)
    sombra(dir_, NAVY95)
    margens(dir_, 0.45, 0.45, 0.5, 0.5)
    etiqueta(primeiro(dir_), "Licença vitalícia", RED_AC, 6.6)
    par(dir_, f"Plano {x['licenca']['plano']}", 15, "FFFFFF", D_SEMI, antes=5, depois=3, entre=1.0)
    par(dir_, x["licenca"]["texto"], 8.4, ON_SOFT, depois=6, entre=1.35)
    pr = par(dir_, f"Valor de referência hoje: {moeda(x['licenca']['valorMensal'])} por mês", 7, "FFFFFF", M, depois=0)
    borda_par(pr, "top", LINE_NAVY, 4, 6)


def investimento(doc, d, linhas, total_h, total, avista):
    nome = d["prismabiz"]["nome"] if d.get("prismabiz") else "sistema"
    cabecalho_secao(doc, "05", "Investimento", "Valores e pagamento", "Investimento", f"{horas(total_h)} de trabalho presencial, com o {nome} incluído.")
    vh = d["investimento"]["valorHora"]
    t = tabela(doc, len(linhas) + 2, 4, [6.4, 3.4, 2.8, 4.4])
    for i, (cell, txt) in enumerate(zip(t.rows[0].cells, ("Descrição", "Valor hora", "Horas", "Valor total"))):
        sombra(cell, PAPER)
        bordas(cell, bottom=(NAVY, 6))
        p = primeiro(cell)
        if i:
            p.alignment = R_
        trecho(p, txt, 6.6, MUTE, M, caixa_alta=True, espacado=1)
    for row, l in zip(t.rows[1:-1], linhas):
        for i, (cell, v) in enumerate(zip(row.cells, (l["descricao"], moeda(vh), horas(l["horas"]), moeda(l["valor"])))):
            p = primeiro(cell)
            if i:
                p.alignment = R_
            trecho(p, v, 9.6)
    for i, (cell, v) in enumerate(zip(t.rows[-1].cells, ("Total", "", horas(total_h), moeda(total)))):
        bordas(cell, top=(NAVY, 6))
        p = primeiro(cell)
        if i:
            p.alignment = R_
        trecho(p, v, 10.5, NAVY, D_SEMI)
    par(doc, depois=12, entre=1.0)
    pg = d["pagamento"]
    lay = tabela(doc, 1, 2, [9.2, 7.5], linhas_h=False, espaco=0.3)
    linha(lay.rows[0])
    esq, dir_ = lay.rows[0].cells
    if pg.get("parcelado"):
        pc = pg["parcelado"]
        caixa(esq, LINE, 4)
        margens(esq, 0.5, 0.5, 0.5, 0.5)
        p = primeiro(esq)
        trecho(p, " 1 ", 8.5, "FFFFFF", D, negrito=True, fundo=NAVY)
        trecho(p, f"   {pc['titulo']}", 11, NAVY, D_SEMI)
        pr = tabela(esq, len(pc["parcelas"]) + 1, 3, [1.8, 3.6, 2.8])
        for i, (cell, txt) in enumerate(zip(pr.rows[0].cells, ("Parcela", "Vencimento", "Valor"))):
            sombra(cell, PAPER)
            bordas(cell, bottom=(NAVY, 6))
            pp = primeiro(cell)
            if i == 2:
                pp.alignment = R_
            trecho(pp, txt, 6.4, MUTE, M, caixa_alta=True, espacado=0.8)
        for n_, (row, x) in enumerate(zip(pr.rows[1:], pc["parcelas"]), 1):
            for i, (cell, v) in enumerate(zip(row.cells, (f"{n_}ª", data(x["vencimento"]), moeda(x["valor"])))):
                margens(cell, 0.07, 0.07, 0.25, 0.25)
                pp = primeiro(cell)
                if i == 2:
                    pp.alignment = R_
                trecho(pp, v, 8.6)
        if pc.get("observacao"):
            par(esq, pc["observacao"], 7.8, MUTE, antes=4, depois=0)
    av = pg.get("avista")
    if av:
        sombra(dir_, NAVY95)
        margens(dir_, 0.5, 0.5, 0.55, 0.55)
        p = primeiro(dir_)
        trecho(p, " 2 ", 8.5, "FFFFFF", D, negrito=True, fundo=RED)
        trecho(p, f"   À vista, com {av['descontoPct']}% de {av['rotulo']}", 11, "FFFFFF", D_SEMI)
        par(dir_, f"De {moeda(total)} por", 9, ON_SOFT, antes=10, depois=0)
        par(dir_, moeda(avista), 28, "FFFFFF", D_SEMI, depois=10, entre=1.0, espacado=-0.8)
        trecho(par(dir_, "", depois=0), f"  Condição válida até {data(av['ate'])}  ", 7, "FFFFFF", M, caixa_alta=True, espacado=0.6, fundo=RED)
    par(doc, depois=14, entre=1.0)
    v = tabela(doc, 1, 1, [LARG], linhas_h=False)
    cell = v.rows[0].cells[0]
    sombra(cell, PAPER)
    margens(cell, 0.4, 0.4, 0.5, 0.5)
    p = primeiro(cell)
    etiqueta(p, "Validade", MUTE, 6.6)
    trecho(p, "      Esta proposta vale até ", 9.6)
    trecho(p, data_extenso(d["validade"]), 9.6, NAVY, B_SEMI)
    trecho(p, ".", 9.6)
    k = d["consultor"]
    par(doc, depois=10, entre=1.0)
    ct = tabela(doc, 1, 2, [2.1, LARG - 2.1], linhas_h=False)
    linha(ct.rows[0])
    av_, info = ct.rows[0].cells
    for x in (av_, info):
        bordas(x, top=(LINE, 4), bottom=(LINE, 4))
    bordas(info, right=(LINE, 4))
    margens(av_, 0.4, 0.4, 0.4, 0.2)
    av_.vertical_alignment = info.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
    quad = tabela(av_, 1, 1, [1.4], linhas_h=False)
    qc = quad.rows[0].cells[0]
    linha(quad.rows[0], altura=1.4, exata=True)
    sombra(qc, NAVY95)
    bordas(qc, bottom=(RED, 24))
    qc.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
    pq = primeiro(qc)
    pq.alignment = C_
    trecho(pq, "".join(x[0] for x in k["nome"].split()[:2]), 12, "FFFFFF", D, negrito=True)
    margens(info, 0.35, 0.35, 0.3, 0.4)
    etiqueta(primeiro(info), "Consultor responsável", MUTE, 6.6)
    par(info, k["nome"], 12, NAVY, D_SEMI, antes=3, depois=0)
    pc_ = par(info, k["cargo"], 8.8, SOFT, depois=0)
    if k.get("cvUrl"):
        trecho(pc_, " · ", 8.8, SOFT)
        link(pc_, k["cvUrl"], "ver currículo", 8.8)


def contrato(doc, d):
    k, a, b = d["contrato"], d["contratado"], d["contratante"]
    cabecalho_secao(doc, "06", "Contrato", "Prestação de serviços", k["titulo"])
    t = tabela(doc, 1, 2, [8.35, 8.35], linhas_h=False, espaco=0.3)
    for cell, (tit, p_, campos) in zip(t.rows[0].cells, (
            ("Contratante", b, [("CNPJ", b["cnpj"]), ("Endereço", ", ".join(x for x in (b.get("endereco"), b.get("cidade")) if x)), ("Contato", b.get("contato")), ("Telefone", b.get("telefone")), ("E-mail", b.get("email"))]),
            ("Contratado", a, [("CNPJ", a["cnpj"]), ("Endereço", f"{a['endereco']}, {a['cidade']}"), ("Consultor", a.get("consultor")), ("Telefone", a.get("telefone")), ("E-mail", a.get("email"))]))):
        caixa(cell, LINE, 4)
        margens(cell, 0.45, 0.45, 0.5, 0.45)
        etiqueta(primeiro(cell), tit, RED, 6.6)
        par(cell, p_["razaoSocial"], 10, NAVY, D_SEMI, antes=5, depois=5, entre=1.15)
        for kk, v in campos:
            if v:
                pk = par(cell, "", depois=1.5, entre=1.2)
                trecho(pk, f"{kk.upper()}  ", 6.4, MUTE, M, espacado=0.5)
                trecho(pk, v, 7.8, SOFT)
    par(doc, depois=6, entre=1.0)
    par(doc, " ".join(p["texto"] for p in k["preambulo"] if not p.get("rotulo")), 8.8, alinhar=J, depois=4, entre=1.4)
    for s in k["secoes"]:
        h = par(doc, s["titulo"], 7.2, NAVY, M, negrito=True, antes=9, depois=3, caixa_alta=True, espacado=1.2)
        h.paragraph_format.keep_with_next = True
        for c in s["clausulas"]:
            p = par(doc, "", alinhar=J, depois=3, entre=1.4)
            p.paragraph_format.keep_together = True
            trecho(p, f"{c['rotulo']}. ", 8.8, INK, B_SEMI)
            trecho(p, c["texto"], 8.8)
            itens = c.get("itens") or []
            if itens:
                p.paragraph_format.keep_with_next = True
            for n, it in enumerate(itens):
                pi = par(doc, "", alinhar=J, depois=1, entre=1.4)
                pi.paragraph_format.left_indent = Cm(1.0)
                pi.paragraph_format.first_line_indent = Cm(-0.5)
                pi.paragraph_format.keep_with_next = n < len(itens) - 1
                trecho(pi, f"{'abcdefgh'[n]}.  ", 8.8, SOFT)
                trecho(pi, it, 8.8)
            if c.get("paragrafo"):
                pp = par(doc, "", alinhar=J, depois=3, entre=1.4)
                trecho(pp, "Parágrafo único. ", 8.8, INK, B_SEMI)
                trecho(pp, c["paragrafo"], 8.8)
    par(doc, k["fecho"], 8.8, alinhar=J, antes=6, entre=1.4)
    par(doc, k["localData"], 9.4, NAVY, D_SEMI, antes=6, depois=30).paragraph_format.keep_with_next = True
    t = tabela(doc, 2, 2, [8.0, 8.0], linhas_h=False)
    pessoas = [("Contratante", b["razaoSocial"], f"CNPJ {b['cnpj']}"), ("Contratado", a["razaoSocial"], f"CNPJ {a['cnpj']}"), ("Testemunha 1", "Nome:", "CPF:"), ("Testemunha 2", "Nome:", "CPF:")]
    for i, (tit, nome, docu) in enumerate(pessoas):
        row = t.rows[i // 2]
        linha(row, altura=2.7)
        cell = row.cells[i % 2]
        bordas(cell, top=(NAVY, 6))
        margens(cell, 0.2, 0.6, 0 if i % 2 == 0 else 0.5, 0.5 if i % 2 == 0 else 0)
        etiqueta(primeiro(cell), tit, MUTE, 6.6)
        par(cell, nome, 7.8, SOFT, antes=2, depois=0, entre=1.2)
        par(cell, docu, 7.8, SOFT, depois=0)
    pw = par(doc, "", antes=26, depois=0, entre=1.0)
    borda_par(pw, "top", LINE, 4, 10)
    trecho(pw, "anders", 26, NAVY95, D, negrito=True, espacado=-1.3)
    trecho(pw, "tech", 26, RED, D, negrito=True, espacado=-1.3)
    par(doc, "Gestão com tecnologia · Qualidade & conformidade para a indústria", 6.8, MUTE, M, antes=4, depois=0, caixa_alta=True, espacado=1.3)


def main():
    if len(sys.argv) < 2:
        sys.exit("uso: python scripts/proposta/gerar_docx.py <dados.json> [saida.docx]")
    entrada = Path(sys.argv[1])
    saida = Path(sys.argv[2]) if len(sys.argv) > 2 else entrada.with_suffix(".docx")
    d = json.loads(entrada.read_text(encoding="utf-8"))
    linhas, total_h, total, avista = calcular(d)
    if d["investimento"].get("totalEsperado") is not None and abs(total - d["investimento"]["totalEsperado"]) > 0.009:
        sys.exit(f"cronograma soma {total_h} h ({moeda(total)}), diferente do investimento combinado")

    doc = Document()
    st = doc.styles["Normal"]
    st.font.name, st.font.size = B, Pt(9.6)
    for atr in ("w:cs", "w:eastAsia"):
        st.element.rPr.rFonts.set(qn(atr), B)
    st.paragraph_format.space_after = Pt(0)
    doc.core_properties.title = f"Proposta {d['numero']}"
    doc.core_properties.author = "Anders Tech"
    for vazio in list(doc.paragraphs):
        vazio._p.getparent().remove(vazio._p)

    s1 = doc.sections[0]
    s1.page_width, s1.page_height = Cm(21), Cm(29.7)
    s1.top_margin, s1.bottom_margin = Cm(2.2), Cm(0.5)
    s1.left_margin = s1.right_margin = Cm(2.0)
    s1.header_distance = s1.footer_distance = Cm(0)
    capa(doc, d)

    s2 = doc.add_section(WD_SECTION.NEW_PAGE)
    quebra = doc.paragraphs[-1]  # parágrafo da quebra criado pelo add_section: 1 pt, sem empurrar página
    quebra.paragraph_format.space_before = quebra.paragraph_format.space_after = Pt(0)
    quebra.paragraph_format.line_spacing = Pt(1)
    _set(_set(quebra._p.get_or_add_pPr(), "w:rPr"), "w:sz", **{"w:val": 2})
    s2.top_margin, s2.bottom_margin = Cm(2.0), Cm(2.4)
    s2.left_margin = s2.right_margin = Cm(2.0)
    s2.header_distance = Cm(1.0)
    rodape(s2, d)
    resumo(doc, d, total_h)
    etapas(doc, d)
    cronograma(doc, d, total_h)
    prisma(doc, d)
    investimento(doc, d, linhas, total_h, total, avista)
    contrato(doc, d)
    doc.save(saida)
    print(f"DOCX: {saida}")


if __name__ == "__main__":
    main()
