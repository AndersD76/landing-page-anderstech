// ── Validação de case (padrão config/prova.js) ────────────────────────────────
// Mesma trava da prova social: campo sem fonte NÃO publica. A validação roda
// tanto no POST (rejeita na entrada) quanto no render (defesa em profundidade).

export function validarCase(c) {
  const erros = [];

  const obrigatorios = ['slug', 'cliente', 'segmento', 'servico', 'problema', 'solucao', 'resultado', 'resultado_fonte'];
  for (const campo of obrigatorios) {
    if (!c[campo] || typeof c[campo] !== 'string' || !c[campo].trim()) {
      erros.push(`${campo} é obrigatório`);
    } else if (c[campo].includes('[PREENCHER')) {
      erros.push(`${campo} contém [PREENCHER]`);
    }
  }

  if (c.resultado_fonte && typeof c.resultado_fonte === 'string' && !c.resultado_fonte.trim()) {
    erros.push('resultado_fonte não pode ser vazio');
  }

  if (c.depoimento_texto && typeof c.depoimento_texto === 'string' && c.depoimento_texto.trim()) {
    if (!c.depoimento_fonte || typeof c.depoimento_fonte !== 'string' || !c.depoimento_fonte.trim()) {
      erros.push('depoimento sem fonte: depoimento_fonte é obrigatório quando há depoimento');
    }
    if (!c.depoimento_autor || typeof c.depoimento_autor !== 'string' || !c.depoimento_autor.trim()) {
      erros.push('depoimento_autor é obrigatório quando há depoimento');
    }
    for (const f of ['depoimento_texto', 'depoimento_autor', 'depoimento_cargo', 'depoimento_fonte']) {
      if (c[f] && typeof c[f] === 'string' && c[f].includes('[PREENCHER')) {
        erros.push(`${f} contém [PREENCHER]`);
      }
    }
  }

  if (Array.isArray(c.metricas)) {
    for (let i = 0; i < c.metricas.length; i++) {
      const m = c.metricas[i];
      for (const campo of ['label', 'valor', 'fonte']) {
        if (!m[campo] || typeof m[campo] !== 'string' || !m[campo].trim()) {
          erros.push(`metricas[${i}].${campo} é obrigatório`);
        } else if (m[campo].includes('[PREENCHER')) {
          erros.push(`metricas[${i}].${campo} contém [PREENCHER]`);
        }
      }
    }
  }

  return erros;
}

export function casePublicavel(c) {
  return c.publicado && validarCase(c).length === 0;
}

export function slugValido(slug) {
  return typeof slug === 'string' && /^[a-z0-9-]+$/.test(slug) && slug.length >= 3 && slug.length <= 80;
}
