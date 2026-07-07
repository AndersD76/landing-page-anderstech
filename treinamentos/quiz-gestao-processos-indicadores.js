// ============================================================
// Quiz — Gestao de Processos e Indicadores
// 50 questoes (25 modulo + 25 prova final)
// Texto em pt-BR sem acentos
// ============================================================

const module1Quiz = [
  {
    pergunta: "Uma empresa recebe materia-prima, transforma em produto acabado e entrega ao cliente. Nesse contexto, qual elemento do modelo 'entrada-atividade-saida' representa a materia-prima?",
    alternativas: [
      "Atividade de transformacao",
      "Entrada (input) do processo",
      "Saida (output) do processo",
      "Recurso de apoio"
    ],
    resposta_correta: 1,
    explicacao: "No modelo entrada-atividade-saida, a materia-prima e um insumo que alimenta o processo, ou seja, e uma entrada (input). A transformacao e a atividade, e o produto acabado e a saida."
  },
  {
    pergunta: "O SIPOC de um processo de atendimento ao cliente lista: Fornecedor = equipe de TI, Entrada = chamado registrado, Processo = triagem e resolucao, Saida = chamado resolvido, Cliente = usuario final. Qual e o principal beneficio de construir esse SIPOC antes de mapear o fluxo detalhado?",
    alternativas: [
      "Eliminar a necessidade de indicadores de desempenho",
      "Definir o escopo e as fronteiras do processo de forma rapida e compartilhada",
      "Substituir o fluxograma detalhado permanentemente",
      "Garantir que nenhum defeito ocorra no processo"
    ],
    resposta_correta: 1,
    explicacao: "O SIPOC e uma ferramenta de visao macro que delimita fornecedores, entradas, processo, saidas e clientes, permitindo alinhar o escopo e as fronteiras antes de investir tempo no mapeamento detalhado."
  },
  {
    pergunta: "Na matriz RACI, a letra 'A' (Accountable) indica a pessoa que:",
    alternativas: [
      "Executa a tarefa no dia a dia",
      "Deve ser consultada antes de uma decisao",
      "Responde pelo resultado final e tem autoridade de aprovacao",
      "Apenas recebe informacao sobre o andamento"
    ],
    resposta_correta: 2,
    explicacao: "O 'A' de Accountable e o responsavel ultimo pelo resultado — quem presta contas e tem autoridade para aprovar. O 'R' (Responsible) e quem executa, 'C' (Consulted) e consultado e 'I' (Informed) e informado."
  },
  {
    pergunta: "Uma organizacao quer reduzir retrabalho no faturamento. O diretor financeiro nomeou um analista como 'dono do processo'. Qual e a principal atribuicao desse dono do processo?",
    alternativas: [
      "Executar pessoalmente todas as etapas do faturamento",
      "Garantir o desempenho ponta a ponta do processo, promovendo melhorias e removendo barreiras entre areas",
      "Aprovar cada nota fiscal emitida individualmente",
      "Substituir o diretor financeiro em reunioes estrategicas"
    ],
    resposta_correta: 1,
    explicacao: "O dono do processo (process owner) tem a responsabilidade de gerir o desempenho do processo de ponta a ponta, identificar oportunidades de melhoria e facilitar a integracao entre as areas envolvidas."
  },
  {
    pergunta: "Processos de negocio (primarios), processos de suporte e processos gerenciais sao tres categorias classicas. Uma atividade de manutencao preventiva de equipamentos e melhor classificada como:",
    alternativas: [
      "Processo primario, pois gera valor direto ao cliente externo",
      "Processo gerencial, pois envolve decisoes estrategicas",
      "Processo de suporte, pois sustenta a operacao dos processos primarios sem entregar valor direto ao cliente",
      "Processo finalistico, pois conclui a cadeia de valor"
    ],
    resposta_correta: 2,
    explicacao: "Manutencao preventiva nao entrega valor diretamente ao cliente final, mas e essencial para que os processos primarios funcionem. Por isso e classificada como processo de suporte."
  }
];

