#!/usr/bin/env node
// Fix Portuguese accent issues in EAD lesson content (database + seed files)
// Run: node fix-accents.js [--dry-run] [--seeds-only] [--db-only]

const fs = require('fs');
const path = require('path');

const dryRun = process.argv.includes('--dry-run');
const seedsOnly = process.argv.includes('--seeds-only');
const dbOnly = process.argv.includes('--db-only');

// ── Safe whole-word replacements (always wrong without accent) ──
const WORD_FIXES = {
  // Missing tildes
  'nao': 'não', 'Nao': 'Não',
  'sao': 'são', 'Sao': 'São',
  'tambem': 'também', 'Tambem': 'Também',
  'alem': 'além', 'Alem': 'Além',
  'entao': 'então', 'Entao': 'Então',
  'funcao': 'função', 'Funcao': 'Função',
  'producao': 'produção', 'Producao': 'Produção',
  'organizacao': 'organização', 'Organizacao': 'Organização',
  'avaliacao': 'avaliação', 'Avaliacao': 'Avaliação',
  'certificacao': 'certificação', 'Certificacao': 'Certificação',
  'implementacao': 'implementação', 'Implementacao': 'Implementação',
  'especificacao': 'especificação', 'Especificacao': 'Especificação',
  'comunicacao': 'comunicação', 'Comunicacao': 'Comunicação',
  'informacao': 'informação', 'Informacao': 'Informação',
  'classificacao': 'classificação', 'Classificacao': 'Classificação',
  'documentacao': 'documentação', 'Documentacao': 'Documentação',
  'operacao': 'operação', 'Operacao': 'Operação',
  'preparacao': 'preparação', 'Preparacao': 'Preparação',
  'reclamacao': 'reclamação', 'Reclamacao': 'Reclamação',
  'apresentacao': 'apresentação', 'Apresentacao': 'Apresentação',
  'separacao': 'separação', 'Separacao': 'Separação',
  'expedicao': 'expedição', 'Expedicao': 'Expedição',
  'construcao': 'construção', 'Construcao': 'Construção',
  'substituicao': 'substituição', 'Substituicao': 'Substituição',
  'rejeicao': 'rejeição', 'Rejeicao': 'Rejeição',
  'punicao': 'punição', 'Punicao': 'Punição',
  'supervisao': 'supervisão', 'Supervisao': 'Supervisão',
  'suspensao': 'suspensão', 'Suspensao': 'Suspensão',
  'demarcacao': 'demarcação', 'Demarcacao': 'Demarcação',
  'designacao': 'designação', 'Designacao': 'Designação',
  'explicacao': 'explicação', 'Explicacao': 'Explicação',
  'compilacao': 'compilação', 'Compilacao': 'Compilação',
  'composicao': 'composição', 'Composicao': 'Composição',
  'demonstracao': 'demonstração', 'Demonstracao': 'Demonstração',
  'pontuacao': 'pontuação', 'Pontuacao': 'Pontuação',
  'aplicacao': 'aplicação', 'Aplicacao': 'Aplicação',
  'recorrencia': 'recorrência', 'Recorrencia': 'Recorrência',
  'integracao': 'integração', 'Integracao': 'Integração',
  'formacao': 'formação', 'Formacao': 'Formação',
  'atualizacao': 'atualização', 'Atualizacao': 'Atualização',
  'participacao': 'participação', 'Participacao': 'Participação',
  'acao': 'ação', 'Acao': 'Ação',
  'relacao': 'relação', 'Relacao': 'Relação',
  'reuniao': 'reunião', 'Reuniao': 'Reunião',
  'opcao': 'opção', 'Opcao': 'Opção',
  'licao': 'lição', 'Licao': 'Lição',
  'reflexao': 'reflexão', 'Reflexao': 'Reflexão',
  'compreensao': 'compreensão', 'Compreensao': 'Compreensão',
  'utilizacao': 'utilização', 'Utilizacao': 'Utilização',
  'posicao': 'posição', 'Posicao': 'Posição',
  'situacoes': 'situações', 'Situacoes': 'Situações',
  'conclusoes': 'conclusões', 'Conclusoes': 'Conclusões',
  'interacoes': 'interações', 'Interacoes': 'Interações',
  'reclamacoes': 'reclamações', 'Reclamacoes': 'Reclamações',
  'mudancas': 'mudanças', 'Mudancas': 'Mudanças',
  'confusoes': 'confusões', 'Confusoes': 'Confusões',
  // Missing accents on common words
  'area': 'área', 'Area': 'Área', 'areas': 'áreas', 'Areas': 'Áreas',
  'periodo': 'período', 'Periodo': 'Período',
  'criterio': 'critério', 'Criterio': 'Critério', 'criterios': 'critérios',
  'relatorio': 'relatório', 'Relatorio': 'Relatório', 'relatorios': 'relatórios',
  'vocabulario': 'vocabulário', 'Vocabulario': 'Vocabulário',
  'numero': 'número', 'Numero': 'Número', 'numeros': 'números',
  'metodo': 'método', 'Metodo': 'Método', 'metodos': 'métodos', 'Metodos': 'Métodos',
  'unico': 'único', 'Unico': 'Único', 'unica': 'única', 'Unica': 'Única',
  'tecnico': 'técnico', 'Tecnico': 'Técnico', 'tecnica': 'técnica', 'Tecnica': 'Técnica',
  'tecnicas': 'técnicas', 'Tecnicas': 'Técnicas', 'tecnicos': 'técnicos',
  'logica': 'lógica', 'Logica': 'Lógica',
  'indice': 'índice', 'Indice': 'Índice',
  'analise': 'análise', 'Analise': 'Análise',
  'critica': 'crítica', 'Critica': 'Crítica', 'critico': 'crítico', 'criticos': 'críticos',
  'historico': 'histórico', 'Historico': 'Histórico',
  'especifico': 'específico', 'Especifico': 'Específico', 'especifica': 'específica',
  'necessario': 'necessário', 'Necessario': 'Necessário', 'necessaria': 'necessária', 'necessarios': 'necessários',
  'obrigatoria': 'obrigatória', 'Obrigatoria': 'Obrigatória',
  'autonoma': 'autônoma', 'Autonoma': 'Autônoma',
  'periodica': 'periódica', 'Periodica': 'Periódica',
  'frequencia': 'frequência', 'Frequencia': 'Frequência',
  'experiencia': 'experiência', 'Experiencia': 'Experiência',
  'competencia': 'competência', 'Competencia': 'Competência',
  'independencia': 'independência', 'Independencia': 'Independência',
  'diligencia': 'diligência', 'Diligencia': 'Diligência',
  'tolerancia': 'tolerância', 'Tolerancia': 'Tolerância',
  'referencia': 'referência', 'Referencia': 'Referência', 'referencias': 'referências', 'Referencias': 'Referências',
  'diferenca': 'diferença', 'Diferenca': 'Diferença',
  'persistencia': 'persistência', 'Persistencia': 'Persistência',
  'consciencia': 'consciência', 'Consciencia': 'Consciência',
  'descrenca': 'descrença', 'Descrenca': 'Descrença',
  'abrangencia': 'abrangência', 'Abrangencia': 'Abrangência',
  'direcao': 'direção', 'Direcao': 'Direção',
  'servico': 'serviço', 'Servico': 'Serviço',
  'orcamento': 'orçamento', 'Orcamento': 'Orçamento',
  'ate': 'até', 'Ate': 'Até',
  'ja': 'já', 'Ja': 'Já',
  'so': 'só',
  'inicio': 'início', 'Inicio': 'Início',
  'horarios': 'horários', 'Horarios': 'Horários',
  'sinonimos': 'sinônimos', 'Sinonimos': 'Sinônimos',
  'setimo': 'sétimo', 'Setimo': 'Sétimo',
  'pratico': 'prático', 'Pratico': 'Prático',
  'uteis': 'úteis', 'Uteis': 'Úteis',
  'util': 'útil', 'Util': 'Útil',
  'habil': 'hábil', 'Habil': 'Hábil',
  'valido': 'válido', 'Valido': 'Válido', 'valida': 'válida',
  'rigido': 'rígido', 'Rigido': 'Rígido',
  'rapido': 'rápido', 'Rapido': 'Rápido', 'rapida': 'rápida',
  'estavel': 'estável', 'Estavel': 'Estável',
  'fisicas': 'físicas', 'fisico': 'físico', 'Fisico': 'Físico',
  'ultimos': 'últimos', 'Ultimos': 'Últimos',
  'niveis': 'níveis', 'Niveis': 'Níveis',
  'principios': 'princípios', 'Principios': 'Princípios',
  'estrategico': 'estratégico', 'Estrategico': 'Estratégico',
  'tatico': 'tático', 'Tatico': 'Tático',
  'etico': 'ético', 'Etico': 'Ético',
  'grafica': 'gráfica', 'Grafica': 'Gráfica',
  'farmaceutica': 'farmacêutica', 'Farmaceutica': 'Farmacêutica',
  'metalurgica': 'metalúrgica', 'Metalurgica': 'Metalúrgica',
  'clausula': 'cláusula', 'Clausula': 'Cláusula', 'clausulas': 'cláusulas', 'Clausulas': 'Cláusulas',
  'funcionarios': 'funcionários', 'Funcionarios': 'Funcionários',
  'pecas': 'peças', 'Pecas': 'Peças', 'peca': 'peça',
  'reforco': 'reforço', 'Reforco': 'Reforço',
  'reforcar': 'reforçar',
  'avancado': 'avançado', 'avancadas': 'avançadas', 'avancando': 'avançando',
  'chao': 'chão', 'Chao': 'Chão',
  'mao': 'mão', 'Mao': 'Mão',
  'Japao': 'Japão',
  'graos': 'grãos',
  'tres': 'três', 'Tres': 'Três',
  'gas': 'gás',
  'Oleo': 'Óleo', 'oleo': 'óleo',
  'residuos': 'resíduos', 'Residuos': 'Resíduos',
  'predio': 'prédio', 'Predio': 'Prédio',
  'decada': 'década', 'Decada': 'Década',
  'mutirao': 'mutirão', 'Mutirao': 'Mutirão',
  'comunitario': 'comunitário',
  'temporario': 'temporário',
  'armarios': 'armários',
  'eletricos': 'elétricos',
  'habito': 'hábito', 'Habito': 'Hábito',
  'ninguem': 'ninguém', 'Ninguem': 'Ninguém',
  'pontape': 'pontapé',
  'traducao': 'tradução',
  'enderecamento': 'endereçamento', 'Enderecamento': 'Endereçamento',
  'concluidas': 'concluídas',
  'concluida': 'concluída', 'Concluida': 'Concluída',
  'estatisticas': 'estatísticas', 'Estatisticas': 'Estatísticas',
  'cobranca': 'cobrança', 'Cobranca': 'Cobrança',
  'presenca': 'presença', 'Presenca': 'Presença',
  'equilibrio': 'equilíbrio', 'Equilibrio': 'Equilíbrio',
  'incalculavel': 'incalculável',
  'insubstituivel': 'insubstituível',
  'saida': 'saída', 'Saida': 'Saída',
  'mantem': 'mantém',
  'atras': 'atrás',
  'visao': 'visão', 'Visao': 'Visão',
  'extensao': 'extensão', 'Extensao': 'Extensão',
  'opiniao': 'opinião',
};

