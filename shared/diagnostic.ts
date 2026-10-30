export type AnswerValue = number | null;

export type DiagnosticQuestion = {
  id: string;
  text: string;
};

export type DiagnosticDimension = {
  id: string;
  title: string;
  eyebrow: string;
  description: string;
  questions: DiagnosticQuestion[];
};

export const DIAGNOSTIC_SCALE = [
  { value: 0, label: "Inexistente", description: "Não existe prática ou informação disponível." },
  { value: 1, label: "Inicial", description: "Existe de modo informal ou irregular." },
  { value: 2, label: "Parcial", description: "Existe em algumas áreas ou situações." },
  { value: 3, label: "Estruturado", description: "Existe, é conhecido e costuma ser aplicado." },
  { value: 4, label: "Acompanhado", description: "É aplicado e revisado com base em evidências." },
  { value: null, label: "Não informado", description: "Ainda não há informação suficiente para pontuar." },
] as const;

export const DIAGNOSTIC_DIMENSIONS: DiagnosticDimension[] = [
  {
    id: "strategy",
    title: "Clareza estratégica",
    eyebrow: "01",
    description: "Objetivos, escolhas e prioridades que orientam decisões.",
    questions: [
      { id: "A1", text: "A empresa possui objetivos estratégicos definidos para os próximos 12 meses?" },
      { id: "A2", text: "As lideranças e pessoas responsáveis conhecem esses objetivos?" },
      { id: "A3", text: "Existe uma ordem clara de prioridade entre os objetivos?" },
      { id: "A4", text: "As decisões relevantes são avaliadas em relação aos objetivos definidos?" },
    ],
  },
  {
    id: "positioning",
    title: "Posicionamento e valor",
    eyebrow: "02",
    description: "Clareza sobre o problema resolvido e o valor percebido.",
    questions: [
      { id: "B1", text: "A empresa consegue explicar com clareza qual problema resolve?" },
      { id: "B2", text: "Está claro para quem a empresa cria mais valor?" },
      { id: "B3", text: "Existem razões objetivas para o cliente escolher a empresa?" },
      { id: "B4", text: "A comunicação da empresa é coerente com a proposta de valor?" },
    ],
  },
  {
    id: "market",
    title: "Clientes e mercado",
    eyebrow: "03",
    description: "Conhecimento de clientes, alternativas e mudanças do mercado.",
    questions: [
      { id: "C1", text: "A empresa possui uma definição compartilhada de seus principais públicos?" },
      { id: "C2", text: "Há conhecimento suficiente sobre necessidades e critérios de compra?" },
      { id: "C3", text: "A empresa acompanha mudanças relevantes no mercado e na concorrência?" },
      { id: "C4", text: "As decisões de oferta são baseadas em evidências de clientes?" },
    ],
  },
  {
    id: "marketing",
    title: "Marketing e comunicação",
    eyebrow: "04",
    description: "A conexão entre objetivos, canais, mensagens e resultados.",
    questions: [
      { id: "D1", text: "Existe um objetivo definido para as ações de marketing?" },
      { id: "D2", text: "Os canais são escolhidos de acordo com o público e o objetivo?" },
      { id: "D3", text: "A empresa acompanha quais ações geram atenção, oportunidade ou resultado?" },
      { id: "D4", text: "Há consistência entre mensagem, oferta, canais e experiência entregue?" },
    ],
  },
  {
    id: "sales",
    title: "Vendas e processo comercial",
    eyebrow: "05",
    description: "Previsibilidade e clareza no caminho entre oportunidade e decisão.",
    questions: [
      { id: "E1", text: "A empresa possui etapas comerciais conhecidas, do primeiro contato ao fechamento?" },
      { id: "E2", text: "Há critérios para qualificar oportunidades?" },
      { id: "E3", text: "A empresa acompanha conversão, ciclo de venda e motivos de perda?" },
      { id: "E4", text: "O processo comercial possui responsáveis e próximos passos definidos?" },
    ],
  },
  {
    id: "operations",
    title: "Processos e execução",
    eyebrow: "06",
    description: "Capacidade de transformar prioridades em iniciativas executáveis.",
    questions: [
      { id: "F1", text: "Os processos críticos estão descritos ou são conhecidos por mais de uma pessoa?" },
      { id: "F2", text: "A equipe possui capacidade e responsabilidades compatíveis com as prioridades?" },
      { id: "F3", text: "A empresa identifica retrabalho, gargalos e dependências relevantes?" },
      { id: "F4", text: "As iniciativas prioritárias têm responsáveis, prazo e recursos previstos?" },
    ],
  },
  {
    id: "metrics",
    title: "Indicadores e decisões",
    eyebrow: "07",
    description: "Dados que ajudam a acompanhar o planejado e decidir melhor.",
    questions: [
      { id: "G1", text: "A empresa acompanha indicadores ligados aos seus objetivos?" },
      { id: "G2", text: "Os dados são atualizados com frequência suficiente para apoiar decisões?" },
      { id: "G3", text: "Existe comparação entre o planejado e o realizado?" },
      { id: "G4", text: "Quando um resultado se desvia, a empresa registra decisão ou ação corretiva?" },
    ],
  },
  {
    id: "evolution",
    title: "Gestão e evolução",
    eyebrow: "08",
    description: "Ritmo de acompanhamento, aprendizagem e adaptação.",
    questions: [
      { id: "H1", text: "A empresa realiza reuniões de acompanhamento com pauta e decisões registradas?" },
      { id: "H2", text: "Os principais riscos e dependências das iniciativas são conhecidos?" },
      { id: "H3", text: "A empresa revisa prioridades quando surgem mudanças relevantes?" },
      { id: "H4", text: "Existe aprendizado documentado após projetos ou iniciativas importantes?" },
    ],
  },
];

export const DIAGNOSTIC_VERSION = "v0.1";

export const allQuestionIds = DIAGNOSTIC_DIMENSIONS.flatMap(dimension =>
  dimension.questions.map(question => question.id)
);

export function getQuestion(questionId: string) {
  for (const dimension of DIAGNOSTIC_DIMENSIONS) {
    const question = dimension.questions.find(item => item.id === questionId);
    if (question) return { question, dimension };
  }
  return undefined;
}