const module2Quiz = [
  {
    pergunta: "Um hospital mede '% de cirurgias realizadas no horario previsto' e '% de pacientes sem infeccao pos-operatoria'. O primeiro indicador avalia eficiencia e o segundo avalia eficacia. Por que essa classificacao esta correta?",
    alternativas: [
      "Porque eficiencia mede o resultado para o cliente e eficacia mede o uso de recursos",
      "Porque eficiencia se refere ao uso adequado de recursos (tempo) e eficacia ao alcance do resultado desejado (saude do paciente)",
      "Porque ambos medem eficacia, apenas em dimensoes diferentes",
      "Porque indicadores hospitalares sao sempre de eficiencia"
    ],
    resposta_correta: 1,
    explicacao: "Eficiencia avalia a relacao entre recursos utilizados e resultados obtidos (fazer certo, com menos recurso — neste caso, cumprir o horario). Eficacia avalia se o resultado pretendido foi alcancado (paciente sem infeccao)."
  },
  {
    pergunta: "Uma fabrica monitora 'horas de treinamento por colaborador/mes' e 'indice de defeitos por milhao de pecas'. Qual dos dois e um indicador leading (antecedente) e por que?",
    alternativas: [
      "'Indice de defeitos' e leading porque reflete o resultado final da producao",
      "'Horas de treinamento' e leading porque influencia resultados futuros antes que eles ocorram",
      "Ambos sao lagging porque medem algo que ja aconteceu",
      "'Horas de treinamento' e lagging porque depende de orcamento passado"
    ],
    resposta_correta: 1,
    explicacao: "Indicadores leading (antecedentes) medem acoes que influenciam resultados futuros. Mais treinamento tende a reduzir defeitos depois. Ja o 'indice de defeitos' e lagging (consequente), pois reflete o resultado ja ocorrido."
  },
  {
    pergunta: "No Balanced Scorecard (BSC), as quatro perspectivas classicas sao: financeira, clientes, processos internos e aprendizado/crescimento. Se uma empresa cria o indicador 'tempo medio de desenvolvimento de novos produtos', em qual perspectiva ele se encaixa melhor?",
    alternativas: [
      "Perspectiva financeira",
      "Perspectiva de clientes",
      "Perspectiva de processos internos",
      "Perspectiva de aprendizado e crescimento"
    ],
    resposta_correta: 2,
    explicacao: "O tempo de desenvolvimento de novos produtos mede a eficiencia de um processo interno da organizacao (P&D/inovacao), portanto se enquadra na perspectiva de processos internos do BSC."
  },
  {
    pergunta: "Um gerente criou um dashboard com 47 indicadores exibidos simultaneamente. Qual e o principal problema dessa abordagem?",
    alternativas: [
      "Dashboards nao devem conter graficos, apenas tabelas",
      "O excesso de indicadores dificulta o foco, a analise e a tomada de decisao rapida",
      "Indicadores so podem ser exibidos em relatorios impressos",
      "O numero ideal de indicadores por dashboard e exatamente 50"
    ],
    resposta_correta: 1,
    explicacao: "Um dashboard eficaz deve destacar os poucos indicadores-chave (KPIs) que realmente direcionam decisoes. Com 47 indicadores, o gestor perde foco, demora para interpretar e pode ignorar sinais criticos."
  },
  {
    pergunta: "O desdobramento estrategico de indicadores significa que:",
    alternativas: [
      "Todos os departamentos usam exatamente o mesmo KPI da diretoria",
      "Os objetivos estrategicos sao traduzidos em metas e indicadores em cada nivel organizacional, mantendo alinhamento vertical",
      "Apenas a alta direcao acompanha indicadores; os demais niveis seguem ordens",
      "Cada area cria seus proprios indicadores sem conexao com a estrategia"
    ],
    resposta_correta: 1,
    explicacao: "Desdobramento estrategico e o processo de traduzir objetivos corporativos em metas e indicadores especificos para cada nivel (diretoria > gerencia > operacao), garantindo que todos contribuam para a mesma direcao."
  }
];

