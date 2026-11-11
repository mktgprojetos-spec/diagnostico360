import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, CircleAlert, Printer, Target } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

type Dimension = {
  id: string;
  title: string;
  description: string;
  score: number | null;
  label: string;
  answered: number;
  total: number;
};

type Priority = {
  dimensionId: string;
  title: string;
  score: number;
  reason: string;
  nextStep: string;
};

function getExecutiveSummary(score: number | null, confidence: string, priorities: Priority[]) {
  const lead = score === null
    ? "As respostas ainda não formam uma base suficiente para uma visão geral segura."
    : score < 50
      ? "A empresa está em um momento inicial de estruturação e precisa transformar intenção em escolhas mais claras."
      : score < 75
        ? "A empresa apresenta algumas bases importantes, mas ainda existem conexões frágeis entre direção, execução e acompanhamento."
        : "A empresa apresenta uma base consistente para avançar, com oportunidades de integração entre as áreas avaliadas.";
  const focus = priorities[0]?.title
    ? `O principal ponto de atenção aparece em ${priorities[0].title.toLowerCase()}.`
    : "O principal ponto de atenção ainda precisa ser definido com mais informação.";
  return `${lead} ${focus} Esta análise tem nível de segurança ${confidence.toLowerCase()} e deve orientar uma conversa de decisão, não substituir uma análise aprofundada da operação.`;
}

function getCentralPattern(dimensions: Dimension[], priorities: Priority[]) {
  const lowest = priorities[0]?.dimensionId;
  const hasStrategy = dimensions.find(item => item.id === "strategy")?.score ?? null;
  const hasExecution = dimensions.find(item => item.id === "operations")?.score ?? null;
  const hasMetrics = dimensions.find(item => item.id === "metrics")?.score ?? null;
  if (lowest === "strategy" || (hasStrategy !== null && hasStrategy < 50)) return "A empresa pode estar executando muitas iniciativas sem uma ordem clara de objetivos para orientar escolhas e renúncias.";
  if (lowest === "metrics" || (hasMetrics !== null && hasMetrics < 50)) return "A empresa pode estar tomando decisões com esforço e experiência, mas ainda sem um sistema simples de indicadores para acompanhar se está avançando.";
  if (lowest === "operations" || (hasExecution !== null && hasExecution < 50)) return "A empresa parece ter prioridades relevantes, mas encontra dificuldade para transformá-las em iniciativas com responsáveis, prazos e capacidade de execução.";
  return "O principal desafio parece estar em conectar as prioridades do negócio às decisões, aos processos e ao acompanhamento do dia a dia.";
}

function getPriorityMeta(priority: Priority, index: number) {
  const highImpact = priority.score < 50 || index < 2;
  return { impact: highImpact ? "Alto" : "Relevante", urgency: index < 2 ? "Alta" : "Média" };
}

function getThirtyDayMoves(priorities: Priority[]) {
  const first = priorities[0];
  const second = priorities[1];
  const third = priorities[2];
  return [
    {
      title: first ? `Dar foco a ${first.title.toLowerCase()}` : "Escolher a prioridade central",
      text: first ? first.nextStep : "Escolha uma prioridade que possa orientar as decisões dos próximos 30 dias.",
      result: "Uma decisão central para reduzir dispersão e orientar a liderança.",
    },
    {
      title: second ? `Conectar a prioridade a ${second.title.toLowerCase()}` : "Definir o que precisa sustentar a prioridade",
      text: second ? second.nextStep : "Identifique quais processos, clientes ou indicadores precisam sustentar a prioridade escolhida.",
      result: "Menos distância entre o que foi decidido e o que precisa acontecer.",
    },
    {
      title: third ? `Criar um sinal de acompanhamento em ${third.title.toLowerCase()}` : "Estabelecer um ritual de acompanhamento",
      text: third ? third.nextStep : "Defina um indicador ou ritual simples para acompanhar a evolução e registrar decisões.",
      result: "Mais clareza para perceber avanço, desvio e necessidade de correção.",
    },
  ];
}

