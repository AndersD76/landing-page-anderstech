"""Versão editável (.docx) da proposta comercial — mesmo JSON do gerar.mjs.

Uso:  python scripts/proposta/gerar_docx.py <dados.json> [saida.docx]

Criada em 23/11/2026 a pedido do Anders: o PDF é o que vai ao cliente; o .docx é
para ele mexer no Word. Mesma identidade (CLAUDE.md §5) com o que o Word faz bem:
tabelas sombreadas em vez de posicionamento absoluto. Fonte Poppins: o Word só a
mostra se estiver instalada (no Word, Medium e SemiBold aparecem como famílias
próprias). Requer: pip install python-docx qrcode pillow
"""
import io
import json
import sys
from pathlib import Path

import qrcode
from docx import Document
from docx.enum.section import WD_SECTION
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ROW_HEIGHT_RULE, WD_CELL_VERTICAL_ALIGNMENT
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_BREAK
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Pt, RGBColor

RAIZ = Path(__file__).resolve().parents[2]
NAVY, NAVY2, NAVY3 = "0B1730", "12233F", "203864"
RED, PAPER, INK, SOFT, MUTE, LINE = "FE0000", "F4F6FA", "16233F", "46577A", "8190AC", "DFE5EE"
F, F_MED, F_SEMI = "Poppins", "Poppins Medium", "Poppins SemiBold"
LARG = 17.0  # cm úteis (A4 com 2 cm de cada lado)
TIPOS = {"consultoria": "Consultoria", "treinamento": "Treinamento", "auditoria": "Auditoria"}
MESES = ["janeiro", "fevereiro", "março", "abril", "maio", "junho", "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"]


def moeda(v):
    s = f"{v:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
    return f"R$ {s}"


def horas(h):
    return (f"{h:g}".replace(".", ",")) + " h"


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
    avista = round(total * (1 - av["descontoPct"] / 100), 2) if av else None
    return linhas, total_h, total, avista


# ── utilidades de XML ──
# O Word recusa o arquivo ("conteúdo ilegível") se os filhos de tcPr, rPr, pPr
# etc. saírem fora da ordem do esquema. Inserção sempre respeitando ORDEM.
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
    "rPr": _RPR,
    "pPr": _PPR,
}


def _local(tag):
    return tag.split("}")[1] if "}" in tag else tag


def _set(el, tag, **attrs):
    sub = el.find(qn(tag))
    if sub is None:
        sub = OxmlElement(tag)
        ordem = ORDEM.get(_local(el.tag))
        nome = tag.split(":")[1]
        antes_de = None
        if ordem and nome in ordem:
            pos = ordem.index(nome)
            for filho in el:
                n = _local(filho.tag)
                if n in ordem and ordem.index(n) > pos:
                    antes_de = filho
                    break
        if antes_de is not None:
            antes_de.addprevious(sub)
        else:
            el.append(sub)
    for k, v in attrs.items():
        sub.set(qn(k), str(v))
    return sub


def sombra(cell, cor):
    _set(cell._tc.get_or_add_tcPr(), "w:shd", **{"w:val": "clear", "w:color": "auto", "w:fill": cor})


def bordas_celula(cell, **lados):
    tcPr = cell._tc.get_or_add_tcPr()
    b = tcPr.find(qn("w:tcBorders"))
    if b is None:
        b = OxmlElement("w:tcBorders")
        tcPr.append(b)
    for lado, (cor, tam) in lados.items():
        _set(b, f"w:{lado}", **{"w:val": "single" if tam else "nil", "w:sz": tam, "w:color": cor, "w:space": 0})


def margens_celula(cell, t=0.12, b=0.12, l=0.25, r=0.25):
    tcPr = cell._tc.get_or_add_tcPr()
    m = _set(tcPr, "w:tcMar")
    for lado, v in (("top", t), ("left", l), ("bottom", b), ("right", r)):
        _set(m, f"w:{lado}", **{"w:w": int(v * 567), "w:type": "dxa"})


