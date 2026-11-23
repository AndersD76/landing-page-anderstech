"""Versão editável (.docx) da proposta comercial — mesmo JSON do gerar.mjs.

Uso:  python scripts/proposta/gerar_docx.py <dados.json> [saida.docx]

Criada em 23/11/2026 a pedido do Anders: o PDF vai ao cliente; o .docx é para
ele editar no Word. Mesma ordem do PDF (o que o cliente recebe → como vamos
trabalhar → cronograma → sistema → investimento → contrato), sem preço no começo
e sem QR. Usa só o que o Word faz bem: tabelas sombreadas, sem posição absoluta.
Fonte Poppins: o Word só a mostra se estiver instalada (Medium e SemiBold
aparecem como famílias próprias). Requer: pip install python-docx
"""
import json
import sys
from pathlib import Path

from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ROW_HEIGHT_RULE, WD_CELL_VERTICAL_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_TAB_ALIGNMENT
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Pt, RGBColor, Twips

RAIZ = Path(__file__).resolve().parents[2]
NAVY, NAVY3, RED, PAPER = "0B1730", "203864", "FE0000", "F4F6FA"
INK, SOFT, MUTE, LINE, CLARO = "16233F", "46577A", "8190AC", "DFE5EE", "B9C8E4"
F, F_MED, F_SEMI = "Poppins", "Poppins Medium", "Poppins SemiBold"
LARG = 17.0  # cm úteis (A4 com 2 cm de cada lado)
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
    total_h = sum(l["horas"] for l in linhas)
    total = sum(l["valor"] for l in linhas)
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


def margens(cell, t=0.12, b=0.12, l=0.25, r=0.25):
    m = _set(cell._tc.get_or_add_tcPr(), "w:tcMar")
    for lado, v in (("top", t), ("left", l), ("bottom", b), ("right", r)):
        _set(m, f"w:{lado}", **{"w:w": int(v * 567), "w:type": "dxa"})


def tabela(alvo, linhas, colunas, larguras, linhas_h=True, espaco=0):
    try:
        t = alvo.add_table(linhas, colunas)
    except TypeError:  # cabeçalho/rodapé exige largura
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
        _set(b, f"w:{lado}", **{"w:val": "single" if com else "nil", "w:sz": 4, "w:color": LINE, "w:space": 0})
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


def par(alvo, texto="", tam=9.6, cor=INK, fonte=F, negrito=False, alinhar=None, antes=0, depois=4, entre=1.2, **kw):
    p = alvo.add_paragraph()
    pf = p.paragraph_format
    pf.space_before, pf.space_after, pf.line_spacing = Pt(antes), Pt(depois), entre
    if alinhar is not None:
        p.alignment = alinhar
    if texto:
        trecho(p, texto, tam, cor, fonte, negrito, **kw)
    return p


def trecho(p, texto, tam=9.6, cor=INK, fonte=F, negrito=False, caixa_alta=False, espacado=0, fundo=None):
    r = p.add_run(texto)
    r.font.size, r.font.name, r.font.bold = Pt(tam), fonte, negrito
    r.font.color.rgb = RGBColor.from_string(cor)
    rPr = r._r.get_or_add_rPr()
    rPr.rFonts.set(qn("w:cs"), fonte)
    if caixa_alta:
        r.font.all_caps = True
    if espacado:
        _set(rPr, "w:spacing", **{"w:val": int(espacado * 20)})
    if fundo:
        _set(rPr, "w:shd", **{"w:val": "clear", "w:color": "auto", "w:fill": fundo})
    return r


def primeiro(cell):
    """Primeiro parágrafo da célula, sem espaço extra."""
    p = cell.paragraphs[0]
    p.paragraph_format.space_after = Pt(0)
    p.paragraph_format.line_spacing = 1.2
    return p


def losango(p, cor=RED, tam=8):
    return trecho(p, "◆  ", tam, cor, "Segoe UI Symbol")


def borda_par(p, lado, cor, tam, espaco=4):
    _set(_set(p._p.get_or_add_pPr(), "w:pBdr"), f"w:{lado}", **{"w:val": "single", "w:sz": tam, "w:color": cor, "w:space": espaco})


