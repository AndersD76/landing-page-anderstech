// ── Gerador PDF de case (1 página, identidade de artefato) ──────────────────
// Navy #0b1730 · vermelho #d80a0a · Poppins · diamante ◆
// Rodapé assinado com QR (contrato SPEC-RODAPE-ARTEFATOS.md).

import PDFDocument from 'pdfkit';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const FONTS_DIR = join(__dirname, '..', 'assets', 'fonts');

const NAVY      = '#0b1730';
const NAVY_SEC  = '#12233f';
const NAVY_SOFT = '#46577a';
const NAVY_MUTE = '#8190ac';
const VERMELHO  = '#d80a0a';
const FILETE    = '#c9d2e0';
const BRANCO    = '#ffffff';
const FUNDO     = '#f4f6fa';

const MM = 72 / 25.4;
const MARGEM = 20 * MM;
const PW = (210 * MM) - (2 * MARGEM);

function registrarFontes(doc) {
  doc.registerFont('Poppins',         join(FONTS_DIR, 'Poppins-Regular.ttf'));
  doc.registerFont('Poppins-Medium',  join(FONTS_DIR, 'Poppins-Medium.ttf'));
  doc.registerFont('Poppins-SemiBold', join(FONTS_DIR, 'Poppins-SemiBold.ttf'));
  doc.registerFont('Poppins-Bold',    join(FONTS_DIR, 'Poppins-Bold.ttf'));
}

function diamante(doc, x, y, lado, cor) {
  const meio = lado / 2;
  doc.save()
    .translate(x, y)
    .rotate(45)
    .rect(-meio, -meio, lado, lado)
    .fillColor(cor)
    .fill()
    .restore();
}

// pdfkit: y=0 no topo, y cresce para baixo. SPEC usa ReportLab (y=0 embaixo).
// Conversão: pdfkit_y = (297 - spec_y) * MM
function fromBottom(specYmm) { return (297 - specYmm) * MM; }

function rodape(doc, codigo) {
  // pdfkit auto-pagina quando y > (pageH - bottomMargin). O rodapé vive
  // nessa zona, então zeramos a margem antes de desenhar e restauramos depois.
  const savedBottom = doc.page.margins.bottom;
  doc.page.margins.bottom = 0;

  // filete separador: SPEC y=28mm → pdfkit y≈762pt
  doc.moveTo(MARGEM, fromBottom(28))
    .lineTo((210 * MM) - MARGEM, fromBottom(28))
    .lineWidth(0.5)
    .strokeColor(FILETE)
    .stroke();

  // bloco esquerdo
  diamante(doc, MARGEM, fromBottom(20) + 3, 2 * MM, VERMELHO);
  doc.font('Poppins-SemiBold').fontSize(8).fillColor(NAVY)
    .text('ANDERS TECH', MARGEM + 5 * MM, fromBottom(20), { lineBreak: false });

  doc.font('Poppins').fontSize(7).fillColor(NAVY_SOFT)
    .text('Consultoria ISO 9001 · PBQP-H · Sebraetec', MARGEM, fromBottom(15.5), { lineBreak: false });

  doc.font('Poppins').fontSize(7).fillColor(NAVY_SOFT)
    .text('Passo Fundo/RS · anderstech.net', MARGEM, fromBottom(11.5), { lineBreak: false });

  // legenda QR (alinhada à direita, terminando em x=166mm)
  const legendaDir = 166 * MM;
  doc.font('Poppins-Medium').fontSize(7).fillColor(NAVY)
    .text('Cases, prazos e como trabalho', MARGEM, fromBottom(18), { width: legendaDir - MARGEM, align: 'right', lineBreak: false });
  doc.font('Poppins').fontSize(6.5).fillColor(NAVY_SOFT)
    .text('aponte a câmera →', MARGEM, fromBottom(14), { width: legendaDir - MARGEM, align: 'right', lineBreak: false });
  doc.font('Poppins').fontSize(6).fillColor(NAVY_MUTE)
    .text(`anderstech.net/r/${codigo}`, MARGEM, fromBottom(9), { width: legendaDir - MARGEM, align: 'right', lineBreak: false });

  // QR placeholder: SPEC x=170→190mm, y=5→25mm
  const qrX = 170 * MM;
  const qrY = fromBottom(25);
  const qrLado = 20 * MM;
  doc.rect(qrX, qrY, qrLado, qrLado).fillColor(FUNDO).fill();
  doc.rect(qrX + 0.5, qrY + 0.5, qrLado - 1, qrLado - 1).strokeColor(FILETE).lineWidth(0.5).stroke();
  doc.font('Poppins').fontSize(5).fillColor(NAVY_MUTE)
    .text('QR', qrX, qrY + qrLado / 2 - 3, { width: qrLado, align: 'center', lineBreak: false });
  doc.font('Poppins').fontSize(4).fillColor(NAVY_MUTE)
    .text(codigo, qrX, qrY + qrLado / 2 + 3, { width: qrLado, align: 'center', lineBreak: false });

  doc.page.margins.bottom = savedBottom;
}