def tabela(doc_ou_cell, linhas, colunas, larguras, bordas="linhas"):
    try:
        t = doc_ou_cell.add_table(linhas, colunas)
    except TypeError:  # cabeçalho/rodapé exige largura
        t = doc_ou_cell.add_table(linhas, colunas, Cm(sum(larguras)))
    t.alignment = WD_TABLE_ALIGNMENT.CENTER
    t.autofit = False
    for i, col in enumerate(t.columns):
        col.width = Cm(larguras[i])
    tblPr = t._tbl.tblPr
    _set(tblPr, "w:tblW", **{"w:w": int(sum(larguras) * 567), "w:type": "dxa"})
    _set(tblPr, "w:tblLayout", **{"w:type": "fixed"})
    b = _set(tblPr, "w:tblBorders")
    for lado in ("top", "left", "bottom", "right", "insideH", "insideV"):
        com = bordas == "linhas" and lado in ("insideH", "bottom")
        _set(b, f"w:{lado}", **{"w:val": "single" if com else "nil", "w:sz": 4, "w:color": LINE, "w:space": 0})
    for row in t.rows:
        for i, cell in enumerate(row.cells):
            cell.width = Cm(larguras[i])
            margens_celula(cell)
    return t


def linha_props(row, cabecalho=False, sem_quebra=True, altura=None, exata=False):
    trPr = row._tr.get_or_add_trPr()
    if cabecalho:
        _set(trPr, "w:tblHeader")
    if sem_quebra:
        _set(trPr, "w:cantSplit")
    if altura:
        row.height = Cm(altura)
        row.height_rule = WD_ROW_HEIGHT_RULE.EXACTLY if exata else WD_ROW_HEIGHT_RULE.AT_LEAST


def par(alvo, texto="", tam=9.2, cor=INK, fonte=F, negrito=False, alinhar=None, antes=0, depois=3, entre=1.15, caixa_alta=False, espacado=0):
    p = alvo.add_paragraph() if hasattr(alvo, "add_paragraph") else alvo
    pf = p.paragraph_format
    pf.space_before, pf.space_after, pf.line_spacing = Pt(antes), Pt(depois), entre
    if alinhar:
        p.alignment = alinhar
    if texto:
        trecho(p, texto, tam, cor, fonte, negrito, caixa_alta, espacado)
    return p


def trecho(p, texto, tam=9.2, cor=INK, fonte=F, negrito=False, caixa_alta=False, espacado=0, fundo=None):
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


def losango(p, cor=RED, tam=8):
    r = trecho(p, "◆ ", tam, cor, "Segoe UI Symbol")
    return r


def cabeca_secao(doc, num, rotulo, titulo, quebra=True):
    p = par(doc, antes=0, depois=1)
    if quebra:
        p.paragraph_format.page_break_before = True
    p.paragraph_format.keep_with_next = True
    losango(p)
    trecho(p, f"{num} · {rotulo}", 7.5, RED, F_SEMI, caixa_alta=True, espacado=1.2)
    par(doc, titulo, 17, NAVY, F_SEMI, depois=10, entre=1.05).paragraph_format.keep_with_next = True


def titulo3(alvo, texto, antes=8):
    return par(alvo, texto, 10, NAVY, F_SEMI, antes=antes, depois=2)


def limpar_celula(cell):
    cell.paragraphs[0].paragraph_format.space_after = Pt(0)
    return cell.paragraphs[0]


def img_bytes(pil):
    buf = io.BytesIO()
    pil.save(buf, format="PNG")
    buf.seek(0)
    return buf


def qr_png(url):
    q = qrcode.QRCode(version=3, error_correction=qrcode.constants.ERROR_CORRECT_M, box_size=12, border=0)
    q.add_data(url)
    q.make(fit=False)
    return img_bytes(q.make_image(fill_color="#0B1730", back_color="white").convert("RGB"))


def campo(p, instr, tam, cor):
    """Campo do Word (PAGE / NUMPAGES) — atualiza sozinho."""
    r = trecho(p, "", tam, cor)
    for tipo, texto in (("begin", None), (None, instr), ("separate", None), (None, "1"), ("end", None)):
        if tipo:
            fc = OxmlElement("w:fldChar")
            fc.set(qn("w:fldCharType"), tipo)
            r._r.append(fc)
        elif texto == instr:
            it = OxmlElement("w:instrText")
            it.set(qn("xml:space"), "preserve")
            it.text = f" {instr} "
            r._r.append(it)
        else:
            t = OxmlElement("w:t")
            t.text = texto
            r._r.append(t)