def secao(doc, num, rotulo, titulo, quebra=True):
    p = par(doc, depois=1)
    p.paragraph_format.page_break_before = quebra
    p.paragraph_format.keep_with_next = True
    losango(p, tam=7)
    trecho(p, f"{num} · {rotulo}", 7.6, RED, F_SEMI, caixa_alta=True, espacado=1.2)
    par(doc, titulo, 18, NAVY, F_SEMI, depois=12, entre=1.05).paragraph_format.keep_with_next = True


def campo(p, instr, tam, cor):
    r = trecho(p, "", tam, cor)
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
    r = trecho(p, texto, tam, NAVY3)
    r.font.underline = True
    h.append(r._r)
    p._p.append(h)


# ── blocos ──
def rodape(secao_, d):
    secao_.footer.is_linked_to_previous = False
    secao_.footer_distance = Cm(0.9)
    p = secao_.footer.paragraphs[0]
    p.paragraph_format.space_after = Pt(0)
    # O estilo "Footer" traz tabulações em 4680 e 9360 twips; a central capturava
    # o texto da direita e o colava no da esquerda. Limpa as duas.
    for pos in (4680, 9360):
        p.paragraph_format.tab_stops.add_tab_stop(Twips(pos), WD_TAB_ALIGNMENT.CLEAR)
    p.paragraph_format.tab_stops.add_tab_stop(Cm(LARG), WD_TAB_ALIGNMENT.RIGHT)
    borda_par(p, "top", "C9D2E0", 4, 6)
    losango(p, tam=6)
    trecho(p, "ANDERS TECH", 7.4, MUTE, F_SEMI, espacado=0.8)
    trecho(p, f" · Proposta {d['numero']}\t", 7.4, MUTE)
    trecho(p, f"anderstech.net · {d['contratado']['telefone']} · página ", 7.4, MUTE)
    campo(p, "PAGE", 7.4, MUTE)
    trecho(p, " de ", 7.4, MUTE)
    campo(p, "NUMPAGES", 7.4, MUTE)


def capa(doc, d):
    t = tabela(doc, 1, 1, [21.0], linhas_h=False)
    _set(t._tbl.tblPr, "w:tblInd", **{"w:w": 0, "w:type": "dxa"})
    linha(t.rows[0], altura=29.3, exata=True)
    c = t.rows[0].cells[0]
    sombra(c, NAVY)
    margens(c, 2.0, 1.0, 2.0, 2.0)
    topo = tabela(c, 1, 2, [9.0, 8.0], linhas_h=False)
    lg, nm = topo.rows[0].cells
    for x in (lg, nm):
        margens(x, 0, 0, 0, 0)
    primeiro(lg).add_run().add_picture(str(RAIZ / "assets" / "logo-horizontal-white-2x.png"), width=Cm(5.8))
    pn = primeiro(nm)
    pn.alignment = R_
    trecho(pn, "PROPOSTA Nº", 7, CLARO, espacado=1.5)
    par(nm, d["numero"], 10, "FFFFFF", F_SEMI, alinhar=R_, depois=0)
    c.paragraphs[0]._p.getparent().remove(c.paragraphs[0]._p)
    par(c, "", depois=0, antes=150)
    pt = par(c, "", depois=14)
    trecho(pt, "  ◆  ", 8, "FFFFFF", "Segoe UI Symbol", fundo=RED)
    trecho(pt, "PROPOSTA DE CONSULTORIA  ", 8, "FFFFFF", F_SEMI, espacado=2, fundo=RED)
    par(c, d["titulo"], 28, "FFFFFF", F_SEMI, depois=10, entre=1.05)
    pn2 = par(c, "", depois=26)
    trecho(pn2, d["norma"], 15, "FFFFFF", F, negrito=True)
    borda_par(pn2, "bottom", RED, 24, 4)
    pp = par(c, "Preparada para ", 10.5, CLARO, depois=0, entre=1.35)
    trecho(pp, d["contratante"]["razaoSocial"], 10.5, "FFFFFF", F_SEMI)
    par(c, d["contratante"]["cidade"], 10.5, CLARO, depois=0)
    par(c, "", depois=0, antes=170)
    meta = tabela(c, 1, 3, [17.0 / 3] * 3, linhas_h=False)
    for cell, (k, v) in zip(meta.rows[0].cells, [("Data", data(d["data"])), ("Válida até", data(d["validade"])), ("Consultor", d["consultor"]["nome"])]):
        bordas(cell, top=("4B5A78", 4))
        margens(cell, 0.35, 0, 0, 0.2)
        trecho(primeiro(cell), k, 7, CLARO, caixa_alta=True, espacado=1.2)
        par(cell, v, 10.5, "FFFFFF", F_SEMI, depois=0)