const module3Quiz = [
  {
    pergunta: "No ciclo SDCA, a letra 'S' representa 'Standard' (Padrao). Qual e a funcao principal do SDCA na gestao da rotina?",
    alternativas: [
      "Promover inovacoes radicais nos processos existentes",
      "Manter o processo estavel, garantindo que o padrao atual seja seguido e os resultados previsiveis",
      "Substituir o PDCA em todas as situacoes",
      "Eliminar a necessidade de indicadores de desempenho"
    ],
    resposta_correta: 1,
    explicacao: "O SDCA (Standardize-Do-Check-Act) e o ciclo de manutencao: padronizar, executar conforme o padrao, verificar se os resultados estao dentro do esperado e agir corretivamente se houver desvio. Seu foco e estabilidade."
  },
  {
    pergunta: "Uma equipe identificou que o indice de reclamacoes subiu 30% no ultimo trimestre. Decidiram investigar causas, testar contramedidas e, se eficazes, padronizar a solucao. Qual ciclo estao aplicando?",
    alternativas: [
      "SDCA, pois estao mantendo a rotina",
      "PDCA de melhoria, pois estao atacando um problema para elevar o patamar de desempenho",
      "Apenas a etapa 'Check' isoladamente",
      "Nenhum ciclo — estao improvisando"
    ],
    resposta_correta: 1,
    explicacao: "Quando se identifica um gap de desempenho e se busca elevar o patamar, aplica-se o PDCA de melhoria: planejar contramedidas (P), executar (D), verificar resultados (C) e padronizar ou corrigir (A)."
  },
  {
    pergunta: "Na etapa 'Check' do PDCA, a equipe deve:",
    alternativas: [
      "Definir as metas e o plano de acao",
      "Executar o plano conforme planejado",
      "Comparar os resultados obtidos com as metas planejadas, usando dados e fatos",
      "Padronizar a solucao para toda a organizacao"
    ],
    resposta_correta: 2,
    explicacao: "A etapa Check e de verificacao: coletar dados sobre os resultados reais e compara-los com as metas definidas no Plan. E aqui que se confirma se as acoes surtiram efeito ou nao."
  },
  {
    pergunta: "Um supervisor percebe que operadores executam a mesma tarefa de tres formas diferentes, gerando variacao nos resultados. Qual abordagem da gestao da rotina resolve isso primeiro?",
    alternativas: [
      "Aplicar PDCA de melhoria para redesenhar todo o processo",
      "Estabelecer e treinar um padrao unico (SDCA) antes de tentar melhorar",
      "Criar um novo indicador estrategico no BSC",
      "Realizar brainstorming para inovar a tarefa"
    ],
    resposta_correta: 1,
    explicacao: "Antes de melhorar, e preciso estabilizar. Se nao ha padrao unico, a prioridade e padronizar (S do SDCA), treinar a equipe (D), verificar adesao (C) e corrigir desvios (A). So depois faz sentido rodar PDCA de melhoria."
  },
  {
    pergunta: "Na etapa 'Act' do PDCA, se os resultados do 'Check' mostraram que a meta NAO foi atingida, a acao correta e:",
    alternativas: [
      "Padronizar a solucao mesmo assim para ganhar tempo",
      "Analisar por que a meta nao foi atingida, identificar novas causas e replanejar (girar novo PDCA)",
      "Abandonar o projeto e aceitar o resultado atual",
      "Pular direto para a execucao de outra solucao sem analise"
    ],
    resposta_correta: 1,
    explicacao: "Se a meta nao foi atingida, o 'Act' corretivo exige investigar as causas do insucesso e girar um novo ciclo PDCA com plano revisado. Padronizar so faz sentido quando os resultados confirmam a eficacia da solucao."
  }
];

const module4Quiz = [
  {
    pergunta: "Uma equipe usa o diagrama de Ishikawa para investigar o aumento de devolucoes de produto. Organizaram as causas em: Mao de obra, Maquina, Metodo, Material, Meio ambiente e Medicao. Ao listar 'operador sem treinamento atualizado', em qual categoria isso se encaixa?",
    alternativas: [
      "Maquina",
      "Metodo",
      "Mao de obra",
      "Material"
    ],
    resposta_correta: 2,
    explicacao: "A categoria 'Mao de obra' (ou Pessoas) abrange causas relacionadas a competencia, treinamento, motivacao e erro humano. 'Operador sem treinamento atualizado' e claramente uma causa ligada a pessoas."
  },
  {
    pergunta: "Ao aplicar os 5 Porques a um problema de atraso na entrega, a equipe chegou ao terceiro 'por que' e encontrou: 'porque o fornecedor atrasou a materia-prima'. Um membro sugeriu parar a analise aqui. Isso e adequado?",
    alternativas: [
      "Sim, pois ja encontraram um culpado externo e nao ha mais o que fazer",
      "Nao, pois a tecnica exige continuar perguntando ate encontrar uma causa raiz sobre a qual a organizacao pode agir",
      "Sim, pois tres niveis de 'por que' sao suficientes por definicao",
      "Nao, pois os 5 Porques exigem obrigatoriamente exatos cinco niveis, nem mais nem menos"
    ],
    resposta_correta: 1,
    explicacao: "O objetivo dos 5 Porques e chegar a uma causa raiz acionavel. Parar em 'o fornecedor atrasou' nao revela por que a empresa depende de um unico fornecedor ou por que nao ha estoque de seguranca. Deve-se continuar ate encontrar algo que a organizacao possa mudar."
  },
  {
    pergunta: "Apos coletar dados de reclamacoes, uma equipe plotou um grafico de Pareto e descobriu que 3 tipos de defeito (de 12 catalogados) representam 78% das reclamacoes. Qual e a decisao mais coerente com o principio de Pareto?",
    alternativas: [
      "Tratar todos os 12 tipos de defeito simultaneamente para ser justo",
      "Priorizar acoes corretivas nos 3 tipos de defeito que concentram a maioria do impacto",
      "Ignorar os 3 tipos principais e focar nos 9 restantes por serem mais faceis",
      "Refazer a coleta de dados porque 78% nao e exatamente 80%"
    ],
    resposta_correta: 1,
    explicacao: "O principio de Pareto (80/20) orienta focar nos poucos vitais que geram a maior parte do problema. Atacar os 3 defeitos que causam 78% das reclamacoes maximiza o retorno do esforco de melhoria."
  },
  {
    pergunta: "Uma equipe elaborou um plano de acao usando 5W2H. O campo 'How much' (Quanto custa) ficou em branco porque 'nao havia orcamento definido ainda'. Qual e o risco dessa omissao?",
    alternativas: [
      "Nenhum risco — o custo pode ser definido depois sem consequencias",
      "A acao pode ser inviabilizada por falta de recurso, gerar surpresas financeiras ou ser cancelada no meio da execucao",
      "O 5W2H so funciona com 5 campos; os 2H sao opcionais",
      "O orcamento so importa em projetos acima de um milhao de reais"
    ],
    resposta_correta: 1,
    explicacao: "O 'How much' existe justamente para antecipar a viabilidade financeira. Deixa-lo em branco pode levar a iniciar acoes sem recurso, causar estouro de orcamento ou ter o projeto interrompido por falta de verba."
  },
  {
    pergunta: "Uma sessao de brainstorming para resolver paradas de maquina esta sendo conduzida. O facilitador interrompeu um participante dizendo 'essa ideia nao faz sentido'. Qual regra fundamental do brainstorming foi violada?",
    alternativas: [
      "A regra de limitar o numero de participantes a tres pessoas",
      "A regra de nao criticar ou julgar ideias durante a fase de geracao",
      "A regra de so aceitar ideias do gestor da area",
      "A regra de documentar apenas ideias viaveis financeiramente"
    ],
    resposta_correta: 1,
    explicacao: "Uma regra essencial do brainstorming e a suspensao do julgamento durante a geracao de ideias. Criticar inibe a criatividade e a participacao. A avaliacao e filtragem vem numa etapa posterior."
  }
];