# ── blocos ──
def rodape(secao, d, url, legenda):
    secao.footer_distance = Cm(0.7)
    ft = secao.footer
    p0 = ft.paragraphs[0]
    p0.paragraph_format.space_after = Pt(0)
    pPr = p0._p.get_or_add_pPr()
    b = _set(pPr, "w:pBdr")
    _set(b, "w:top", **{"w:val": "single", "w:sz": 4, "w:color": "C9D2E0", "w:space": 4})
    t = tabela(ft, 1, 2, [12.6, 4.4], bordas=None)
    esq, dir_ = t.rows[0].cells
    margens_celula(esq, 0.05, 0, 0, 0)
    margens_celula(dir_, 0.05, 0, 0, 0)
    p = limpar_celula(esq)
    losango(p, RED, 7)
    trecho(p, "ANDERS TECH", 8, NAVY, F_SEMI, espacado=1)
    par(esq, "Consultoria ISO 9001 · PBQP-H · Sebrae Unio", 7, SOFT, depois=0)
    p3 = par(esq, f"Passo Fundo/RS · anderstech.net · Proposta {d['numero']} · pág. ", 7, SOFT, depois=0)
    campo(p3, "PAGE", 7, SOFT)
    trecho(p3, "/", 7, SOFT)
    campo(p3, "NUMPAGES", 7, SOFT)
    inner = tabela(dir_, 1, 2, [2.3, 2.0], bordas=None)
    a, q = inner.rows[0].cells
    for c in (a, q):
        margens_celula(c, 0, 0, 0, 0)
    a.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
    pa = limpar_celula(a)
    pa.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    trecho(pa, legenda, 6.8, NAVY, F_MED)
    par(a, "aponte a câmera →", 6.3, SOFT, alinhar=WD_ALIGN_PARAGRAPH.RIGHT, depois=0)
    par(a, url.replace("https://", ""), 6, MUTE, alinhar=WD_ALIGN_PARAGRAPH.RIGHT, depois=0)
    pq = limpar_celula(q)
    pq.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    pq.add_run().add_picture(qr_png(url), width=Cm(1.8))
    # O Word exige parágrafo como último elemento do rodapé.
    par(ft, "", tam=2, depois=0, entre=1.0)


def capa(doc, d, total_h):
    t = tabela(doc, 1, 1, [LARG + 1.0], bordas=None)
    row = t.rows[0]
    linha_props(row, altura=23.6, exata=True)
    c = row.cells[0]
    sombra(c, NAVY)
    margens_celula(c, 1.2, 0.8, 1.2, 1.2)
    topo = tabela(c, 1, 2, [9.0, 6.6], bordas=None)
    lg, nm = topo.rows[0].cells
    for x in (lg, nm):
        margens_celula(x, 0, 0, 0, 0)
    limpar_celula(lg).add_run().add_picture(str(RAIZ / "assets" / "logo-horizontal-white-2x.png"), width=Cm(5.6))
    pn = limpar_celula(nm)
    pn.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    trecho(pn, "PROPOSTA Nº", 7, "B9C8E4", espacado=1.5)
    par(nm, d["numero"], 10, "FFFFFF", F_SEMI, alinhar=WD_ALIGN_PARAGRAPH.RIGHT, depois=0)
    c.paragraphs[0]._p.getparent().remove(c.paragraphs[0]._p)
    par(c, "", depois=0, antes=110)
    pt = par(c, "", depois=12)
    trecho(pt, "  ◆  ", 8, "FFFFFF", "Segoe UI Symbol", fundo=RED)
    trecho(pt, "PROPOSTA DE CONSULTORIA  ", 8, "FFFFFF", F_SEMI, espacado=2, fundo=RED)
    par(c, d["titulo"], 27, "FFFFFF", F_SEMI, depois=8, entre=1.05)
    pnorma = par(c, d["norma"], 15, "FFFFFF", "Poppins", negrito=True, depois=22)
    _set(_set(pnorma._p.get_or_add_pPr(), "w:pBdr"), "w:bottom", **{"w:val": "single", "w:sz": 24, "w:color": RED, "w:space": 4})
    pp = par(c, "Preparada para ", 10, "B9C8E4", depois=0, entre=1.3)
    trecho(pp, d["contratante"]["razaoSocial"], 10, "FFFFFF", F_SEMI)
    par(c, d["contratante"]["cidade"], 10, "B9C8E4", depois=0)
    par(c, "", depois=0, antes=150)
    meta = tabela(c, 1, 4, [4.15] * 4, bordas=None)
    itens = [("Data", data(d["data"])), ("Válida até", data(d["validade"])), ("Carga horária", horas(total_h)), ("Consultor", d["consultor"]["nome"])]
    for cell, (k, v) in zip(meta.rows[0].cells, itens):
        bordas_celula(cell, top=("4B5A78", 4))
        margens_celula(cell, 0.3, 0, 0, 0.2)
        pk = limpar_celula(cell)
        trecho(pk, k, 7, "B9C8E4", caixa_alta=True, espacado=1.2)
        par(cell, v, 10, "FFFFFF", F_SEMI, depois=0)