// Wrong accent placement fixes (always wrong)
const WRONG_ACCENT_FIXES = {
  'indústrial': 'industrial', 'Indústrial': 'Industrial',
  'métodologia': 'metodologia', 'Métodologia': 'Metodologia', 'métodologias': 'metodologias',
  'íntegração': 'integração', 'Íntegração': 'Integração',
  'estáções': 'estações',
  // útiliz* — "utilizar" é paroxítona, sem acento
  'útilização': 'utilização', 'Útilização': 'Utilização',
  'útilizada': 'utilizada', 'útilizadas': 'utilizadas',
  'útilizados': 'utilizados', 'útilize': 'utilize',
  'útilizam': 'utilizam', 'útiliza': 'utiliza',
  // fábric* — "fábrica" é correto, mas derivados (fabricante, fabricação) não têm acento
  'fábricante': 'fabricante', 'Fábricante': 'Fabricante', 'fábricantes': 'fabricantes',
  'fábricação': 'fabricação', 'Fábricação': 'Fabricação',
  'fábricava': 'fabricava',
  // fácil* — "fácil" é correto, mas derivados (facilita, facilitados) não têm acento
  'fácilita': 'facilita', 'fácilitados': 'facilitados',
  // essêncial — "essencial" é paroxítona terminada em L
  'essêncial': 'essencial', 'Essêncial': 'Essencial',
  'essênciais': 'essenciais',
  // sequêncial — idem
  'sequêncial': 'sequencial', 'Sequêncial': 'Sequencial',
  // comúnic* — "comunicar" é paroxítona
  'comúnicar': 'comunicar', 'Comúnicar': 'Comunicar',
  'comúnicação': 'comunicação', 'Comúnicação': 'Comunicação',
  'comúnicando': 'comunicando', 'comúnicações': 'comunicações',
  // gerênci* — "gerenciar" é paroxítona
  'gerênciar': 'gerenciar', 'gerênciais': 'gerenciais',
  'gerênciado': 'gerenciado',
  // específic* — "especificação" tem acento, mas derivados não
  'específicação': 'especificação',
  'específicados': 'especificados', 'específicadas': 'especificadas', 'específicado': 'especificado',
  'específicamente': 'especificamente',
  // referênciad* / evidênciad*
  'referênciados': 'referenciados', 'evidênciada': 'evidenciada',
  // válid* — "válido" é correto, mas "validade/validado" não têm acento
  'válidade': 'validade', 'Válidade': 'Validade',
  'válidado': 'validado', 'válidada': 'validada',
  // mestrês — "mestres" é paroxítona
  'mestrês': 'mestres',
  // iníciou — "iniciou" é paroxítona
  'iníciou': 'iniciou',
  // estrêsse — "estresse" é paroxítona
  'estrêsse': 'estresse',
  // advérbios em -mente nunca têm acento na penúltima
  'críticamente': 'criticamente',
  'rápidamente': 'rapidamente',
  'desnecessáriamente': 'desnecessariamente',
  'necessáriamente': 'necessariamente',
  'práticamente': 'praticamente',
  'técnicamente': 'tecnicamente',
  'diáriamente': 'diariamente',
};

