import { DIAGNOSTIC_DIMENSIONS, type AnswerValue } from "@shared/diagnostic";

export type DiagnosticResult = {
  overallScore: number | null;
  confidence: "high" | "moderate" | "low";
  confidenceLabel: string;
  completionPercent: number;
  dimensions: Array<{
    id: string;
    title: string;
    description: string;
    score: number | null;
    label: string;
    answered: number;
    total: number;
  }>;
  priorities: Array<{
    dimensionId: string;
    title: string;
    score: number;
    reason: string;
    nextStep: string;
    questionIds: string[];
  }>;
  strengths: Array<{ title: string; score: number }>;
  gaps: string[];
};

function labelForScore(score: number | null) {
  if (score === null) return "Sem dados suficientes";
  if (score < 25) return "Não estruturado";
  if (score < 50) return "Inicial";
  if (score < 75) return "Parcialmente estruturado";
  if (score < 88) return "Estruturado";
  return "Acompanhado e revisado";
}

function nextStepFor(dimensionId: string) {
  const steps: Record<string, string> = {
    strategy: "Escolha até três objetivos para os próximos 12 meses e registre a prioridade de cada um.",
    positioning: "Escreva em uma frase o problema que a empresa resolve, para quem e por que é escolhida.",
    market: "Converse com clientes atuais e registre necessidades, objeções e critérios de decisão.",
    marketing: "Relacione cada canal a um objetivo e defina qual sinal indicará avanço.",
    sales: "Desenhe as etapas comerciais e defina o próximo passo esperado em cada oportunidade.",
    operations: "Escolha um gargalo crítico e descreva responsável, prazo, recurso e dependências.",
    metrics: "Selecione poucos indicadores ligados aos objetivos e defina frequência de acompanhamento.",
    evolution: "Crie um ritual de acompanhamento com pauta, decisões e registro de aprendizados.",
  };
  return steps[dimensionId] ?? "Escolha uma iniciativa prioritária e defina o próximo passo.";
}

function reasonFor(dimensionId: string, score: number, label: string) {
  const band = score < 50 ? "initial" : score < 75 ? "developing" : "structured";
  const reasons: Record<string, Record<string, string>> = {
    strategy: {
      initial: "Os objetivos ainda não parecem funcionar como critério comum para escolher prioridades, direcionar recursos e dizer não ao que dispersa a empresa.",
      developing: "Existe uma direção em construção, mas a ordem dos objetivos e sua conexão com as decisões do dia a dia ainda podem ganhar mais clareza.",
      structured: "A empresa demonstra uma direção relativamente clara. O próximo ganho está em manter as escolhas vivas nas decisões e revisá-las quando o contexto mudar.",
    },
    positioning: {
      initial: "A proposta de valor ainda pode estar ampla demais, dificultando explicar o problema resolvido, o público prioritário e o motivo de escolha.",
      developing: "A empresa já apresenta elementos de diferenciação, mas precisa conectá-los melhor à mensagem, ao público e à experiência que entrega.",
      structured: "O posicionamento aparece bem encaminhado. O cuidado agora é garantir que a promessa percebida pelo cliente continue coerente com a entrega real.",
    },
    market: {
      initial: "As decisões sobre clientes e oportunidades parecem depender mais de percepção interna do que de uma leitura organizada das necessidades e critérios de compra.",
      developing: "Há conhecimento relevante sobre o mercado, mas ainda falta transformar aprendizados de clientes em escolhas consistentes de oferta e foco.",
      structured: "A empresa demonstra boa proximidade com clientes e mercado. O próximo passo é usar essa leitura para antecipar mudanças e proteger oportunidades relevantes.",
    },
    marketing: {
      initial: "As ações de comunicação podem estar acontecendo sem uma ligação suficientemente clara entre público, mensagem, canal e resultado esperado.",
      developing: "O marketing possui iniciativas em andamento, mas pode ganhar eficiência ao relacionar cada canal a um objetivo e a um sinal concreto de avanço.",
      structured: "A comunicação apresenta uma base consistente. O foco deve ser melhorar a atribuição de resultados e manter coerência entre promessa, oferta e experiência.",
    },
    sales: {
      initial: "O processo comercial ainda parece depender de esforço individual, sem etapas, critérios e próximos passos suficientemente visíveis para gerar previsibilidade.",
      developing: "Existe um processo comercial parcialmente definido, mas pontos como qualificação, conversão e motivos de perda ainda podem orientar melhor as decisões.",
      structured: "O processo comercial está relativamente organizado. A oportunidade está em transformar os dados de conversão e perda em ajustes contínuos de abordagem e oferta.",
    },
    operations: {
      initial: "A execução pode estar concentrada em poucas pessoas e sujeita a retrabalho, gargalos ou dependências que dificultam transformar prioridades em entrega.",
      developing: "A operação sustenta parte das prioridades, mas responsabilidades, capacidade e gargalos ainda precisam ser conectados para evitar perda de ritmo.",
      structured: "A capacidade de execução aparece como uma base favorável. O próximo avanço é proteger os processos críticos e alinhar recursos às prioridades escolhidas.",
    },
    metrics: {
      initial: "Faltam sinais simples e recorrentes para saber se as decisões estão produzindo avanço, o que pode fazer a liderança reagir tarde aos desvios.",
      developing: "A empresa acompanha alguns números, mas ainda pode aproximar indicadores dos objetivos e transformar desvios em decisões registradas.",
      structured: "Os indicadores já apoiam parte das decisões. O ganho adicional está em reduzir o excesso de informação e concentrar o acompanhamento no que muda escolhas.",
    },
    evolution: {
      initial: "O acompanhamento da estratégia parece ocorrer de forma irregular, dificultando registrar decisões, aprender com iniciativas e reagir a mudanças relevantes.",
      developing: "Existem práticas de acompanhamento, mas elas ainda podem ganhar ritmo, pauta e registro para transformar reuniões em decisões e aprendizados.",
      structured: "A empresa demonstra capacidade de acompanhar e adaptar sua direção. O cuidado é preservar o registro dos aprendizados e das decisões que sustentam a evolução.",
    },
  };
  return reasons[dimensionId]?.[band] ?? `As respostas colocam esta dimensão na faixa ${label.toLowerCase()} e indicam um ponto de atenção para a próxima decisão.`;
}