def kpis(doc, d, total_h, total, avista):
    av = d["pagamento"].get("avista")
    parc = d["pagamento"].get("parcelado")
    dados = [
        ("Carga horária", horas(total_h), "presenciais, in company", NAVY),
        ("Prazo até a certificação", f"{d['resultado']['prazoMeses']} meses", "conforme cronograma", NAVY),
        ("Investimento", moeda(total), f"ou {len(parc['parcelas'])}× de {moeda(parc['parcelas'][0]['valor'])}" if parc else "", NAVY),
    ]
    if av:
        dados.append((f"À vista até {data(av['ate'])}", moeda(avista), f"{av['descontoPct']}% de {av['rotulo']}", RED))
    larg = LARG / len(dados)
    t = tabela(doc, 1, len(dados), [larg] * len(dados), bordas=None)
    for cell, (k, v, s, cor) in zip(t.rows[0].cells, dados):
        sombra(cell, cor)
        bordas_celula(cell, left=("FFFFFF", 36), right=("FFFFFF", 36))
        margens_celula(cell, 0.3, 0.3, 0.3, 0.2)
        trecho(limpar_celula(cell), k, 6.8, "FFFFFF" if cor == RED else "B9C8E4", caixa_alta=True, espacado=1)
        par(cell, v, 14, "FFFFFF", F_SEMI, depois=0, antes=2)
        par(cell, s, 7.2, "FFFFFF" if cor == RED else "B9C8E4", depois=0)
    par(doc, depois=6)


def partes(doc, d):
    a, b = d["contratado"], d["contratante"]
    campos_a = [("Nome fantasia", a.get("fantasia")), ("CNPJ", a["cnpj"]), ("Endereço", f"{a['endereco']}, {a['cidade']}"), ("Consultor", a.get("consultor")), ("Telefone", a.get("telefone")), ("E-mail", a.get("email"))]
    campos_b = [("CNPJ", b["cnpj"]), ("Endereço", ", ".join(x for x in (b.get("endereco"), b.get("cidade")) if x)), ("Contato", b.get("contato")), ("Telefone", b.get("telefone")), ("E-mail", b.get("email")), ("Atividade", b.get("atividade"))]
    t = tabela(doc, 1, 2, [8.5, 8.5], bordas=None)
    for cell, (tit, p, campos) in zip(t.rows[0].cells, (("Contratado", a, campos_a), ("Contratante", b, campos_b))):
        sombra(cell, PAPER)
        bordas_celula(cell, left=(NAVY3, 24), right=("FFFFFF", 36))
        margens_celula(cell, 0.3, 0.3, 0.4, 0.3)
        trecho(limpar_celula(cell), tit, 7, RED, F_SEMI, caixa_alta=True, espacado=1.4)
        par(cell, p["razaoSocial"], 9, NAVY, F_SEMI, depois=4, antes=2)
        for k, v in campos:
            if not v:
                continue
            pk = par(cell, "", depois=1)
            trecho(pk, f"{k}: ", 7.8, MUTE)
            trecho(pk, v, 7.8, INK)


def resumo(doc, d, linhas, total_h, total, avista):
    cabeca_secao(doc, "01", "Visão geral", "O que esta proposta entrega")
    kpis(doc, d, total_h, total, avista)
    partes(doc, d)
    t = tabela(doc, 1, 2, [8.5, 8.5], bordas=None)
    esq, dir_ = t.rows[0].cells
    margens_celula(esq, 0, 0, 0, 0.4)
    margens_celula(dir_, 0, 0, 0.4, 0)
    titulo3(esq, "Escopo", 10).paragraph_format.space_before = Pt(10)
    esq.paragraphs[0]._p.getparent().remove(esq.paragraphs[0]._p)
    par(esq, d["escopo"], 9.2)
    titulo3(esq, "Resultado esperado")
    par(esq, d["resultado"]["texto"], 9.2)
    titulo3(dir_, "Solução proposta", 10)
    dir_.paragraphs[0]._p.getparent().remove(dir_.paragraphs[0]._p)
    hs = tabela(dir_, len(linhas), 2, [5.6, 2.4], bordas="linhas")
    for row, l in zip(hs.rows, linhas):
        trecho(limpar_celula(row.cells[0]), l["descricao"], 8.6, INK)
        pr = limpar_celula(row.cells[1])
        pr.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        trecho(pr, horas(l["horas"]), 8.6, NAVY, F_SEMI)
    par(dir_, f"Distribuição das {horas(total_h)} conforme o cronograma das atividades.", 7.8, SOFT, antes=4)
    if d.get("nota"):
        par(doc, depois=4)
        n = tabela(doc, 1, 1, [LARG], bordas=None)
        cell = n.rows[0].cells[0]
        bordas_celula(cell, left=(RED, 36), top=("C9D2E0", 4), right=("C9D2E0", 4), bottom=("C9D2E0", 4))
        margens_celula(cell, 0.35, 0.35, 0.5, 0.5)
        p = limpar_celula(cell)
        losango(p)
        trecho(p, d["nota"]["titulo"], 9.4, NAVY, F_SEMI)
        par(cell, d["nota"]["texto"], 8.4, SOFT, depois=0, antes=2)