const module5Quiz = [
  {
    pergunta: "Um POP (Procedimento Operacional Padrao) de limpeza de equipamento foi escrito pelo engenheiro de processos sem consultar os operadores que executam a tarefa. Qual e o principal risco dessa abordagem?",
    alternativas: [
      "O POP ficara excessivamente simples e curto",
      "O POP pode conter etapas impraticaveis ou omitir detalhes criticos conhecidos apenas por quem executa, reduzindo adesao",
      "Nenhum risco — o engenheiro tem mais conhecimento tecnico",
      "O POP sera automaticamente invalido perante a ISO 9001"
    ],
    resposta_correta: 1,
    explicacao: "POPs eficazes devem ser construidos com a participacao de quem executa a tarefa. Sem essa contribuicao, o documento pode ser teorico demais, omitir macetes praticos e gerar baixa adesao por falta de pertencimento."
  },
  {
    pergunta: "O controle de documentos exige que versoes obsoletas sejam identificadas ou retiradas de circulacao. Uma fabrica mantem versoes antigas e atuais do mesmo POP misturadas na mesma pasta. Qual e a consequencia mais provavel?",
    alternativas: [
      "Aumento da criatividade dos operadores ao escolher qual versao seguir",
      "Risco de operadores executarem procedimentos desatualizados, gerando erros, retrabalho ou nao conformidades",
      "Economia de papel e tinta por reutilizar documentos antigos",
      "Melhoria na rastreabilidade dos processos"
    ],
    resposta_correta: 1,
    explicacao: "Misturar versoes obsoletas e vigentes e uma falha grave de controle de documentos. Operadores podem seguir instrucoes desatualizadas, gerando defeitos, riscos de seguranca e nao conformidades em auditorias."
  },
  {
    pergunta: "O conceito de kaizen enfatiza:",
    alternativas: [
      "Grandes transformacoes radicais realizadas por consultores externos a cada cinco anos",
      "Melhorias pequenas e continuas realizadas por todos no dia a dia, de forma acumulativa",
      "A eliminacao total de qualquer padrao escrito para dar liberdade ao operador",
      "A automacao completa de todos os processos antes de qualquer melhoria"
    ],
    resposta_correta: 1,
    explicacao: "Kaizen (kai = mudanca, zen = melhor) e a filosofia de melhoria continua incremental, onde todos — da alta direcao ao operador — contribuem com pequenas melhorias diarias que, somadas, geram resultados expressivos."
  },
  {
    pergunta: "Uma empresa implantou um programa de melhoria continua, mas os operadores dizem: 'Aqui a gente sugere, mas nunca muda nada'. Qual elemento da cultura de melhoria continua esta falhando?",
    alternativas: [
      "A quantidade de ferramentas da qualidade disponiveis",
      "O feedback e o reconhecimento — sugestoes precisam ser avaliadas, respondidas e, quando viaveis, implementadas visivelmente",
      "A capacidade tecnica dos operadores de usar estatistica avancada",
      "O numero de reunioes mensais sobre melhoria"
    ],
    resposta_correta: 1,
    explicacao: "Cultura de melhoria continua exige que as sugestoes sejam ouvidas, avaliadas com transparencia e, quando aprovadas, implementadas com reconhecimento ao autor. Sem esse ciclo de feedback, a participacao morre."
  },
  {
    pergunta: "Apos uma melhoria bem-sucedida via PDCA (ex.: reducao de 40% nos defeitos), qual e o proximo passo para garantir que o ganho nao se perca?",
    alternativas: [
      "Encerrar o projeto e passar para outro problema, confiando que as pessoas lembrem o que mudou",
      "Padronizar a nova pratica em POPs atualizados, treinar a equipe e monitorar com SDCA",
      "Voltar ao metodo antigo para comparar novamente",
      "Publicar o resultado em redes sociais antes de padronizar"
    ],
    resposta_correta: 1,
    explicacao: "O ganho so se sustenta se for padronizado (atualizar POPs), disseminado (treinar todos) e monitorado (SDCA). Sem padronizacao, a tendencia e regredir ao modo anterior com o tempo."
  }
];

