"""Instala no Windows (só para o usuário) as fontes do site, para o Word.

Uso:  python scripts/proposta/fontes_word.py

O site usa Space Grotesk e Inter variáveis e Space Mono, em .woff2
(assets/fonts), que o Windows não instala. Aqui cada peso vira um .ttf estático,
com nome de família que o Word entende: "Space Grotesk" (normal e negrito) e
"Space Grotesk Medium/SemiBold" como famílias próprias; idem para Inter.
Requer: pip install --user fonttools brotli
"""
import os
import sys
import winreg
from io import BytesIO
from pathlib import Path

from fontTools.ttLib import TTFont
from fontTools.varLib import instancer

RAIZ = Path(__file__).resolve().parents[2]
DESTINO = Path(os.environ["LOCALAPPDATA"]) / "Microsoft" / "Windows" / "Fonts"
REG = r"Software\Microsoft\Windows NT\CurrentVersion\Fonts"

# (arquivo do site, família, peso, nome do estilo, família no Word, estilo no Word)
PESOS = {400: "Regular", 500: "Medium", 600: "SemiBold", 700: "Bold"}


def nomear(fonte, familia, estilo_word, familia_word, peso):
    completo = f"{familia} {PESOS[peso]}" if peso != 400 else f"{familia} Regular"
    ps = (familia.replace(" ", "") + "-" + PESOS[peso])
    tabela = fonte["name"]
    for rec in list(tabela.names):
        if rec.nameID in (1, 2, 4, 6, 16, 17):
            tabela.removeNames(nameID=rec.nameID)
    for nid, valor in ((1, familia_word), (2, estilo_word), (4, completo), (6, ps), (16, familia), (17, PESOS[peso])):
        tabela.setName(valor, nid, 3, 1, 0x409)
        tabela.setName(valor, nid, 1, 0, 0)
    os2 = fonte["OS/2"]
    os2.usWeightClass = peso
    negrito = estilo_word == "Bold"
    os2.fsSelection = (os2.fsSelection & ~0b1100001) | (0b100000 if negrito else 0b1000000)
    fonte["head"].macStyle = 1 if negrito else 0
    return ps


def instalar(fonte, ps, rotulo):
    alvo = DESTINO / f"{ps}.ttf"
    buf = BytesIO()
    fonte.flavor = None
    fonte.save(buf)
    alvo.write_bytes(buf.getvalue())
    with winreg.OpenKey(winreg.HKEY_CURRENT_USER, REG, 0, winreg.KEY_SET_VALUE) as k:
        winreg.SetValueEx(k, f"{rotulo} (TrueType)", 0, winreg.REG_SZ, str(alvo))
    return alvo


def main():
    DESTINO.mkdir(parents=True, exist_ok=True)
    feitos = []
    for arquivo, familia in (("space-grotesk-latin.woff2", "Space Grotesk"), ("inter-latin.woff2", "Inter")):
        for peso in (400, 500, 600, 700):
            f = TTFont(RAIZ / "assets" / "fonts" / arquivo)
            f = instancer.instantiateVariableFont(f, {"wght": peso}) if "fvar" in f else f
            if peso in (400, 700):
                familia_word, estilo = familia, ("Bold" if peso == 700 else "Regular")
            else:
                familia_word, estilo = f"{familia} {PESOS[peso]}", "Regular"
            ps = nomear(f, familia, estilo, familia_word, peso)
            feitos.append(instalar(f, ps, f"{familia} {PESOS[peso]}"))
    for arquivo, peso in (("space-mono-400-latin.woff2", 400), ("space-mono-700-latin.woff2", 700)):
        f = TTFont(RAIZ / "assets" / "fonts" / arquivo)
        ps = nomear(f, "Space Mono", "Bold" if peso == 700 else "Regular", "Space Mono", peso)
        feitos.append(instalar(f, ps, f"Space Mono {PESOS[peso]}"))
    for a in feitos:
        print("instalada:", a.name)
    print("Feche e abra o Word para ele enxergar as fontes novas.")


if __name__ == "__main__":
    sys.exit(main())