// Broken HTML fixes
const HTML_FIXES = {
  '<\\strong>': '</strong>',
  '<\\td>': '</td>',
};

// Context-dependent "e" → "é" patterns (verb ser)
const E_PATTERNS = [
  // "X e Y" where X is a noun/pronoun and Y is a/um/uma/o/etc
  [/\b([Ii]sso|[Ee]la|[Ee]le|[Aa]uditoria|[Qq]ualidade|[Oo]bjetivo|[Rr]esultado|[Dd]ocumento|[Rr]equisito|[Pp]rocesso|[Cc]hecklist|[Oo] que|[Oo] ideal|[Nn]ão|[Qq]ual|SGQ|5S|ISO|PDCA) e (um|uma|o |a |importante|essencial|fundamental|necessário|necessária|obrigatório|obrigatória|quando|onde|possível|recomendável|que |como |considerado|considerada|baseado|baseada|diferente|semelhante|parecido|comum|raro|incomum|frequente|evidente|claro|simples|fácil|difícil|inaceitável|insubstituível|aceito|aceita|evidência|inspeção|ferramenta|fiscalização|NC|certificável|base|critério|norma|guia|referência|demonstração|sistema|instrumento|rígido|medido|gerenciado)\b/g,
    (m, pre, post) => `${pre} é ${post}`],
  // "não e " (always "não é")
  [/não e /g, 'não é '],
  [/Não e /g, 'Não é '],
  // "E um/uma" at start of sentence
  [/\. E (um|uma) /g, '. É $1 '],
  // "que e " → "que é "
  [/que e (um|uma|o |a |mais|muito|possível|necessário|necessária)\b/g, 'que é $1'],
];