def cronograma(doc, d, total_h):
    cabeca_secao(doc, "02", "Cronograma das atividades", f"{len(d['cronograma'])} etapas, {horas(total_h)}")
    n = 1 + sum(1 + len(f["itens"]) for f in d["cronograma"]) + 1
    t = tabela(doc, n, 3, [11.4, 3.2, 2.4])
    r = 0
    cab = t.rows[r]
    linha_props(cab, cabecalho=True)
    for cell, txt, al in zip(cab.cells, ("Atividade", "Tipo", "Horas"), (None, None, WD_ALIGN_PARAGRAPH.RIGHT)):
        sombra(cell, NAVY)
        p = limpar_celula(cell)
        if al:
            p.alignment = al
        trecho(p, txt, 7, "FFFFFF", F_SEMI, caixa_alta=True, espacado=1)
    chip_cor = {"consultoria": ("E6EBF4", NAVY3), "treinamento": (NAVY, "FFFFFF"), "auditoria": ("FFE5E5", "C00000")}
    for fi, f in enumerate(d["cronograma"], 1):
        r += 1
        row = t.rows[r]
        linha_props(row)
        _set(row._tr.get_or_add_trPr(), "w:cantSplit")
        a = row.cells[0].merge(row.cells[1])
        for cell in (a, row.cells[2]):
            sombra(cell, PAPER)
        p = limpar_celula(a)
        p.paragraph_format.keep_with_next = True
        trecho(p, f"{fi:02d}   ", 8.4, RED, "Poppins", negrito=True)
        trecho(p, f["fase"], 8.4, NAVY, F_SEMI)
        ph = limpar_celula(row.cells[2])
        ph.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        trecho(ph, horas(sum(i["horas"] for i in f["itens"])), 8.4, NAVY, F_SEMI)
        for i in f["itens"]:
            r += 1
            row = t.rows[r]
            linha_props(row)
            p = limpar_celula(row.cells[0])
            trecho(p, i["atividade"], 8.2, INK)
            fundo, cor = chip_cor[i["tipo"]]
            trecho(limpar_celula(row.cells[1]), f" {TIPOS[i['tipo']].upper()} ", 6.4, cor, F_SEMI, espacado=0.5, fundo=fundo)
            ph = limpar_celula(row.cells[2])
            ph.alignment = WD_ALIGN_PARAGRAPH.RIGHT
            trecho(ph, horas(i["horas"]), 8.2, INK)
    r += 1
    row = t.rows[r]
    a = row.cells[0].merge(row.cells[1])
    for cell in (a, row.cells[2]):
        bordas_celula(cell, top=(NAVY, 12))
    trecho(limpar_celula(a), "Total", 8.6, NAVY, "Poppins", negrito=True)
    ph = limpar_celula(row.cells[2])
    ph.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    trecho(ph, horas(total_h), 8.6, NAVY, "Poppins", negrito=True)
    par(doc, f"Agenda das assessorias: {d['agenda']}", 7.8, SOFT, antes=4)


