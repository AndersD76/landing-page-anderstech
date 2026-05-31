const BRAND = { navy: '#203864', red: '#FE0000', paper: '#F4F6FA', white: '#FFFFFF' };

function layout(content) {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><style>
body{margin:0;padding:0;background:${BRAND.paper};font-family:'Helvetica Neue',Arial,sans-serif;color:#16233f}
.wrap{max-width:600px;margin:0 auto;padding:20px}
.header{background:${BRAND.navy};padding:32px 40px;text-align:center}
.header h1{color:${BRAND.white};font-size:22px;font-weight:700;margin:0;letter-spacing:-.02em}
.header small{color:${BRAND.red};font-size:11px;letter-spacing:.16em;text-transform:uppercase;display:block;margin-top:6px}
.body{background:${BRAND.white};padding:40px;border:1px solid #e2e6ee}
.body h2{font-size:20px;color:${BRAND.navy};margin:0 0 16px;line-height:1.3}
.body p{font-size:15px;line-height:1.7;color:#46577a;margin:0 0 14px}
.body b{color:#16233f}
.cta{display:inline-block;background:${BRAND.red};color:${BRAND.white};padding:14px 32px;font-size:15px;font-weight:600;text-decoration:none;margin:18px 0;border-radius:2px}
.footer{padding:28px 40px;text-align:center;font-size:12px;color:#8190ac;line-height:1.6}
.footer a{color:${BRAND.navy}}
.divider{border:0;height:1px;background:#e2e6ee;margin:20px 0}
.meta{background:${BRAND.paper};padding:20px 24px;font-size:13px;color:#46577a;line-height:1.7;margin:16px 0;border-left:3px solid ${BRAND.red}}
</style></head><body><div class="wrap">
<div class="header"><h1>anders<span style="color:${BRAND.red}">tech</span></h1><small>Gestão com Tecnologia</small></div>
${content}
<div class="footer">
Anders Tech — CNPJ 42.073.716/0001-80<br>
Passo Fundo · RS · (54) 99964-8368<br>
<a href="https://anderstech.net">anderstech.net</a> · <a href="https://andersdev.com.br">andersdev.com.br</a>
</div></div></body></html>`;
}

export function notifyNewLead({ nome, empresa, email, telefone, interesse, mensagem, source, leadId, roiData }) {
  const rows = [
    ['Nome', nome],
    ['Empresa', empresa || '—'],
    ['Email', email || '—'],
    ['Telefone', telefone || '—'],
    ['Interesse', interesse || '—'],
    ['Fonte', source || 'site_form'],
  ].map(([k, v]) => `<tr><td style="padding:6px 12px;font-size:13px;color:#8190ac;border-bottom:1px solid #f0f2f6">${k}</td><td style="padding:6px 12px;font-size:14px;font-weight:500;border-bottom:1px solid #f0f2f6">${v}</td></tr>`).join('');

  let roiBlock = '';
  if (roiData) {
    roiBlock = `<div class="meta"><b>Calculadora ROI:</b><br>
Faturamento: R$ ${roiData.faturamento || 0} · ${roiData.funcionarios || '—'} funcionários<br>
Setor: ${roiData.setor || '—'} · Motivação: ${roiData.motivacao || '—'}<br>
Investimento: R$ ${roiData.investMin || 0} – ${roiData.investMax || 0}<br>
Economia 24m: R$ ${roiData.savings24 || 0} · ROI: ${roiData.roi || 0}%</div>`;
  }

  return layout(`<div class="body">
<h2>Novo lead #${leadId || '—'}</h2>
<table style="width:100%;border-collapse:collapse">${rows}</table>
${mensagem ? `<div class="meta">${mensagem}</div>` : ''}
${roiBlock}
<hr class="divider">
<a href="https://anderstech.net/admin" class="cta">Ver no painel</a>
<a href="https://wa.me/55${(telefone || '').replace(/\D/g, '')}" style="margin-left:12px;color:${BRAND.navy};font-size:14px;font-weight:600;text-decoration:none">WhatsApp →</a>
</div>`);
}

export function autoReplyContact({ nome, interesse }) {
  const tips = {
    'ISO 9001': 'Enquanto isso, confira nosso artigo: <a href="https://anderstech.net/blog/quanto-custa-certificacao-iso-9001">Quanto custa a certificação ISO 9001?</a>',
    'PBQP-H': 'Enquanto isso, confira nosso guia: <a href="https://anderstech.net/blog/pbqp-h-o-que-e-para-que-serve">PBQP-H: o que é e para que serve?</a>',
    'Otimização de processos': 'Enquanto isso, confira: <a href="https://anderstech.net/blog/como-reduzir-retrabalho-na-producao">Como reduzir retrabalho na produção</a>',
  };
  const matchedTip = Object.entries(tips).find(([k]) => (interesse || '').includes(k));
  const tip = matchedTip ? `<p>${matchedTip[1]}</p>` : '';

  return layout(`<div class="body">
<h2>Olá, ${nome.split(' ')[0]}!</h2>
<p>Recebemos sua mensagem e vamos responder em até <b>24 horas úteis</b>.</p>
<p>Se precisar falar antes, o Daniel está disponível no WhatsApp:</p>
<a href="https://wa.me/5554999648368" class="cta">Falar no WhatsApp</a>
<hr class="divider">
${tip}
<p style="font-size:13px;color:#8190ac">Este é um email automático. Não é necessário responder.</p>
</div>`);
}

export function checklistDelivery({ nome }) {
  return layout(`<div class="body">
<h2>${nome.split(' ')[0]}, aqui está seu Checklist ISO 9001</h2>
<p>Obrigado pelo interesse. O <b>Checklist Diagnóstico ISO 9001 — 47 pontos</b> está pronto para uso.</p>
<p>Use este checklist para avaliar em quais requisitos sua empresa já atende e onde precisa melhorar antes de uma auditoria.</p>
<div class="meta">
<b>O que está dentro:</b><br>
✓ 47 pontos organizados em 7 categorias da norma<br>
✓ Contexto da organização · Liderança · Planejamento<br>
✓ Apoio e recursos · Operação · Avaliação · Melhoria<br>
✓ Espaço para notas e plano de ação por item
</div>
<p>O checklist é uma ferramenta de diagnóstico inicial. Para uma avaliação completa da sua operação — com dados reais e recomendações específicas — oferecemos um <b>diagnóstico gratuito de 30 minutos</b>.</p>
<a href="https://wa.me/5554999648368?text=Oi%2C%20baixei%20o%20checklist%20ISO%209001%20e%20gostaria%20de%20agendar%20o%20diagn%C3%B3stico%20gratuito." class="cta">Agendar diagnóstico gratuito</a>
<hr class="divider">
<p>Enquanto isso, confira nossos artigos:</p>
<p>→ <a href="https://anderstech.net/blog/quanto-custa-certificacao-iso-9001">Quanto custa a certificação ISO 9001?</a></p>
<p>→ <a href="https://anderstech.net/iso-9001-vale-a-pena">ISO 9001 vale a pena para minha empresa?</a></p>
<p>→ <a href="https://anderstech.net/calculadora-roi-certificacao">Calculadora ROI da certificação</a></p>
</div>`);
}