def resumo(doc, d, total_h):
    secao(doc, "01", "Resumo", f"O que a {d['contratante'].get('fantasia') or d['contratante']['razaoSocial']} vai receber", quebra=False)
    tiles = [(horas(total_h), "de trabalho presencial na empresa"), (f"{d['resultado']['prazoMeses']} meses", "até a auditoria de certificação"),
             (f"{len(d['cronograma'])} etapas", "do treinamento à certificação"), (d["prismabiz"]["nome"] if d.get("prismabiz") else "—", "sistema da qualidade incluído")]
    t = tabela(doc, 1, 4, [LARG / 4] * 4, linhas_h=False, espaco=0.25)
    for cell, (v, s) in zip(t.rows[0].cells, tiles):
        sombra(cell, NAVY)
        bordas(cell, bottom=(RED, 24))
        margens(cell, 0.4, 0.4, 0.4, 0.3)
        trecho(primeiro(cell), v, 15, "FFFFFF", F_SEMI)
        par(cell, s, 7.8, CLARO, depois=0, antes=2, entre=1.15)
    par(doc, depois=10)
    for e in d.get("entregas", []):
        p = par(doc, "", depois=0, entre=1.35)
        p.paragraph_format.left_indent = Cm(0.7)
        p.paragraph_format.first_line_indent = Cm(-0.7)
        borda_par(p, "bottom", LINE, 4, 8)
        p.paragraph_format.space_after = Pt(8)
        losango(p, tam=8)
        trecho(p, e, 10.4)
    if d.get("nota"):
        par(doc, depois=12)
        n = tabela(doc, 1, 1, [LARG], linhas_h=False)
        cell = n.rows[0].cells[0]
        sombra(cell, PAPER)
        bordas(cell, left=(RED, 36))
        margens(cell, 0.45, 0.45, 0.6, 0.6)
        trecho(primeiro(cell), d["nota"]["titulo"], 10, NAVY, F_SEMI)
        par(cell, d["nota"]["texto"], 9, SOFT, depois=0, antes=3)


def etapas(doc, d):
    secao(doc, "02", "Como vamos trabalhar", f"{len(d['cronograma'])} etapas, do treinamento à certificação")
    t = tabela(doc, len(d["cronograma"]), 2, [1.8, LARG - 1.8], linhas_h=False, espaco=0.2)
    for i, (row, f) in enumerate(zip(t.rows, d["cronograma"]), 1):
        linha(row)
        n, txt = row.cells
        sombra(n, NAVY)
        bordas(n, bottom=(RED, 24))
        n.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
        pn = primeiro(n)
        pn.alignment = C_
        trecho(pn, f"{i:02d}", 12, "FFFFFF", F, negrito=True)
        sombra(txt, PAPER)
        margens(txt, 0.35, 0.35, 0.45, 0.45)
        pt = primeiro(txt)
        pt.paragraph_format.tab_stops.add_tab_stop(Cm(LARG - 1.8 - 0.95), WD_TAB_ALIGNMENT.RIGHT)
        trecho(pt, f["fase"], 11, NAVY, F_SEMI)
        trecho(pt, "\t" + horas(sum(x["horas"] for x in f["itens"])), 9, NAVY3, F_SEMI)
        par(txt, f.get("descricao", ""), 9.4, SOFT, depois=0, antes=2)
    par(doc, f"Os encontros são presenciais, na empresa, com agenda {d['agenda']} O cronograma detalhado, atividade por atividade, está nas próximas páginas.", 8.4, SOFT, antes=10)