def investimento(doc, d, linhas, total_h, total, avista):
    cabeca_secao(doc, "03", "Investimento", "Valores e forma de pagamento")
    vh = d["investimento"]["valorHora"]
    t = tabela(doc, len(linhas) + 2, 4, [6.2, 3.4, 2.8, 4.6])
    for i, (cell, txt) in enumerate(zip(t.rows[0].cells, ("Descrição", "Valor hora", "Horas", "Valor total"))):
        sombra(cell, NAVY)
        p = limpar_celula(cell)
        if i:
            p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        trecho(p, txt, 7, "FFFFFF", F_SEMI, caixa_alta=True, espacado=1)
    corpo = [(l["descricao"], moeda(vh), horas(l["horas"]), moeda(l["valor"]), False) for l in linhas]
    corpo.append(("Total do investimento", moeda(vh), horas(total_h), moeda(total), True))
    for row, vals in zip(t.rows[1:], corpo):
        for i, (cell, v) in enumerate(zip(row.cells, vals[:4])):
            p = limpar_celula(cell)
            if i:
                p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
            trecho(p, v, 9, NAVY if vals[4] else INK, "Poppins", negrito=vals[4])
            if vals[4]:
                bordas_celula(cell, top=(NAVY, 12))
    par(doc, depois=8)
    pg = d["pagamento"]
    lay = tabela(doc, 1, 2, [9.6, 7.4], bordas=None)
    esq, dir_ = lay.rows[0].cells
    margens_celula(esq, 0, 0, 0, 0.5)
    pt = limpar_celula(esq)
    if pg.get("parcelado"):
        pc = pg["parcelado"]
        trecho(pt, "a) ", 9.2, RED, "Poppins", negrito=True)
        trecho(pt, pc["titulo"], 9.2, NAVY, F_SEMI)
        pr = tabela(esq, len(pc["parcelas"]) + 2, 3, [2.2, 3.6, 3.3])
        for i, (cell, txt) in enumerate(zip(pr.rows[0].cells, ("Parcela", "Vencimento", "Valor"))):
            sombra(cell, NAVY)
            p = limpar_celula(cell)
            if i == 2:
                p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
            trecho(p, txt, 7, "FFFFFF", F_SEMI, caixa_alta=True, espacado=1)
        for n, (row, x) in enumerate(zip(pr.rows[1:], pc["parcelas"]), 1):
            vals = (str(n), data(x["vencimento"]), moeda(x["valor"]))
            for i, (cell, v) in enumerate(zip(row.cells, vals)):
                p = limpar_celula(cell)
                if i == 2:
                    p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
                trecho(p, v, 8.4, INK)
        last = pr.rows[-1]
        a = last.cells[0].merge(last.cells[1])
        trecho(limpar_celula(a), "Total", 8.4, NAVY, "Poppins", negrito=True)
        p = limpar_celula(last.cells[2])
        p.alignment = WD_ALIGN_PARAGRAPH.RIGHT
        trecho(p, moeda(sum(x["valor"] for x in pc["parcelas"])), 8.4, NAVY, "Poppins", negrito=True)
        for cell in (a, last.cells[2]):
            bordas_celula(cell, top=(NAVY, 12))
        if pc.get("observacao"):
            par(esq, pc["observacao"], 7.8, SOFT, antes=4)
    av = pg.get("avista")
    if av:
        sombra(dir_, NAVY)
        margens_celula(dir_, 0.5, 0.5, 0.5, 0.5)
        p = limpar_celula(dir_)
        trecho(p, "b) ", 9.2, RED, "Poppins", negrito=True)
        trecho(p, f"À vista, com {av['descontoPct']}% de {av['rotulo']}", 9.2, "FFFFFF", F_SEMI)
        pde = par(dir_, "", antes=8, depois=0)
        r = trecho(pde, f"De {moeda(total)}", 9, "B9C8E4")
        r.font.strike = True
        par(dir_, moeda(avista), 24, "FFFFFF", "Poppins", negrito=True, depois=8)
        pa = par(dir_, "", depois=0)
        trecho(pa, "  ◆ ", 8, "FFFFFF", "Segoe UI Symbol", fundo=RED)
        trecho(pa, f"Condição válida até {data(av['ate'])}  ", 8.2, "FFFFFF", F_SEMI, fundo=RED)
    par(doc, depois=6)
    v = tabela(doc, 1, 1, [LARG], bordas=None)
    cell = v.rows[0].cells[0]
    sombra(cell, PAPER)
    margens_celula(cell, 0.3, 0.3, 0.4, 0.4)
    p = limpar_celula(cell)
    losango(p)
    trecho(p, "Esta proposta é válida até ", 9, INK)
    trecho(p, data_extenso(d["validade"]), 9, NAVY, F_SEMI)
    trecho(p, ".", 9, INK)