export function calculateDiagnostic(answerMap: Record<string, AnswerValue>): DiagnosticResult {
  const dimensions = DIAGNOSTIC_DIMENSIONS.map(dimension => {
    const values = dimension.questions
      .map(question => answerMap[question.id])
      .filter((value): value is number => typeof value === "number" && value >= 0 && value <= 4);
    const score = values.length ? Math.round((values.reduce((sum, value) => sum + value, 0) / values.length) * 25) : null;
    return {
      id: dimension.id,
      title: dimension.title,
      description: dimension.description,
      score,
      label: labelForScore(score),
      answered: values.length,
      total: dimension.questions.length,
    };
  });

  const totalQuestions = DIAGNOSTIC_DIMENSIONS.reduce((sum, dimension) => sum + dimension.questions.length, 0);
  const answeredQuestions = dimensions.reduce((sum, dimension) => sum + dimension.answered, 0);
  const completionPercent = Math.round((answeredQuestions / totalQuestions) * 100);
  const eligible = dimensions.filter(dimension => dimension.answered >= 3 && dimension.score !== null);
  const overallScore = eligible.length >= 6
    ? Math.round(eligible.reduce((sum, dimension) => sum + (dimension.score ?? 0), 0) / eligible.length)
    : null;

  const confidence: DiagnosticResult["confidence"] =
    completionPercent >= 90 && eligible.length === dimensions.length ? "high" :
    completionPercent >= 70 && eligible.length >= 6 ? "moderate" : "low";
  const confidenceLabel = confidence === "high" ? "Alta" : confidence === "moderate" ? "Moderada" : "Baixa";

  const ranked = [...dimensions]
    .filter(dimension => dimension.score !== null)
    .sort((a, b) => (a.score ?? 100) - (b.score ?? 100));

  const priorities = ranked.slice(0, 5).map(dimension => {
    const source = DIAGNOSTIC_DIMENSIONS.find(item => item.id === dimension.id)!;
    return {
      dimensionId: dimension.id,
      title: dimension.title,
      score: dimension.score ?? 0,
        reason: reasonFor(dimension.id, dimension.score ?? 0, dimension.label),
      nextStep: nextStepFor(dimension.id),
      questionIds: source.questions.map(question => question.id),
    };
  });

  const strengths = [...dimensions]
    .filter(dimension => dimension.score !== null)
    .sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
    .slice(0, 3)
    .map(dimension => ({ title: dimension.title, score: dimension.score ?? 0 }));

  const gaps = dimensions
    .filter(dimension => dimension.answered < dimension.total)
    .map(dimension => `${dimension.title}: ${dimension.total - dimension.answered} resposta(s) não informada(s).`);

  return { overallScore, confidence, confidenceLabel, completionPercent, dimensions, priorities, strengths, gaps };
}