def cronograma(doc, d, total_h):
    secao(doc, "03", "Cronograma detalhado", "Atividade por atividade")
    n = 1 + sum(1 + len(f["itens"]) for f in d["cronograma"]) + 1
    t = tabela(doc, n, 2, [14.6, 2.4])
    cab = t.rows[0]
    linha(cab, cabecalho=True)
    for i, (cell, txt) in enumerate(zip(cab.cells, ("Atividade", "Horas"))):
        sombra(cell, NAVY)
        p = primeiro(cell)
        if i:
            p.alignment = R_
        trecho(p, txt, 7.2, "FFFFFF", F_SEMI, caixa_alta=True, espacado=1)
    r = 0
    for fi, f in enumerate(d["cronograma"], 1):
        r += 1
        row = t.rows[r]
        linha(row)
        for cell in row.cells:
            sombra(cell, PAPER)
        p = primeiro(row.cells[0])
        p.paragraph_format.keep_with_next = True
        trecho(p, f"{fi:02d}   ", 9, RED, F, negrito=True)
        trecho(p, f["fase"], 9, NAVY, F_SEMI)
        ph = primeiro(row.cells[1])
        ph.alignment = R_
        trecho(ph, horas(sum(i["horas"] for i in f["itens"])), 9, NAVY, F_SEMI)
        for i in f["itens"]:
            r += 1
            row = t.rows[r]
            linha(row)
            p = primeiro(row.cells[0])
            trecho(p, i["atividade"], 9)
            if i["tipo"] == "auditoria":
                trecho(p, " (auditoria)", 9, MUTE)
            ph = primeiro(row.cells[1])
            ph.alignment = R_
            trecho(ph, horas(i["horas"]), 9)
    row = t.rows[-1]
    for i, (cell, txt) in enumerate(zip(row.cells, ("Total", horas(total_h)))):
        bordas(cell, top=(NAVY, 12))
        p = primeiro(cell)
        if i:
            p.alignment = R_
        trecho(p, txt, 9.2, NAVY, F, negrito=True)


def prisma(doc, d):
    x = d.get("prismabiz")
    if not x:
        return
    secao(doc, "04", "Sistema incluído", x["titulo"])
    par(doc, x["oQueE"], 8.8, depois=6, entre=1.2)
    par(doc, "Onde cada requisito da ISO 9001 fica no sistema", 10, NAVY, F_SEMI, depois=3).paragraph_format.keep_with_next = True
    t = tabela(doc, len(x["requisitos"]) + 1, 2, [7.8, 9.2])
    linha(t.rows[0], cabecalho=True)
    for cell, txt in zip(t.rows[0].cells, ("Requisito", f"No {x['nome']}")):
        sombra(cell, NAVY)
        trecho(primeiro(cell), txt, 7.2, "FFFFFF", F_SEMI, caixa_alta=True, espacado=1)
    for row, (rq, md) in zip(t.rows[1:], x["requisitos"]):
        linha(row)
        for cell in row.cells:
            margens(cell, 0.02, 0.02, 0.25, 0.25)
        a, b = primeiro(row.cells[0]), primeiro(row.cells[1])
        a.paragraph_format.line_spacing = b.paragraph_format.line_spacing = 1.0
        trecho(a, rq, 7.5, NAVY, F_MED)
        trecho(b, md, 7.5)
    par(doc, depois=2)
    lay = tabela(doc, 1, 2, [8.5, 8.5], linhas_h=False)
    linha(lay.rows[0])
    esq, dir_ = lay.rows[0].cells
    margens(esq, 0, 0, 0, 0.6)
    trecho(primeiro(esq), "O que muda na prática", 10, NAVY, F_SEMI)
    par(esq, x["naPratica"], 8.8, antes=2, entre=1.2)
    sombra(dir_, NAVY)
    margens(dir_, 0.4, 0.4, 0.5, 0.5)
    trecho(primeiro(dir_), "Licença vitalícia incluída", 7, CLARO, caixa_alta=True, espacado=1.2)
    par(dir_, f"Plano {x['licenca']['plano']}", 13, "FFFFFF", F_SEMI, antes=2, depois=4)
    par(dir_, x["licenca"]["texto"], 8.6, "DFE6F3", depois=6)
    pr = par(dir_, f"Valor de referência hoje: {moeda(x['licenca']['valorMensal'])} por mês", 8.4, "FFFFFF", F_SEMI, depois=0)
    borda_par(pr, "top", "4B5A78", 4, 4)


