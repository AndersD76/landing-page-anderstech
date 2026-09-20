// ── Normalização da base SiAC / PBQP-H ───────────────────────────────────────
// Fonte: registro público do Ministério das Cidades. A base mistura codificação
// (parte UTF-8, parte latin-1 cru no mesmo arquivo) e repete município com e
// sem a UF colada — sem tratar, "OSÓRIO" vira "OS?RIO" e Curitiba conta duas
// vezes. Módulo puro para o teste rodar sem rede e sem banco.

// Quality gate: menos que isto, a página não existe (CLAUDE.md, regra 4).
export const GATE_MUNICIPIO = 5;

// Campos de contato existem na fonte e NUNCA saem daqui: publicar telefone e
// e-mail de ~3.950 empresas transformaria o site em lista de mala direta.
const CAMPOS_PROIBIDOS = ['telefone', 'e-mail', 'endereco', 'cep'];

export function corrigeTexto(v) {
  if (typeof v !== 'string') return '';
  if (!/[À-ÿ�]/.test(v)) return v;
  try {
    const consertado = Buffer.from(v, 'latin1').toString('utf8');
    return consertado.includes('�') ? v : consertado;
  } catch { return v; }
}

export function semAcento(v) {
  return corrigeTexto(v).normalize('NFD').replace(/[̀-ͯ]/g, '');
}

export function nomeMunicipio(v) {
  return semAcento(v)
    // "CURITIBA" e "CURITIBA/PR" são a mesma cidade.
    .replace(/[\s,/-]+[A-Za-z]{2}\.?$/, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toUpperCase();
}

export function slug(v) {
  return semAcento(v)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Título em caixa de nome próprio: a fonte entrega tudo em maiúscula, e título
// gritando é ruim de ler e pior de indexar.
const MINUSCULAS = new Set(['de', 'da', 'do', 'das', 'dos', 'e', 'a', 'o', 'em']);
export function capitaliza(v) {
  return corrigeTexto(v)
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .map((p, i) => (i > 0 && MINUSCULAS.has(p) ? p : p.charAt(0).toUpperCase() + p.slice(1)))
    .join(' ');
}

export function parseDataBR(br) {
  const m = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(String(br || '').trim());
  if (!m) return null;
  const d = new Date(Date.UTC(Number(m[3]), Number(m[2]) - 1, Number(m[1])));
  return Number.isNaN(d.getTime()) ? null : d;
}

export function formataDataBR(d) {
  if (!d) return null;
  const dt = d instanceof Date ? d : new Date(d);
  if (Number.isNaN(dt.getTime())) return null;
  return `${String(dt.getUTCDate()).padStart(2, '0')}/${String(dt.getUTCMonth() + 1).padStart(2, '0')}/${dt.getUTCFullYear()}`;
}

/**
 * Converte um registro bruto da fonte no formato publicável.
 * Registro sem validade é descartado: página que afirma vigência precisa da
 * data, e 2% da base não tem. Fonte incompleta excluindo registro é o gate
 * funcionando.
 */
export function normalizaRegistro(bruto, agora = new Date()) {
  const uf = String(bruto.uf || '').trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(uf)) return null;

  const validade = parseDataBR(bruto.validade);
  if (!validade) return null;

  const municipio = nomeMunicipio(bruto.municipio);
  if (!municipio) return null;

  // Nome de exibição preserva o acento: "SÃO PAULO" vira "São Paulo", e não
  // "Sao Paulo". A versão sem acento existe só como chave de agrupamento e
  // slug, onde acento atrapalha.
  const municipioExibicao = capitaliza(
    corrigeTexto(bruto.municipio).replace(/[\s,/-]+[A-Za-z]{2}\.?$/, '').replace(/\s+/g, ' ').trim()
  );

  const suspenso = !!String(bruto.suspensao || '').trim();
  if (validade < agora || suspenso) return null;   // só vigente vai ao ar

  return {
    empresa: capitaliza(bruto.empresa),
    cnpj: String(bruto.cnpj || '').trim() || null,
    uf,
    municipio,
    municipio_titulo: municipioExibicao || capitaliza(municipio),
    municipio_slug: slug(municipio),
    nivel: String(bruto.nivel || '').trim().toUpperCase() || null,
    subsetor: capitaliza(String(bruto.sub || '').replace(/\.$/, '')),
    organismo: String(bruto.oc || '').trim() || null,
    validade: validade.toISOString().slice(0, 10),
    emissao: parseDataBR(bruto.emissao)?.toISOString().slice(0, 10) || null,
  };
}

export function temCampoProibido(registro) {
  return CAMPOS_PROIBIDOS.some((c) => c in registro);
}

/** Agrupa por município e aplica o gate. Devolve só o que pode virar página. */
export function agrupaPorMunicipio(registros, gate = GATE_MUNICIPIO) {
  const mapa = new Map();
  for (const r of registros) {
    const chave = `${r.uf}/${r.municipio_slug}`;
    if (!mapa.has(chave)) {
      mapa.set(chave, {
        uf: r.uf,
        municipio: r.municipio,
        titulo: r.municipio_titulo,
        slug: r.municipio_slug,
        empresas: [],
      });
    }
    mapa.get(chave).empresas.push(r);
  }

  const em12meses = new Date();
  em12meses.setUTCFullYear(em12meses.getUTCFullYear() + 1);

  return [...mapa.values()]
    .map((m) => {
      m.empresas.sort((a, b) => a.validade.localeCompare(b.validade));
      const niveis = { A: 0, B: 0 };
      for (const e of m.empresas) if (niveis[e.nivel] !== undefined) niveis[e.nivel]++;
      return {
        ...m,
        total: m.empresas.length,
        nivelA: niveis.A,
        nivelB: niveis.B,
        organismos: new Set(m.empresas.map((e) => e.organismo).filter(Boolean)).size,
        vencendo12m: m.empresas.filter((e) => new Date(e.validade) <= em12meses).length,
        publicavel: m.empresas.length >= gate,
      };
    })
    .sort((a, b) => b.total - a.total || a.titulo.localeCompare(b.titulo));
}