export function gerarCasePDF(caseData, codigo) {
  const doc = new PDFDocument({
    size: 'A4',
    margins: { top: MARGEM, bottom: 35 * MM, left: MARGEM, right: MARGEM },
    info: {
      Title: `Case — ${caseData.cliente}`,
      Author: 'Anders Tech',
      Creator: 'anderstech.net',
    },
  });

  registrarFontes(doc);

  // ── Header navy ──
  doc.rect(0, 0, 210 * MM, 52 * MM).fillColor(NAVY).fill();

  // diamante + marca
  diamante(doc, MARGEM, 15 * MM, 3 * MM, VERMELHO);
  doc.font('Poppins-SemiBold').fontSize(9).fillColor(BRANCO)
    .text('ANDERS TECH', MARGEM + 6 * MM, 13 * MM, { lineBreak: false });

  // segmento + serviço
  doc.font('Poppins').fontSize(8).fillColor('#b9c8e4')
    .text(`${caseData.segmento} · ${caseData.servico}`, MARGEM, 22 * MM, { width: PW });

  // cliente (título principal)
  doc.font('Poppins-Bold').fontSize(20).fillColor(BRANCO)
    .text(caseData.cliente, MARGEM, 30 * MM, { width: PW });

  let y = 58 * MM;

  // ── Problema ──
  diamante(doc, MARGEM, y + 5, 2 * MM, VERMELHO);
  doc.font('Poppins-SemiBold').fontSize(10).fillColor(NAVY)
    .text('O PROBLEMA', MARGEM + 5 * MM, y, { width: PW - 5 * MM });
  y = doc.y + 3 * MM;
  doc.font('Poppins').fontSize(9).fillColor('#333')
    .text(caseData.problema, MARGEM, y, { width: PW });
  y = doc.y + 6 * MM;

  // ── Solução ──
  diamante(doc, MARGEM, y + 5, 2 * MM, VERMELHO);
  doc.font('Poppins-SemiBold').fontSize(10).fillColor(NAVY)
    .text('O QUE FOI FEITO', MARGEM + 5 * MM, y, { width: PW - 5 * MM });
  y = doc.y + 3 * MM;
  doc.font('Poppins').fontSize(9).fillColor('#333')
    .text(caseData.solucao, MARGEM, y, { width: PW });
  y = doc.y + 6 * MM;

  // ── Resultado ──
  diamante(doc, MARGEM, y + 5, 2 * MM, VERMELHO);
  doc.font('Poppins-SemiBold').fontSize(10).fillColor(NAVY)
    .text('RESULTADO', MARGEM + 5 * MM, y, { width: PW - 5 * MM });
  y = doc.y + 3 * MM;
  doc.font('Poppins').fontSize(9).fillColor('#333')
    .text(caseData.resultado, MARGEM, y, { width: PW });
  y = doc.y + 4 * MM;

  // métricas (se houver)
  const metricas = Array.isArray(caseData.metricas) ? caseData.metricas : [];
  if (metricas.length) {
    const metricaW = PW / Math.min(metricas.length, 3);
    for (let i = 0; i < Math.min(metricas.length, 3); i++) {
      const mx = MARGEM + i * metricaW;
      doc.rect(mx + 1, y, metricaW - 2, 18 * MM)
        .fillColor(FUNDO).fill();

      doc.font('Poppins-Bold').fontSize(16).fillColor(VERMELHO)
        .text(metricas[i].valor, mx + 3 * MM, y + 2 * MM, { width: metricaW - 6 * MM });
      doc.font('Poppins').fontSize(7).fillColor(NAVY_SOFT)
        .text(metricas[i].label, mx + 3 * MM, y + 10 * MM, { width: metricaW - 6 * MM });
    }
    y += 22 * MM;
  }

  // ── Depoimento (se houver) ──
  if (caseData.depoimento_texto && caseData.depoimento_texto.trim()) {
    if (y > 220 * MM) { doc.addPage(); y = MARGEM; }

    doc.rect(MARGEM, y, PW, 1).fillColor(FILETE).fill();
    y += 4 * MM;

    doc.font('Poppins-Medium').fontSize(9).fillColor(NAVY)
      .text(`"${caseData.depoimento_texto}"`, MARGEM + 4 * MM, y, { width: PW - 8 * MM });
    y = doc.y + 2 * MM;

    const autorLinha = [caseData.depoimento_autor, caseData.depoimento_cargo].filter(Boolean).join(' · ');
    if (autorLinha) {
      doc.font('Poppins').fontSize(7).fillColor(NAVY_SOFT)
        .text(`— ${autorLinha}`, MARGEM + 4 * MM, y, { width: PW - 8 * MM });
    }
  }

  // ── Rodapé assinado ──
  rodape(doc, codigo);

  return doc;
}