def investimento(doc, d, linhas, total_h, total, avista):
    secao(doc, "05", "Investimento", "Valores e forma de pagamento")
    nome = d["prismabiz"]["nome"] if d.get("prismabiz") else "sistema"
    par(doc, f"Valor das {horas(total_h)} de trabalho presencial, com o {nome} incluído.", 10, depois=8)
    vh = d["investimento"]["valorHora"]
    t = tabela(doc, len(linhas) + 2, 4, [6.4, 3.4, 2.8, 4.4])
    for i, (cell, txt) in enumerate(zip(t.rows[0].cells, ("Descrição", "Valor hora", "Horas", "Valor total"))):
        sombra(cell, NAVY)
        p = primeiro(cell)
        if i:
            p.alignment = R_
        trecho(p, txt, 7.2, "FFFFFF", F_SEMI, caixa_alta=True, espacado=1)
    corpo = [(l["descricao"], moeda(vh), horas(l["horas"]), moeda(l["valor"])) for l in linhas]
    for row, vals in zip(t.rows[1:-1], corpo):
        for i, (cell, v) in enumerate(zip(row.cells, vals)):
            p = primeiro(cell)
            if i:
                p.alignment = R_
            trecho(p, v, 9.6)
    for i, (cell, v) in enumerate(zip(t.rows[-1].cells, ("Total", "", horas(total_h), moeda(total)))):
        bordas(cell, top=(NAVY, 12))
        p = primeiro(cell)
        if i:
            p.alignment = R_
        trecho(p, v, 9.6, NAVY, F, negrito=True)
    par(doc, "Formas de pagamento", 10.5, NAVY, F_SEMI, antes=14, depois=6).paragraph_format.keep_with_next = True
    pg = d["pagamento"]
    lay = tabela(doc, 1, 2, [9.4, 7.6], linhas_h=False)
    linha(lay.rows[0])
    esq, dir_ = lay.rows[0].cells
    margens(esq, 0, 0, 0, 0.6)
    if pg.get("parcelado"):
        pc = pg["parcelado"]
        trecho(primeiro(esq), f"a) {pc['titulo']}", 9.6, NAVY, F_SEMI)
        pr = tabela(esq, len(pc["parcelas"]) + 1, 3, [2.0, 3.6, 3.2])
        for i, (cell, txt) in enumerate(zip(pr.rows[0].cells, ("Parcela", "Vencimento", "Valor"))):
            sombra(cell, NAVY)
            p = primeiro(cell)
            if i == 2:
                p.alignment = R_
            trecho(p, txt, 7.2, "FFFFFF", F_SEMI, caixa_alta=True, espacado=1)
        for n, (row, x) in enumerate(zip(pr.rows[1:], pc["parcelas"]), 1):
            for i, (cell, v) in enumerate(zip(row.cells, (f"{n}ª", data(x["vencimento"]), moeda(x["valor"])))):
                margens(cell, 0.07, 0.07, 0.25, 0.25)
                p = primeiro(cell)
                if i == 2:
                    p.alignment = R_
                trecho(p, v, 9)
        if pc.get("observacao"):
            par(esq, pc["observacao"], 8.2, SOFT, antes=4, depois=0)
    av = pg.get("avista")
    if av:
        sombra(dir_, NAVY)
        margens(dir_, 0.55, 0.55, 0.6, 0.6)
        trecho(primeiro(dir_), f"b) À vista, com {av['descontoPct']}% de {av['rotulo']}", 9.6, "FFFFFF", F_SEMI)
        par(dir_, f"De {moeda(total)} por", 9, CLARO, antes=10, depois=0)
        par(dir_, moeda(avista), 24, "FFFFFF", F, negrito=True, depois=8)
        pa = par(dir_, "", depois=0)
        trecho(pa, f"  Condição válida até {data(av['ate'])}  ", 8.6, "FFFFFF", F_SEMI, fundo=RED)
    par(doc, depois=12)
    v = tabela(doc, 1, 1, [LARG], linhas_h=False)
    cell = v.rows[0].cells[0]
    sombra(cell, PAPER)
    margens(cell, 0.35, 0.35, 0.5, 0.5)
    p = primeiro(cell)
    losango(p)
    trecho(p, "Esta proposta é válida até ")
    trecho(p, data_extenso(d["validade"]), 9.6, NAVY, F_SEMI)
    trecho(p, ".")
    k = d["consultor"]
    par(doc, depois=8)
    ct = tabela(doc, 1, 2, [1.9, LARG - 1.9], linhas_h=False)
    linha(ct.rows[0])
    av_, info = ct.rows[0].cells
    for x in (av_, info):
        bordas(x, top=(LINE, 4), bottom=(LINE, 4))
    sombra(av_, NAVY)
    bordas(av_, bottom=(RED, 24))
    av_.vertical_alignment = info.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
    pa = primeiro(av_)
    pa.alignment = C_
    trecho(pa, "".join(x[0] for x in k["nome"].split()[:2]), 12, "FFFFFF", F, negrito=True)
    margens(info, 0.3, 0.3, 0.5, 0.3)
    trecho(primeiro(info), "Consultor responsável", 7, MUTE, caixa_alta=True, espacado=1.2)
    par(info, k["nome"], 11, NAVY, F_SEMI, depois=0)
    pc = par(info, k["cargo"], 9, SOFT, depois=0)
    if k.get("cvUrl"):
        trecho(pc, " · ", 9, SOFT)
        link(pc, k["cvUrl"], "ver currículo")