const finalQuiz = [
  // --- Modulo 1: Pensamento por Processos (5 questoes) ---
  {
    pergunta: "Uma clinica veterinaria mapeou seu processo de consulta usando o modelo entrada-atividade-saida. A 'ficha de anamnese preenchida pelo tutor' e classificada como:",
    alternativas: [
      "Uma atividade do processo",
      "Uma saida do processo",
      "Uma entrada (input) do processo de consulta",
      "Um indicador de desempenho"
    ],
    resposta_correta: 2,
    explicacao: "A ficha preenchida pelo tutor e um insumo que alimenta o processo de consulta — portanto e uma entrada. A consulta em si e a atividade, e o diagnostico/prescricao e a saida."
  },
  {
    pergunta: "No SIPOC de um processo de compras, o 'C' (Customer) seria:",
    alternativas: [
      "O fornecedor que vende o insumo",
      "O setor ou pessoa que recebe o resultado do processo de compras (ex.: producao que recebera o material)",
      "O banco que financia a compra",
      "O auditor externo que verifica o processo"
    ],
    resposta_correta: 1,
    explicacao: "No SIPOC, 'Customer' e quem recebe a saida do processo. No processo de compras, o cliente interno tipico e a area requisitante (ex.: producao), que recebera o material comprado."
  },
  {
    pergunta: "Na matriz RACI de um projeto, uma mesma pessoa foi marcada como 'A' (Accountable) em todas as 25 atividades. Qual e o problema mais provavel dessa configuracao?",
    alternativas: [
      "Nenhum — e ideal ter um unico responsavel por tudo",
      "Sobrecarga de decisao, gargalo de aprovacao e risco de atraso por concentracao excessiva de autoridade",
      "A matriz fica visualmente mais bonita assim",
      "E obrigatorio ter pelo menos 10 pessoas como Accountable"
    ],
    resposta_correta: 1,
    explicacao: "Concentrar o 'A' em uma unica pessoa para muitas atividades cria gargalo: tudo depende de uma aprovacao, gerando filas, atrasos e sobrecarga. O ideal e distribuir o 'A' conforme competencia e alcada."
  },
  {
    pergunta: "O setor de RH, o setor financeiro e o setor de TI sao exemplos tipicos de processos de qual categoria?",
    alternativas: [
      "Processos primarios (finalisticos), pois entregam valor ao cliente externo",
      "Processos de suporte, pois viabilizam a operacao dos processos primarios",
      "Processos gerenciais, pois definem a estrategia da empresa",
      "Processos externos, pois sao terceirizados"
    ],
    resposta_correta: 1,
    explicacao: "RH, financeiro e TI sao areas de apoio que fornecem recursos e servicos internos para que os processos primarios (que geram valor ao cliente final) funcionem. Sao processos de suporte."
  },
  {
    pergunta: "Um dono de processo identificou que duas areas disputam a responsabilidade por uma etapa critica, gerando conflitos e retrabalho. Sua melhor acao como process owner e:",
    alternativas: [
      "Ignorar o conflito e esperar que se resolva sozinho",
      "Eliminar a etapa critica para evitar conflito",
      "Definir claramente papeis e responsabilidades (ex.: via RACI) e mediar o acordo entre as areas",
      "Transferir o problema para o RH resolver"
    ],
    resposta_correta: 2,
    explicacao: "O dono do processo tem a atribuicao de remover barreiras interfuncionais. Clarificar papeis com ferramentas como RACI e mediar acordos entre areas e exatamente seu papel."
  },

  // --- Modulo 2: Indicadores de Desempenho (5 questoes) ---
  {
    pergunta: "Uma transportadora mede 'custo por km rodado' e '% de entregas no prazo'. Qual indicador mede eficiencia e qual mede eficacia?",
    alternativas: [
      "Ambos medem eficiencia",
      "'Custo por km' mede eficacia e '% entregas no prazo' mede eficiencia",
      "'Custo por km' mede eficiencia (uso de recursos) e '% entregas no prazo' mede eficacia (resultado para o cliente)",
      "Nenhum dos dois mede eficiencia ou eficacia"
    ],
    resposta_correta: 2,
    explicacao: "Eficiencia = otimizacao de recursos (custo/km avalia quanto recurso se gasta por unidade de servico). Eficacia = atingimento do resultado desejado (entregar no prazo e o que o cliente espera)."
  },
  {
    pergunta: "Um gestor acompanha apenas indicadores lagging (consequentes) como faturamento e lucro liquido. Qual e a limitacao dessa pratica?",
    alternativas: [
      "Indicadores lagging sao imprecisos e nao confiaveis",
      "Ele so vera os resultados depois que ja ocorreram, sem capacidade de antecipar problemas ou corrigir o rumo a tempo",
      "Indicadores lagging nao existem na pratica",
      "Nao ha limitacao — lagging e o unico tipo que importa"
    ],
    resposta_correta: 1,
    explicacao: "Indicadores lagging refletem o passado. Sem indicadores leading (como pipeline de vendas, NPS de atendimento), o gestor nao tem sinais antecipados para agir preventivamente antes que os resultados caiam."
  },
  {
    pergunta: "No BSC, a perspectiva de 'Aprendizado e Crescimento' tipicamente inclui indicadores sobre:",
    alternativas: [
      "Receita, margem e ROI",
      "Satisfacao do cliente e market share",
      "Capacitacao de pessoas, clima organizacional, inovacao e infraestrutura de TI",
      "Lead time de producao e taxa de defeitos"
    ],
    resposta_correta: 2,
    explicacao: "A perspectiva de Aprendizado e Crescimento do BSC abrange capital humano (competencias, treinamento), capital da informacao (sistemas, TI) e capital organizacional (cultura, lideranca, clima)."
  },
  {
    pergunta: "Ao desdobrar a meta corporativa 'reduzir custo operacional em 10%' para o nivel da fabrica, um indicador adequado seria:",
    alternativas: [
      "Nota do NPS (Net Promoter Score)",
      "Numero de seguidores nas redes sociais",
      "Custo de producao por unidade fabricada",
      "Tempo medio de contratacao de novos colaboradores"
    ],
    resposta_correta: 2,
    explicacao: "Desdobrar significa traduzir a meta corporativa em algo acionavel no nivel operacional. 'Custo de producao por unidade' esta diretamente ligado ao custo operacional e e controlavel pela fabrica."
  },
  {
    pergunta: "Qual e a diferenca fundamental entre um indicador e uma meta?",
    alternativas: [
      "Nao ha diferenca — sao sinonimos",
      "O indicador e a metrica que mede o desempenho; a meta e o valor-alvo que se deseja alcancar naquele indicador em um periodo",
      "A meta e qualitativa e o indicador e sempre financeiro",
      "O indicador e definido pelo operador e a meta pelo cliente"
    ],
    resposta_correta: 1,
    explicacao: "Indicador e o 'o que medir' (ex.: % de defeitos). Meta e o 'quanto atingir e quando' (ex.: reduzir para 2% ate dezembro). Sem meta, o indicador nao direciona acao."
  },

  // --- Modulo 3: PDCA (5 questoes) ---
  {
    pergunta: "Uma padaria mantem a receita de pao frances ha 20 anos, verificando diariamente se o peso e sabor estao no padrao. Quando detecta desvio, ajusta a massa imediatamente. Qual ciclo descreve essa pratica?",
    alternativas: [
      "PDCA de melhoria, pois estao buscando um novo patamar de qualidade",
      "SDCA, pois estao mantendo um padrao ja estabelecido e corrigindo desvios",
      "Apenas a etapa Plan do PDCA",
      "Ciclo de inovacao radical"
    ],
    resposta_correta: 1,
    explicacao: "A padaria nao esta tentando melhorar a receita — esta mantendo o padrao (S), executando (D), verificando peso e sabor (C) e corrigindo desvios (A). E o ciclo SDCA classico de manutencao da rotina."
  },
  {
    pergunta: "Na etapa 'Plan' do PDCA de melhoria, as principais sub-etapas incluem:",
    alternativas: [
      "Executar acoes e medir resultados imediatamente",
      "Identificar o problema, analisar causas raiz, definir metas e elaborar plano de acao",
      "Padronizar a solucao encontrada em toda a empresa",
      "Treinar os operadores no novo procedimento"
    ],
    resposta_correta: 1,
    explicacao: "O 'Plan' e a etapa mais robusta do PDCA: inclui identificar e priorizar o problema, coletar dados, analisar causas (Ishikawa, 5 Porques), estabelecer metas e criar o plano de acao (5W2H)."
  },
  {
    pergunta: "Uma equipe executou o plano de acao (etapa Do) mas nao coletou dados durante a execucao. Ao chegar na etapa Check, nao consegue avaliar se a meta foi atingida. Qual principio do PDCA foi violado?",
    alternativas: [
      "A necessidade de padronizar antes de melhorar",
      "A obrigatoriedade de gestao baseada em fatos e dados — sem dados, o Check fica impossivel",
      "A regra de nunca executar acoes sem aprovacao da diretoria",
      "O principio de que toda melhoria deve gerar lucro imediato"
    ],
    resposta_correta: 1,
    explicacao: "O PDCA depende de gestao por fatos e dados. Se na etapa Do nao se coletam dados (antes, durante, depois), a etapa Check nao tem base para comparar resultados com metas. O ciclo se quebra."
  },
  {
    pergunta: "Qual e a relacao correta entre SDCA e PDCA na gestao da rotina e melhoria?",
    alternativas: [
      "SDCA e PDCA sao a mesma coisa com nomes diferentes",
      "Primeiro se estabiliza o processo com SDCA, depois se melhora com PDCA; apos a melhoria, padroniza-se novamente com SDCA",
      "PDCA serve para manter e SDCA serve para melhorar",
      "SDCA substitui o PDCA em empresas grandes"
    ],
    resposta_correta: 1,
    explicacao: "A sequencia ideal e: SDCA para estabilizar (manter o padrao) > PDCA para melhorar (elevar o patamar) > SDCA para consolidar o novo padrao. E um ciclo virtuoso entre manutencao e melhoria."
  },
  {
    pergunta: "Na etapa 'Act' do PDCA, quando os resultados do 'Check' confirmam que a meta FOI atingida, a acao correta e:",
    alternativas: [
      "Repetir exatamente o mesmo ciclo PDCA para confirmar novamente",
      "Padronizar a solucao (atualizar POPs, treinar equipe) e estabelecer controles para manter o novo patamar",
      "Descartar todos os dados coletados para comecar do zero",
      "Aumentar automaticamente a meta em 50% sem analise"
    ],
    resposta_correta: 1,
    explicacao: "Quando o PDCA atinge a meta, o 'Act' padronizador consolida o ganho: atualiza procedimentos, treina a equipe, define controles (SDCA) e pode definir novas metas para um proximo ciclo de melhoria."
  },

  // --- Modulo 4: Ferramentas da Qualidade (5 questoes) ---
  {
    pergunta: "Uma equipe construiu um diagrama de Ishikawa e listou 30 causas potenciais para atraso na entrega. Qual ferramenta complementar ajuda a priorizar quais causas investigar primeiro?",
    alternativas: [
      "Outro diagrama de Ishikawa maior",
      "Diagrama de Pareto, para identificar as poucas causas que geram a maior parte do problema",
      "Folha de verificacao para gerar novas ideias",
      "Brainstorming para eliminar causas sem dados"
    ],
    resposta_correta: 1,
    explicacao: "Apos o Ishikawa listar causas, o Pareto ajuda a priorizar: coleta-se dados sobre frequencia ou impacto de cada causa e identifica-se os 'poucos vitais' que merecem acao imediata."
  },
  {
    pergunta: "Ao aplicar a ferramenta 5W2H para uma acao corretiva, o campo 'Why' (Por que) serve para:",
    alternativas: [
      "Descrever quem vai executar a acao",
      "Justificar a necessidade da acao e conecta-la ao problema que se deseja resolver",
      "Definir o orcamento da acao",
      "Estabelecer o prazo final de entrega"
    ],
    resposta_correta: 1,
    explicacao: "O 'Why' registra a justificativa — por que essa acao e necessaria e qual problema ela resolve. Isso da sentido a acao, facilita a priorizacao e evita que se executem tarefas sem proposito claro."
  },
  {
    pergunta: "Uma folha de verificacao (check sheet) e mais util quando se precisa:",
    alternativas: [
      "Gerar ideias criativas sem restricoes",
      "Coletar dados de forma sistematica e organizada durante um periodo, para posterior analise",
      "Desenhar o fluxo de atividades de um processo",
      "Definir responsabilidades entre areas"
    ],
    resposta_correta: 1,
    explicacao: "A folha de verificacao e uma ferramenta simples de coleta de dados estruturada: define-se o que observar, cria-se categorias e registra-se ocorrencias sistematicamente. Os dados coletados alimentam analises como Pareto."
  },
  {
    pergunta: "Um fluxograma de processo revelou que existem 5 etapas de inspecao/aprovacao consecutivas antes do despacho de mercadoria. Esse achado sugere:",
    alternativas: [
      "Que o processo e altamente eficiente por ter muitas verificacoes",
      "Potencial excesso de controle que gera atraso e custo sem agregar valor proporcional — candidato a simplificacao",
      "Que o fluxograma esta desenhado incorretamente",
      "Que mais etapas de inspecao devem ser adicionadas"
    ],
    resposta_correta: 1,
    explicacao: "Fluxogramas revelam redundancias. Cinco inspecoes consecutivas sugerem excesso de controle, gerando filas e custos. A analise deve avaliar se todas agregam valor ou se podem ser consolidadas ou eliminadas."
  },
  {
    pergunta: "Durante um 5 Porques, a equipe descobriu que a causa raiz de uma falha mecanica era 'falta de manutencao preventiva porque nao existe um plano de manutencao'. Qual tipo de acao corretiva seria mais eficaz?",
    alternativas: [
      "Consertar apenas a maquina que quebrou e aguardar a proxima falha",
      "Criar e implementar um plano de manutencao preventiva sistematico para todo o parque de maquinas",
      "Comprar uma maquina nova sem plano de manutencao",
      "Punir o operador que estava no turno quando a falha ocorreu"
    ],
    resposta_correta: 1,
    explicacao: "A causa raiz e sistemica (falta de plano de manutencao), entao a correcao deve ser sistemica: criar o plano, implementa-lo e monitorar a adesao. Consertar so a maquina que quebrou seria tratar o sintoma, nao a causa."
  },

  // --- Modulo 5: Padronizacao e Melhoria Continua (5 questoes) ---
  {
    pergunta: "Um POP deve ser escrito de forma que:",
    alternativas: [
      "Apenas engenheiros com pos-graduacao consigam interpretar",
      "Qualquer pessoa treinada na funcao consiga executar a tarefa de forma correta e uniforme",
      "Seja o mais longo possivel para cobrir todas as eventualidades imaginaveis",
      "Use exclusivamente linguagem tecnica de normas ISO no original em ingles"
    ],
    resposta_correta: 1,
    explicacao: "O POP deve ser claro, objetivo e acessivel ao publico-alvo (quem executa a tarefa). Se o operador nao entende o documento, ele nao segue — e o padrao se torna letra morta."
  },
  {
    pergunta: "Em um sistema de controle de documentos, cada POP deve conter: numero de revisao, data de aprovacao, responsavel pela aprovacao e identificacao de alteracoes. Qual e a finalidade principal desses elementos?",
    alternativas: [
      "Apenas cumprir uma formalidade burocratica sem valor pratico",
      "Garantir rastreabilidade, evitar uso de versoes obsoletas e assegurar que alteracoes foram autorizadas",
      "Dificultar o acesso dos operadores ao documento",
      "Aumentar o numero de paginas do documento para parecer mais completo"
    ],
    resposta_correta: 1,
    explicacao: "Esses elementos de controle garantem que se saiba qual e a versao vigente, quem aprovou, quando, e o que mudou. Isso evita uso de versoes antigas e assegura governanca sobre as mudancas."
  },
  {
    pergunta: "O conceito de melhoria continua pressupoe que:",
    alternativas: [
      "A perfeicao e alcancavel e, uma vez atingida, nao ha mais o que melhorar",
      "Sempre ha oportunidade de melhorar, mesmo quando os resultados atuais sao bons — o ciclo nunca para",
      "Melhorias so devem ser feitas quando o cliente reclama",
      "Apenas a diretoria pode propor melhorias nos processos"
    ],
    resposta_correta: 1,
    explicacao: "Melhoria continua e uma mentalidade: nao existe processo perfeito. Mesmo com bons resultados, sempre ha como reduzir desperdicio, aumentar valor ou prevenir problemas. O ciclo PDCA nunca cessa."
  },
  {
    pergunta: "Uma empresa implementou kaizen e, no primeiro ano, recebeu 200 sugestoes de operadores. Dessas, 150 foram implementadas. No segundo ano, apenas 20 sugestoes surgiram. O que provavelmente aconteceu?",
    alternativas: [
      "Todos os problemas ja foram resolvidos no primeiro ano",
      "A empresa pode ter falhado em manter o engajamento — faltou reconhecimento, feedback ou as sugestoes ficaram sem retorno",
      "E normal que programas kaizen durem exatamente um ano",
      "Os operadores ficaram ocupados demais com suas tarefas e nao precisam mais sugerir"
    ],
    resposta_correta: 1,
    explicacao: "Queda brusca de sugestoes geralmente indica falha na sustentacao cultural: falta de feedback, reconhecimento lento, sugestoes ignoradas ou burocracia excessiva. Manter o kaizen vivo exige gestao ativa do programa."
  },
  {
    pergunta: "Apos padronizar uma melhoria (novo POP), a equipe percebeu que em 3 meses os operadores voltaram ao metodo antigo. Qual etapa foi provavelmente negligenciada?",
    alternativas: [
      "A analise de causa raiz do problema original",
      "O treinamento efetivo no novo padrao e o monitoramento continuo da adesao (SDCA apos o PDCA)",
      "A criacao do diagrama de Ishikawa",
      "A realizacao de brainstorming com a diretoria"
    ],
    resposta_correta: 1,
    explicacao: "Padronizar no papel nao basta. E preciso treinar todos no novo metodo, verificar se estao seguindo (Check do SDCA) e agir sobre desvios. Sem esse acompanhamento, o habito antigo prevalece."
  }
];