def consultor(doc, d):
    k = d["consultor"]
    par(doc, depois=6)
    cabeca_secao(doc, "04", "Consultor designado", k["nome"], quebra=False)
    t = tabela(doc, 1, 2, [2.2, LARG - 2.2], bordas=None)
    av, info = t.rows[0].cells
    for c in (av, info):
        sombra(c, PAPER)
    margens_celula(av, 0.4, 0.4, 0.4, 0.2)
    margens_celula(info, 0.4, 0.4, 0.3, 0.4)
    inner = tabela(av, 1, 1, [1.5], bordas=None)
    ic = inner.rows[0].cells[0]
    linha_props(inner.rows[0], altura=1.5, exata=True)
    sombra(ic, NAVY)
    bordas_celula(ic, bottom=(RED, 24))
    ic.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
    pi = limpar_celula(ic)
    pi.alignment = WD_ALIGN_PARAGRAPH.CENTER
    trecho(pi, "".join(x[0] for x in k["nome"].split()[:2]), 12, "FFFFFF", "Poppins", negrito=True)
    info.vertical_alignment = WD_CELL_VERTICAL_ALIGNMENT.CENTER
    trecho(limpar_celula(info), k["nome"], 11, NAVY, F_SEMI)
    par(info, k["cargo"], 9, SOFT, depois=1)
    if k.get("cvUrl"):
        pc = par(info, "Currículo: ", 7.8, SOFT, depois=0)
        link(pc, k["cvUrl"], "abrir o currículo completo")


def link(p, url, texto):
    rid = p.part.relate_to(url, "http://schemas.openxmlformats.org/officeDocument/2006/relationships/hyperlink", is_external=True)
    h = OxmlElement("w:hyperlink")
    h.set(qn("r:id"), rid)
    r = trecho(p, texto, 7.8, NAVY3)
    r.font.underline = True
    h.append(r._r)
    p._p.append(h)


def prisma(doc, d):
    x = d.get("prismabiz")
    if not x:
        return
    cabeca_secao(doc, "05", "Sistema incluído", x["titulo"])
    par(doc, x["oQueE"], 8.8, depois=4, entre=1.1)
    titulo3(doc, "Como o sistema apoia cada requisito da ISO 9001", 2).paragraph_format.keep_with_next = True
    t = tabela(doc, len(x["requisitos"]) + 1, 2, [7.6, 9.4])
    linha_props(t.rows[0], cabecalho=True)
    for cell, txt in zip(t.rows[0].cells, ("Requisito", f"Onde fica no {x['nome']}")):
        sombra(cell, NAVY)
        trecho(limpar_celula(cell), txt, 7, "FFFFFF", F_SEMI, caixa_alta=True, espacado=1)
    for row, (rq, md) in zip(t.rows[1:], x["requisitos"]):
        linha_props(row)
        for cell in row.cells:
            margens_celula(cell, 0.02, 0.02, 0.25, 0.25)
            cell.paragraphs[0].paragraph_format.line_spacing = 1.0
        trecho(limpar_celula(row.cells[0]), rq, 7.4, NAVY, F_MED)
        trecho(limpar_celula(row.cells[1]), md, 7.4, INK)
    par(doc, depois=2, tam=4)
    lay = tabela(doc, 1, 2, [8.5, 8.5], bordas=None)
    linha_props(lay.rows[0])
    esq, dir_ = lay.rows[0].cells
    margens_celula(esq, 0, 0, 0, 0.5)
    trecho(limpar_celula(esq), "O que muda na prática", 10, NAVY, F_SEMI)
    par(esq, x["naPratica"], 9, antes=2)
    sombra(dir_, NAVY)
    margens_celula(dir_, 0.45, 0.45, 0.5, 0.5)
    trecho(limpar_celula(dir_), "Licença vitalícia incluída", 7, "B9C8E4", caixa_alta=True, espacado=1.2)
    par(dir_, f"Plano {x['licenca']['plano']}", 13, "FFFFFF", F_SEMI, antes=2, depois=4)
    par(dir_, x["licenca"]["texto"], 8.2, "DFE6F3", depois=6)
    pr = par(dir_, f"Valor de referência hoje: {moeda(x['licenca']['valorMensal'])} por mês", 8, "FFFFFF", F_SEMI, depois=0)
    _set(_set(pr._p.get_or_add_pPr(), "w:pBdr"), "w:top", **{"w:val": "single", "w:sz": 4, "w:color": "4B5A78", "w:space": 4})