export default function ReportPage({ params }: { params: { id: string } }) {
  const [, setLocation] = useLocation();
  const id = Number(params.id);
  const query = trpc.assessment.result.useQuery({ id }, { retry: false });
  if (query.isLoading) return <div className="flex min-h-screen items-center justify-center bg-[#faf8f5] text-sm text-[#776e68]">Preparando relatório…</div>;
  if (query.isError || !query.data) return <div className="flex min-h-screen items-center justify-center bg-[#faf8f5] p-6">Relatório indisponível.</div>;

  const { result, assessment } = query.data;
  const dimensions = result.dimensions as Dimension[];
  const priorities = result.priorities as Priority[];
  const summary = getExecutiveSummary(result.overallScore, result.confidenceLabel, priorities);
  const centralPattern = getCentralPattern(dimensions, priorities);
  const moves = getThirtyDayMoves(priorities);
  const contextMoments = assessment.contextMoments ? JSON.parse(assessment.contextMoments) as string[] : [];
  const whatsappUrl = "https://wa.me/5514996755751?text=Ol%C3%A1%2C%20Taynara!%20Quero%20agendar%20meu%20planejamento%20estrat%C3%A9gico%20a%20partir%20do%20meu%20Diagnóstico%20360.";

  return <div className="min-h-screen bg-[#eeeae5] text-[#2a2622]">
    <div className="print:hidden mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-2 px-5 py-5">
      <div className="flex flex-wrap gap-2">
        <a href={`mailto:taynaracampos@hotmail.com?subject=${encodeURIComponent("Solicitação de correção | Diagnóstico Estratégico 360º")}&body=${encodeURIComponent(`Olá, Taynara.\n\nGostaria de solicitar uma correção na avaliação #${id}.\n\nMotivo:\n`)}`} className="rounded-full border border-[#a65e3f] px-4 py-2 text-sm font-semibold text-[#a65e3f]">Solicitar correção</a>
        <Button variant="outline" onClick={() => setLocation(`/resultado/${id}`)} className="rounded-full"><ArrowLeft className="mr-2 h-4 w-4" /> Resultado</Button>
        <a href={whatsappUrl} target="_blank" rel="noreferrer" className="rounded-full border border-[#a65e3f] px-4 py-2 text-sm font-semibold text-[#a65e3f]">Agendar planejamento</a>
        <Button onClick={() => window.print()} className="rounded-full bg-[#a65e3f] text-white hover:bg-[#86472f]"><Printer className="mr-2 h-4 w-4" /> Imprimir / salvar PDF</Button>
      </div>
    </div>

    <article className="mx-auto max-w-4xl bg-white px-8 py-12 shadow-sm sm:px-14 sm:py-16 print:max-w-none print:shadow-none">
      <header className="border-b-2 border-[#a65e3f] pb-10">
        <div className="flex items-start justify-between gap-6">
          <div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#a65e3f]">Diagnóstico Estratégico 360º</p><h1 className="mt-5 max-w-2xl font-serif text-5xl tracking-[-0.04em]">Relatório de diagnóstico</h1><p className="mt-4 text-[#776e68]">Avaliação #{String(assessment.id).padStart(4, "0")} · versão {assessment.version}</p></div>
          <div className="text-right text-sm text-[#776e68]"><p>Data</p><p className="font-semibold text-[#2a2622]">{new Date().toLocaleDateString("pt-BR")}</p></div>
        </div>
      </header>

      <section className="border-b border-[#2a2622]/10 py-10">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#a65e3f]">Resumo executivo</p>
        <h2 className="mt-3 font-serif text-3xl">O que esta análise indica</h2>
        <p className="mt-4 text-lg leading-8 text-[#514943]">{summary}</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <Metric label="Visão geral" value={`${result.overallScore ?? "Não definida"}${result.overallScore !== null ? "/100" : ""}`} />
          <Metric label="Confiança" value={result.confidenceLabel} />
          <Metric label="Completude" value={`${result.completionPercent}%`} />
        </div>
      </section>

      <section className="border-b border-[#2a2622]/10 py-10">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#a65e3f]">Contexto informado</p>
        <h2 className="mt-3 font-serif text-3xl">O cenário desta avaliação</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-3"><div className="rounded-2xl bg-[#f1e8e1] p-5"><p className="text-xs font-semibold uppercase tracking-wide text-[#a65e3f]">Momento atual</p><div className="mt-3 space-y-2 text-sm leading-6 text-[#625851]">{contextMoments.length > 0 ? contextMoments.map(moment => <p key={moment}>• {moment}</p>) : <p>Não informado nesta versão.</p>}</div></div><div className="rounded-2xl border border-[#2a2622]/10 p-5 sm:col-span-2"><p className="text-xs font-semibold uppercase tracking-wide text-[#a65e3f]">Desafio declarado</p><p className="mt-3 text-sm leading-6 text-[#625851]">{assessment.contextChallenge || "Não informado nesta versão."}</p><p className="mt-5 text-xs font-semibold uppercase tracking-wide text-[#a65e3f]">O que a empresa espera compreender</p><p className="mt-3 text-sm leading-6 text-[#625851]">{assessment.contextExpectation || "Não informado nesta versão."}</p></div></div>
        <p className="mt-4 text-xs leading-5 text-[#776e68]">O contexto amplia a interpretação da análise, sem alterar automaticamente as pontuações calculadas pelas respostas objetivas.</p>
      </section>

      <section className="border-b border-[#2a2622]/10 py-10">
        <div className="rounded-[1.5rem] bg-[#2a2622] p-7 text-[#faf8f5]">
          <div className="flex items-start gap-4"><Target className="mt-1 h-6 w-6 shrink-0 text-[#eadfd6]" /><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#eadfd6]">Padrão central identificado</p><h2 className="mt-3 font-serif text-3xl">O que merece atenção primeiro</h2><p className="mt-4 max-w-2xl leading-7 text-[#dfd5ce]">{centralPattern}</p></div></div>
        </div>
      </section>

      <section className="border-b border-[#2a2622]/10 py-10">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#a65e3f]">Resultado por dimensão</p>
        <div className="mt-6 grid gap-x-10 gap-y-6 sm:grid-cols-2">{dimensions.map(dimension => <div key={dimension.id}><div className="flex justify-between gap-3 text-sm"><span className="font-semibold">{dimension.title}</span><span className="font-mono text-[#a65e3f]">{dimension.score ?? "Não informado"}</span></div><div className="mt-2 h-2 rounded-full bg-[#e8e3de]"><div className="h-2 rounded-full bg-[#a65e3f]" style={{ width: `${dimension.score ?? 0}%` }} /></div><p className="mt-1 text-xs text-[#776e68]">{dimension.label} · {dimension.answered}/{dimension.total} respostas</p></div>)}</div>
      </section>

      <section className="border-b border-[#2a2622]/10 py-10">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#a65e3f]">Matriz de prioridades</p>
        <h2 className="mt-3 font-serif text-3xl">Onde concentrar atenção</h2>
        <p className="mt-3 leading-7 text-[#776e68]">As prioridades abaixo são hipóteses de trabalho baseadas nas respostas. Impacto e urgência ajudam a organizar a conversa, mas não substituem a validação com a liderança.</p>
        <div className="mt-6 overflow-hidden rounded-2xl border border-[#2a2622]/10"><div className="grid grid-cols-[1.4fr_.55fr_.55fr] gap-3 bg-[#f1e8e1] px-4 py-3 text-xs font-bold uppercase tracking-wide text-[#6b625c]"><span>Prioridade</span><span>Impacto</span><span>Urgência</span></div>{priorities.map((priority, index) => { const meta = getPriorityMeta(priority, index); return <div key={priority.dimensionId} className="grid grid-cols-[1.4fr_.55fr_.55fr] gap-3 border-t border-[#2a2622]/10 px-4 py-4 text-sm"><span className="font-semibold">{priority.title}</span><span className="text-[#a65e3f]">{meta.impact}</span><span className="text-[#a65e3f]">{meta.urgency}</span></div>; })}</div>
        <div className="mt-7 space-y-6">{priorities.map((priority, index) => <div key={priority.dimensionId} className="flex gap-4"><span className="font-mono text-sm text-[#a65e3f]">0{index + 1}</span><div><h3 className="font-serif text-2xl">{priority.title}</h3><p className="mt-2 leading-7 text-[#776e68]">{priority.reason}</p><p className="mt-2 text-sm font-semibold text-[#a65e3f]">Próxima ação: {priority.nextStep}</p></div></div>)}</div>
      </section>

      <section className="border-b border-[#2a2622]/10 py-10">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#a65e3f]">Três movimentos recomendados</p>
        <h2 className="mt-3 font-serif text-3xl">O que fazer nos próximos 30 dias</h2>
        <div className="mt-6 space-y-4">{moves.map((move, index) => <div key={move.title} className="rounded-2xl border border-[#2a2622]/10 p-5"><div className="flex gap-4"><span className="font-mono text-sm text-[#a65e3f]">0{index + 1}</span><div><h3 className="font-semibold">{move.title}</h3><p className="mt-2 leading-6 text-[#776e68]">{move.text}</p><p className="mt-3 text-sm font-semibold text-[#a65e3f]">Resultado esperado: {move.result}</p></div></div></div>)}</div>
      </section>

      <section className="border-b border-[#2a2622]/10 py-10">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#a65e3f]">Perguntas estratégicas</p>
        <h2 className="mt-3 font-serif text-3xl">O que a liderança precisa discutir</h2>
        <p className="mt-3 leading-7 text-[#776e68]">Estas perguntas ajudam a transformar a análise em uma conversa de decisão. Elas serão aprofundadas no Planejamento Estratégico Guiado.</p>
        <div className="mt-6 space-y-3">{[
          "Qual decisão, se tomada agora, reduziria mais dispersão de energia na empresa?",
          "Quais objetivos precisam ser protegidos nos próximos 12 meses, mesmo diante de novas oportunidades?",
          "O que precisa deixar de ser feito para que a prioridade escolhida realmente avance?",
          "Como a liderança saberá, em 30 ou 90 dias, que está caminhando na direção certa?",
        ].map(question => <div key={question} className="flex gap-3 rounded-xl bg-[#faf8f5] p-4 text-sm leading-6"><span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-[#a65e3f]" />{question}</div>)}</div>
      </section>

      <section className="border-b border-[#2a2622]/10 py-10">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#a65e3f]">Próxima etapa</p>
        <h2 className="mt-3 font-serif text-3xl">Da análise para um plano de decisão</h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-2"><div className="rounded-2xl bg-[#f1e8e1] p-6"><p className="font-semibold text-[#a65e3f]">Este diagnóstico entrega</p><ul className="mt-4 space-y-3 text-sm leading-6 text-[#625851]"><li>✓ Visão ampla do momento atual</li><li>✓ Lacunas e pontos fortes</li><li>✓ Prioridades sugeridas</li><li>✓ Movimentos iniciais e perguntas de decisão</li></ul></div><div className="rounded-2xl border border-[#a65e3f]/30 p-6"><p className="font-semibold text-[#a65e3f]">O planejamento estratégico constrói</p><ul className="mt-4 space-y-3 text-sm leading-6 text-[#625851]"><li>✓ Objetivos e escolhas estratégicas</li><li>✓ Iniciativas, responsáveis e prazos</li><li>✓ Indicadores e rotina de acompanhamento</li><li>✓ Plano de execução personalizado</li></ul></div></div><a href={whatsappUrl} target="_blank" rel="noreferrer" className="mt-7 inline-flex items-center rounded-full bg-[#a65e3f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#86472f]">Agendar Planejamento Estratégico Guiado <ArrowRight className="ml-2 h-4 w-4" /></a></section>

      <section className="border-b border-[#2a2622]/10 py-10"><div className="flex gap-3"><CircleAlert className="mt-1 h-5 w-5 shrink-0 text-[#a65e3f]" /><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#a65e3f]">Lacunas e confiança</p><p className="mt-3 leading-7 text-[#776e68]">A confiança considera a quantidade e a consistência das respostas disponíveis. Informações não respondidas permanecem como lacunas e devem ser consideradas antes de decisões relevantes.</p>{result.gaps.length > 0 && <ul className="mt-4 space-y-2 text-sm text-[#776e68]">{result.gaps.map(gap => <li key={gap}>• {gap}</li>)}</ul>}</div></div></section>

      <section className="py-10"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#a65e3f]">Metodologia e critérios da análise</p><p className="mt-4 leading-7 text-[#776e68]">As notas foram calculadas por média das respostas pontuadas em cada dimensão. A pontuação geral utiliza as dimensões com informação suficiente. A classificação é própria deste instrumento, não é benchmark de mercado e não representa auditoria, certificação, parecer profissional ou garantia de desempenho. O relatório tem como objetivo guiar ações e organizar prioridades. Para um parecer profissional e personalizado, é necessário seguir com o Planejamento Estratégico.</p></section>
      <footer className="border-t border-[#2a2622]/10 pt-6 text-xs text-[#776e68]">Diagnóstico Estratégico 360º · Diagnóstico estratégico guiado para clareza, prioridade e ação.</footer>
    </article>
  </div>;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl bg-[#f1e8e1] p-4"><p className="text-xs font-semibold uppercase tracking-wide text-[#776e68]">{label}</p><p className="mt-2 font-serif text-2xl text-[#a65e3f]">{value}</p></div>;
}