def contrato(doc, d):
    k, a, b = d["contrato"], d["contratado"], d["contratante"]
    secao(doc, "06", "Contrato", k["titulo"])
    t = tabela(doc, 1, 2, [8.5, 8.5], linhas_h=False, espaco=0.3)
    for cell, (tit, p_, campos) in zip(t.rows[0].cells, (
            ("Contratante", b, [("CNPJ", b["cnpj"]), ("Endereço", ", ".join(x for x in (b.get("endereco"), b.get("cidade")) if x)), ("Contato", b.get("contato")), ("Telefone", b.get("telefone")), ("E-mail", b.get("email"))]),
            ("Contratado", a, [("CNPJ", a["cnpj"]), ("Endereço", f"{a['endereco']}, {a['cidade']}"), ("Consultor", a.get("consultor")), ("Telefone", a.get("telefone")), ("E-mail", a.get("email"))]))):
        sombra(cell, PAPER)
        bordas(cell, left=(NAVY3, 24))
        margens(cell, 0.35, 0.35, 0.45, 0.35)
        trecho(primeiro(cell), tit, 7, RED, F_SEMI, caixa_alta=True, espacado=1.4)
        par(cell, p_["razaoSocial"], 9, NAVY, F_SEMI, depois=4, antes=2, entre=1.15)
        for kk, v in campos:
            if v:
                pk = par(cell, "", depois=1, entre=1.15)
                trecho(pk, f"{kk}: ", 8, MUTE)
                trecho(pk, v, 8)
    par(doc, depois=4)
    par(doc, " ".join(p["texto"] for p in k["preambulo"] if not p.get("rotulo")), 8.8, alinhar=J, depois=4)
    for s in k["secoes"]:
        h = par(doc, s["titulo"], 8.6, NAVY, F_SEMI, antes=8, depois=3, caixa_alta=True, espacado=1)
        h.paragraph_format.keep_with_next = True
        for c in s["clausulas"]:
            p = par(doc, "", alinhar=J, depois=3, entre=1.3)
            p.paragraph_format.keep_together = True
            trecho(p, f"{c['rotulo']}: ", 8.8, NAVY, F, negrito=True)
            trecho(p, c["texto"], 8.8)
            itens = c.get("itens") or []
            if itens:
                p.paragraph_format.keep_with_next = True
            for n, it in enumerate(itens):
                pi = par(doc, "", alinhar=J, depois=1, entre=1.3)
                pi.paragraph_format.left_indent = Cm(1.0)
                pi.paragraph_format.first_line_indent = Cm(-0.5)
                pi.paragraph_format.keep_with_next = n < len(itens) - 1
                trecho(pi, f"{'abcdefgh'[n]})  ", 8.8, NAVY, F, negrito=True)
                trecho(pi, it, 8.8)
            if c.get("paragrafo"):
                pp = par(doc, "", alinhar=J, depois=3, entre=1.3)
                trecho(pp, "Parágrafo único: ", 8.8, NAVY, F, negrito=True)
                trecho(pp, c["paragrafo"], 8.8)
    par(doc, k["fecho"], 8.8, alinhar=J, antes=6, entre=1.3)
    par(doc, k["localData"], 8.8, NAVY, F_SEMI, antes=6, depois=30).paragraph_format.keep_with_next = True
    t = tabela(doc, 2, 2, [8.0, 8.0], linhas_h=False)
    pessoas = [("Contratante", b["razaoSocial"], f"CNPJ {b['cnpj']}"), ("Contratado", a["razaoSocial"], f"CNPJ {a['cnpj']}"), ("Testemunha 1", "Nome:", "CPF:"), ("Testemunha 2", "Nome:", "CPF:")]
    for i, (tit, nome, docu) in enumerate(pessoas):
        row = t.rows[i // 2]
        linha(row, altura=2.6)
        cell = row.cells[i % 2]
        bordas(cell, top=(NAVY, 8))
        margens(cell, 0.15, 0.6, 0 if i % 2 == 0 else 0.5, 0.5 if i % 2 == 0 else 0)
        trecho(primeiro(cell), tit, 7.4, NAVY, F_SEMI, caixa_alta=True, espacado=1.2)
        par(cell, nome, 8, SOFT, depois=0, entre=1.15)
        par(cell, docu, 8, SOFT, depois=0)


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
    st.font.name, st.font.size = F, Pt(9.6)
    for atr in ("w:cs", "w:eastAsia"):
        st.element.rPr.rFonts.set(qn(atr), F)
    st.paragraph_format.space_after = Pt(0)
    doc.core_properties.title = f"Proposta {d['numero']}"
    doc.core_properties.author = "Anders Tech"
    for vazio in list(doc.paragraphs):
        vazio._p.getparent().remove(vazio._p)

    # Seção 1: capa navy de ponta a ponta, sem margem e sem rodapé.
    s1 = doc.sections[0]
    s1.page_width, s1.page_height = Cm(21), Cm(29.7)
    s1.top_margin = s1.bottom_margin = s1.left_margin = s1.right_margin = Cm(0)
    s1.header_distance = s1.footer_distance = Cm(0)
    capa(doc, d)

    # Seção 2: o resto, com margens normais e rodapé de uma linha.
    s2 = doc.add_section(WD_SECTION.NEW_PAGE)
    # O add_section cria o parágrafo que carrega a quebra da seção 1: fica com
    # 1 pt de altura para caber sob a capa sem empurrar uma página em branco.
    quebra = doc.paragraphs[-1]
    quebra.paragraph_format.space_before = quebra.paragraph_format.space_after = Pt(0)
    quebra.paragraph_format.line_spacing = Pt(1)
    _set(_set(quebra._p.get_or_add_pPr(), "w:rPr"), "w:sz", **{"w:val": 2})
    s2.top_margin, s2.bottom_margin = Cm(1.8), Cm(2.4)
    s2.left_margin = s2.right_margin = Cm(2.0)
    s2.header_distance = Cm(1.0)
    rodape(s2, d)
    resumo(doc, d, total_h)
    etapas(doc, d)
    cronograma(doc, d, total_h)
    prisma(doc, d)
    investimento(doc, d, linhas, total_h, total, avista)
    contrato(doc, d)
    par(doc, "", tam=2, depois=0)
    doc.save(saida)
    print(f"DOCX: {saida}")


if __name__ == "__main__":
    main()