function applyFixes(text) {
  let result = text;
  let count = 0;

  // 1. Wrong accent placement (do first to avoid conflicts)
  for (const [wrong, right] of Object.entries(WRONG_ACCENT_FIXES)) {
    const re = new RegExp(wrong.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    const before = result;
    result = result.replace(re, right);
    if (result !== before) count += (before.match(re) || []).length;
  }

  // 2. Broken HTML
  for (const [wrong, right] of Object.entries(HTML_FIXES)) {
    const re = new RegExp(wrong.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
    const before = result;
    result = result.replace(re, right);
    if (result !== before) count += (before.match(re) || []).length;
  }

  // 3. Whole-word replacements (safe)
  for (const [wrong, right] of Object.entries(WORD_FIXES)) {
    // Match word boundaries, but also handle start of HTML tags and quotes
    const re = new RegExp(`(?<=[\\s>",;:(\\[/—–-]|^)${wrong.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?=[\\s<",;:)\\].!?/—–-]|$)`, 'g');
    const before = result;
    result = result.replace(re, right);
    if (result !== before) {
      const matches = before.match(re);
      count += matches ? matches.length : 0;
    }
  }

  // 4. Context-dependent "e" → "é"
  for (const [pattern, replacement] of E_PATTERNS) {
    const before = result;
    result = result.replace(pattern, replacement);
    if (result !== before) count++;
  }

  return { text: result, fixes: count };
}

async function fixSeedFiles() {
  const seedDir = path.join(__dirname, 'ead');
  const seedFiles = ['seed-course1.js', 'seed-course2.js', 'seed-course3.js', 'seed-course4.js'];
  let totalFixes = 0;

  for (const file of seedFiles) {
    const filePath = path.join(seedDir, file);
    if (!fs.existsSync(filePath)) { console.log(`  Skip: ${file} not found`); continue; }

    const content = fs.readFileSync(filePath, 'utf8');
    const { text: fixed, fixes } = applyFixes(content);

    if (fixes > 0) {
      if (!dryRun) {
        fs.writeFileSync(filePath, fixed, 'utf8');
      }
      console.log(`  ${file}: ${fixes} corrections ${dryRun ? '(dry run)' : 'applied'}`);
      totalFixes += fixes;
    } else {
      console.log(`  ${file}: no issues found`);
    }
  }
  return totalFixes;
}

async function fixDatabase() {
  let neon;
  try {
    neon = require('@neondatabase/serverless').neon;
  } catch {
    console.log('  @neondatabase/serverless not found, skipping DB fix');
    return 0;
  }

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.log('  DATABASE_URL not set, skipping DB fix');
    return 0;
  }

  const sql = neon(dbUrl);
  const lessons = await sql`SELECT id, conteudo, titulo FROM ead_lessons WHERE conteudo IS NOT NULL`;
  let totalFixes = 0;

  for (const lesson of lessons) {
    const { text: fixedContent, fixes: contentFixes } = applyFixes(lesson.conteudo || '');
    const { text: fixedTitle, fixes: titleFixes } = applyFixes(lesson.titulo || '');
    const fixes = contentFixes + titleFixes;

    if (fixes > 0) {
      if (!dryRun) {
        await sql`UPDATE ead_lessons SET conteudo = ${fixedContent}, titulo = ${fixedTitle} WHERE id = ${lesson.id}`;
      }
      console.log(`  Lesson ${lesson.id} "${lesson.titulo.substring(0, 40)}...": ${fixes} corrections ${dryRun ? '(dry run)' : 'applied'}`);
      totalFixes += fixes;
    }
  }

  // Also fix module titles
  const modules = await sql`SELECT id, titulo, descricao FROM ead_modules`;
  for (const mod of modules) {
    const { text: fixedT, fixes: f1 } = applyFixes(mod.titulo || '');
    const { text: fixedD, fixes: f2 } = applyFixes(mod.descricao || '');
    if (f1 + f2 > 0) {
      if (!dryRun) {
        await sql`UPDATE ead_modules SET titulo = ${fixedT}, descricao = ${fixedD} WHERE id = ${mod.id}`;
      }
      console.log(`  Module ${mod.id} "${mod.titulo}": ${f1 + f2} corrections ${dryRun ? '(dry run)' : 'applied'}`);
      totalFixes += f1 + f2;
    }
  }

  return totalFixes;
}

(async () => {
  console.log('\n=== Fix Portuguese Accents ===\n');

  if (!dbOnly) {
    console.log('Fixing seed files...');
    const seedFixes = await fixSeedFiles();
    console.log(`  Total seed fixes: ${seedFixes}\n`);
  }

  if (!seedsOnly) {
    console.log('Fixing database...');
    const dbFixes = await fixDatabase();
    console.log(`  Total DB fixes: ${dbFixes}\n`);
  }

  console.log('Done.');
})();