def contrato(doc, d):
    k = d["contrato"]
    cabeca_secao(doc, "06", "Contrato", k["titulo"])
    J = WD_ALIGN_PARAGRAPH.JUSTIFY
    for p0 in k["preambulo"]:
        p = par(doc, "", alinhar=J, depois=4)
        if p0.get("rotulo"):
            trecho(p, f"{p0['rotulo']}: ", 8.5, NAVY, "Poppins", negrito=True)
        trecho(p, p0["texto"], 8.5, INK)
    for s in k["secoes"]:
        h = par(doc, s["titulo"], 8.5, NAVY, F_SEMI, antes=8, depois=3, caixa_alta=True, espacado=1)
        h.paragraph_format.keep_with_next = True
        for c in s["clausulas"]:
            p = par(doc, "", alinhar=J, depois=3)
            p.paragraph_format.keep_together = True
            trecho(p, f"{c['rotulo']}: ", 8.5, NAVY, "Poppins", negrito=True)
            trecho(p, c["texto"], 8.5, INK)
            if c.get("itens"):
                p.paragraph_format.keep_with_next = True
                for n, it in enumerate(c["itens"]):
                    pi = par(doc, "", alinhar=J, depois=1)
                    pi.paragraph_format.left_indent = Cm(0.6)
                    pi.paragraph_format.keep_with_next = n < len(c["itens"]) - 1
                    trecho(pi, f"{'abcdefgh'[n]}) ", 8.5, NAVY, "Poppins", negrito=True)
                    trecho(pi, it, 8.5, INK)
            if c.get("paragrafo"):
                pp = par(doc, "", alinhar=J, depois=3)
                trecho(pp, "Parágrafo único: ", 8.5, NAVY, "Poppins", negrito=True)
                trecho(pp, c["paragrafo"], 8.5, INK)
    par(doc, k["fecho"], 8.5, alinhar=J, antes=6)
    par(doc, k["localData"], 8.5, NAVY, F_SEMI, antes=6, depois=28)
    t = tabela(doc, 2, 2, [8.0, 8.0], bordas=None)
    pessoas = [("Contratante", d["contratante"]["razaoSocial"], f"CNPJ {d['contratante']['cnpj']}"), ("Contratado", d["contratado"]["razaoSocial"], f"CNPJ {d['contratado']['cnpj']}"), ("Testemunha 1", "Nome:", "CPF:"), ("Testemunha 2", "Nome:", "CPF:")]
    for i, (tit, nome, docu) in enumerate(pessoas):
        row = t.rows[i // 2]
        linha_props(row, altura=2.4)
        cell = row.cells[i % 2]
        bordas_celula(cell, top=(NAVY, 8))
        margens_celula(cell, 0.15, 0.6, 0 if i % 2 == 0 else 0.5, 0.5 if i % 2 == 0 else 0)
        trecho(limpar_celula(cell), tit, 7.4, NAVY, F_SEMI, caixa_alta=True, espacado=1.2)
        par(cell, nome, 7.8, SOFT, depois=0)
        par(cell, docu, 7.8, SOFT, depois=0)


def main():
    if len(sys.argv) < 2:
        sys.exit("uso: python scripts/proposta/gerar_docx.py <dados.json> [saida.docx]")
    entrada = Path(sys.argv[1])
    saida = Path(sys.argv[2]) if len(sys.argv) > 2 else entrada.with_suffix(".docx")
    d = json.loads(entrada.read_text(encoding="utf-8"))
    linhas, total_h, total, avista = calcular(d)
    if d["investimento"].get("totalEsperado") is not None and abs(total - d["investimento"]["totalEsperado"]) > 0.009:
        sys.exit(f"cronograma soma {total_h} h ({moeda(total)}), diferente do investimento combinado")
    codigo = (d.get("artefato") or {}).get("codigo")
    url = f"https://anderstech.net/r/{codigo}" if codigo else "https://anderstech.net"
    legenda = "Cases, prazos e como trabalho" if codigo else "Conheça a Anders Tech"

    doc = Document()
    st = doc.styles["Normal"]
    st.font.name, st.font.size = F, Pt(9.2)
    for atr in ("w:cs", "w:eastAsia"):
        st.element.rPr.rFonts.set(qn(atr), F)
    sec = doc.sections[0]
    sec.page_width, sec.page_height = Cm(21), Cm(29.7)
    sec.top_margin, sec.bottom_margin = Cm(1.6), Cm(2.6)
    sec.left_margin = sec.right_margin = Cm(2.0)
    doc.core_properties.title = f"Proposta {d['numero']}"
    doc.core_properties.author = "Anders Tech"
    rodape(sec, d, url, legenda)
    for vazio in list(doc.paragraphs):  # o modelo em branco pode trazer um parágrafo vazio
        vazio._p.getparent().remove(vazio._p)

    capa(doc, d, total_h)
    resumo(doc, d, linhas, total_h, total, avista)
    cronograma(doc, d, total_h)
    investimento(doc, d, linhas, total_h, total, avista)
    consultor(doc, d)
    prisma(doc, d)
    contrato(doc, d)
    par(doc, "", tam=2, depois=0)
    doc.save(saida)
    print(f"DOCX: {saida}")


if __name__ == "__main__":
    main()
