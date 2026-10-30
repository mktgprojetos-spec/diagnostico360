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
      reason: dimension.score !== null && dimension.score < 50
        ? `A dimensão aparece em uma faixa inicial dentro deste instrumento (${dimension.label.toLowerCase()}).`
        : `A dimensão tem espaço para ganhar consistência e conexão com as demais áreas (${dimension.label.toLowerCase()}).`,
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
