// Template de aula em PDF (ead/routes.js → desenharTemplate). Sem banco: o
// desenho recebe a linha da aula pronta.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import PDFDocument from 'pdfkit';
import { desenharTemplate } from '../ead/routes.js';

const AULA = { course_titulo: 'Interpretação da ISO 9001', module_titulo: 'Módulo 2', lesson_titulo: 'Aula 3' };

function gerar(titulo, conteudo = '') {
  return new Promise((ok, erro) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50, bufferPages: true });
    const partes = [];
    doc.on('data', (d) => partes.push(d));
    doc.on('end', () => ok(Buffer.concat(partes)));
    doc.on('error', erro);
    try {
      desenharTemplate(doc, titulo, { ...AULA, conteudo });
      doc.end();
    } catch (e) { erro(e); }
  });
}
const paginas = (b) => (b.toString('latin1').match(/\/Type \/Page\b(?!s)/g) || []).length;

test('template curto cabe em 1 página (o rodapé abria uma 2ª página só para ele)', async () => {
  const pdf = await gerar('Modelo de ficha de não conformidade');
  assert.equal(pdf.subarray(0, 5).toString(), '%PDF-');
  assert.equal(paginas(pdf), 1);
});

test('checklist longo passa de 1 página sem estourar (switchToPage sem bufferPages)', async () => {
  const itens = Array.from({ length: 20 }, (_, i) =>
    `<li>Verificar se o requisito ${i + 1} está documentado, implementado, mantido e com evidência objetiva registrada no período auditado, incluindo responsáveis e prazos</li>`).join('');
  const pdf = await gerar('Checklist de auditoria interna', `<ul>${itens}</ul>`);
  const n = paginas(pdf);
  assert.ok(n >= 2, `esperava 2+ páginas, veio ${n}`);
  assert.ok(n <= 3, `página extra de rodapé: ${n}`);
});

test('tabela e mapa continuam gerando', async () => {
  assert.equal(paginas(await gerar('Matriz de riscos e oportunidades')), 1);
  assert.equal(paginas(await gerar('Tabela comparativa 2015 x 2026')), 1);
  assert.ok(paginas(await gerar('Mapa de processos')) >= 1);
});
