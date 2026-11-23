import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, BarChart3, Check, Compass, LogIn, Menu, ShieldCheck, Sparkles, Target, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { PRODUCT_OFFER } from "@shared/product";

const dimensions = ["Clareza estratégica", "Posicionamento e valor", "Clientes e mercado", "Marketing e comunicação", "Vendas", "Processos e execução", "Indicadores", "Gestão e evolução"];
const deliveryDetails = [
  "Separe direção de distração e defina quais escolhas devem orientar o próximo passo.",
  "Defina o que diferencia sua empresa e para quem sua proposta de valor faz sentido.",
  "Organize a visão sobre clientes, mercado e oportunidades para decidir com mais segurança.",
  "Identifique o que dificulta sua empresa ser lembrada, compreendida e escolhida.",
  "Encontre onde o processo comercial perde clareza, ritmo e conversão.",
  "Reconheça os gargalos que consomem energia e dificultam executar o que foi decidido.",
  "Defina quais indicadores precisam apoiar decisões mais rápidas e consistentes.",
  "Organize riscos, aprendizados e prioridades para evoluir com mais consciência.",
];

export default function Home() {
  const [, setLocation] = useLocation();
  const { user, loading } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const start = () => {
    if (user) setLocation("/app");
    else startLogin();
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#2a2622] selection:bg-[#eadfd6]">
      <header className="sticky top-0 z-30 border-b border-[#2a2622]/10 bg-[#faf8f5]/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-10">
          <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="flex items-center gap-3 text-left">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#a65e3f] text-sm font-bold text-[#faf8f5]">D3</span>
            <span><span className="block font-serif text-lg leading-none">Diagnóstico</span><span className="block text-[10px] font-semibold uppercase tracking-[0.24em] text-[#a65e3f]">360</span></span>
          </button>
          <nav className="hidden items-center gap-8 text-sm font-medium text-[#6b625c] md:flex">
            <a href="#como-funciona" className="transition hover:text-[#a65e3f]">Como funciona</a>
            <a href="#entrega" className="transition hover:text-[#a65e3f]">O que você recebe</a>
            <a href="#exemplo" className="transition hover:text-[#a65e3f]">Exemplo do relatório</a>
            <a href="#faq" className="transition hover:text-[#a65e3f]">Dúvidas</a>
          </nav>
          <div className="hidden items-center gap-3 md:flex">
            {user ? <Button variant="outline" onClick={() => setLocation("/app")} className="rounded-full border-[#a65e3f]/30">Minha área</Button> : <button onClick={() => startLogin()} className="text-sm font-semibold text-[#a65e3f]">Entrar</button>}
            <Button onClick={start} disabled={loading} className="rounded-full bg-[#a65e3f] px-5 text-[#faf8f5] hover:bg-[#86472f]">Ver como está minha empresa <ArrowRight className="ml-2 h-4 w-4" /></Button>
          </div>
          <button onClick={() => setMenuOpen(value => !value)} className="rounded-xl p-2 md:hidden" aria-label="Abrir menu">{menuOpen ? <X /> : <Menu />}</button>
        </div>
        {menuOpen && <div className="border-t border-[#2a2622]/10 px-5 py-4 md:hidden"><div className="flex flex-col gap-4 text-sm"><a href="#como-funciona" onClick={() => setMenuOpen(false)}>Como funciona</a><a href="#entrega" onClick={() => setMenuOpen(false)}>O que você recebe</a><a href="#exemplo" onClick={() => setMenuOpen(false)}>Exemplo do relatório</a><button className="text-left font-semibold text-[#a65e3f]" onClick={start}>Ver como está minha empresa</button></div></div>}
      </header>

      <main>
        <section className="relative overflow-hidden px-5 pb-24 pt-16 lg:px-10 lg:pb-32 lg:pt-24">
          <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[#eadfd6]/50 blur-3xl" />
          <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.05fr_.95fr]">
            <div className="relative">
              <Badge variant="outline" className="mb-7 rounded-full border-[#a65e3f]/25 bg-white/40 px-4 py-1.5 font-semibold uppercase tracking-[0.16em] text-[#a65e3f]">Diagnóstico Estratégico 360º</Badge>
              <h1 className="max-w-3xl font-serif text-5xl leading-[.98] tracking-[-0.04em] text-[#2a2622] sm:text-6xl lg:text-7xl">Entenda o que está travando sua empresa <span className="text-[#a65e3f]">e escolha onde agir primeiro.</span></h1>
              <p className="mt-7 max-w-xl text-lg leading-8 text-[#6b625c]">Em 24 perguntas, o Diagnóstico Estratégico 360º mostra o que está funcionando na sua empresa, onde estão as lacunas e qual decisão merece atenção antes do próximo investimento de tempo, dinheiro ou energia.</p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row"><Button onClick={start} size="lg" className="h-13 rounded-full bg-[#a65e3f] px-7 text-base text-white hover:bg-[#86472f]">Quero entender minha empresa <ArrowRight className="ml-2 h-4 w-4" /></Button><a href="#como-funciona" className="inline-flex h-13 items-center justify-center rounded-full border border-[#2a2622]/15 px-7 text-sm font-semibold text-[#2a2622] transition hover:bg-white">Entender como funciona</a></div>
              <p className="mt-5 flex items-center gap-2 text-sm text-[#776e68]"><ShieldCheck className="h-4 w-4 text-[#a65e3f]" /> Relatório com revisão de qualidade, liberado em até 24h.</p>
            </div>
            <div className="relative lg:pl-8">
              <div className="absolute -left-4 top-10 hidden h-28 w-28 rounded-full border border-[#a65e3f]/20 lg:block" /><div className="absolute -bottom-7 -right-6 hidden h-40 w-40 rounded-full border border-[#a65e3f]/20 lg:block" />
              <div className="relative rounded-[2rem] border border-[#2a2622]/10 bg-white p-5 shadow-[0_30px_80px_rgba(13,79,86,.12)] sm:p-7">
                <div className="flex items-start justify-between border-b border-[#2a2622]/10 pb-5"><div><p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#a65e3f]">Visão geral</p><h2 className="mt-2 font-serif text-2xl">Sua empresa em perspectiva</h2></div><span className="rounded-full bg-[#f1e8e1] px-3 py-1 text-xs font-semibold text-[#a65e3f]">Exemplo visual</span></div>
                <div className="grid grid-cols-[auto_1fr] items-center gap-7 py-7"><div className="relative flex h-32 w-32 items-center justify-center rounded-full" style={{ background: "conic-gradient(#a65e3f 0 68%, #e8e3de 68% 100%)" }}><div className="flex h-24 w-24 flex-col items-center justify-center rounded-full bg-white"><span className="font-serif text-3xl">68</span><span className="text-[10px] uppercase tracking-wider text-[#776e68]">de 100</span></div></div><div><p className="text-sm font-semibold text-[#2a2622]">Parcialmente estruturado</p><p className="mt-2 text-sm leading-6 text-[#776e68]">Uma visão panorâmica para entender onde sua empresa está mais estruturada e onde uma decisão bem direcionada pode destravar o próximo passo.</p><div className="mt-4 flex items-center gap-2 text-xs text-[#a65e3f]"><span className="h-2 w-2 rounded-full bg-[#b98263]" /> Confiança moderada</div></div></div>
                <div className="space-y-3">{[["Clareza estratégica",82],["Clientes e mercado",71],["Processos e execução",55]].map(([label, score]) => <div key={label as string}><div className="mb-1 flex justify-between text-xs"><span className="font-medium text-[#6b625c]">{label}</span><span className="font-semibold text-[#a65e3f]">{score}</span></div><div className="h-2 rounded-full bg-[#e8e3de]"><div className="h-2 rounded-full bg-[#a65e3f]" style={{ width: `${score}%` }} /></div></div>)}</div>
              </div>
            </div>
          </div>
        </section>

                <section id="como-funciona" className="px-5 py-24 lg:px-10"><div className="mx-auto max-w-7xl"><div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#a65e3f]">Como funciona</p><h2 className="mt-4 font-serif text-4xl tracking-[-0.03em] sm:text-5xl">Decida com mais critério e direção.</h2><p className="mt-5 text-lg leading-8 text-[#776e68]">Para sócios e gestores de empresas de qualquer setor e porte que precisam escolher onde concentrar recursos.</p></div><div className="mt-14 grid gap-5 md:grid-cols-3"><Step number="01" icon={<Compass />} title="Informe" text="Responda perguntas objetivas sobre o momento real da sua empresa. Você pode salvar e continuar depois." /><Step number="02" icon={<BarChart3 />} title="Entenda" text="Veja uma análise por dimensão, com pontos fortes, lacunas e nível de segurança das informações." /><Step number="03" icon={<Target />} title="Priorize" text="Receba prioridades justificadas pelas suas respostas e um próximo passo possível para avançar." /></div></div></section>

        <section id="entrega" className="bg-[#f1e8e1] px-5 py-24 lg:px-10"><div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[.8fr_1.2fr] lg:items-start"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#a65e3f]">O que você recebe</p><h2 className="mt-4 font-serif text-4xl tracking-[-0.03em] sm:text-5xl">As oito dimensões analisadas</h2><p className="mt-5 text-lg leading-8 text-[#6b625c]">Cada dimensão recebe uma nota de 0 a 100 e uma leitura do que já está estruturado e do que precisa de atenção.</p><Button onClick={start} className="mt-8 rounded-full bg-[#a65e3f] text-white hover:bg-[#86472f]">Receber minha análise <ArrowRight className="ml-2 h-4 w-4" /></Button></div><div className="grid gap-x-10 gap-y-7 sm:grid-cols-2">{dimensions.map((item, index) => <div key={item} className="flex gap-3 border-b border-[#a65e3f]/15 pb-5"><span className="font-mono text-xs text-[#a65e3f]">0{index + 1}</span><div><h3 className="font-semibold">{item}</h3><p className="mt-1 text-sm leading-6 text-[#776e68]">{deliveryDetails[index]}</p></div></div>)}</div></div></section>

        <section id="exemplo" className="px-5 pt-24 pb-4 lg:px-10"><div className="mx-auto max-w-7xl">
          <div className="max-w-3xl"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#a65e3f]">Por dentro do relatório</p><h2 className="mt-4 font-serif text-4xl tracking-[-0.03em] sm:text-5xl">Veja como o relatório orienta suas próximas decisões</h2><p className="mt-5 text-lg leading-8 text-[#6b625c]">Antes de investir em tráfego, contratar ou mudar a comunicação, vale saber onde está o gargalo da empresa. O relatório mostra isso em três partes.</p></div>
          <ReportExample />
        </div></section>


        <section className="px-5 py-20 lg:px-10"><div className="mx-auto grid max-w-7xl gap-8 rounded-[2rem] border border-[#a65e3f]/15 bg-white p-7 shadow-[0_18px_50px_rgba(13,79,86,.08)] sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#a65e3f]">Investimento</p><h2 className="mt-3 font-serif text-3xl sm:text-4xl">Clareza antes do próximo investimento.</h2><p className="mt-3 max-w-2xl leading-7 text-[#776e68]">Relatório completo, com revisão de qualidade e liberado em até 24h após o pagamento.</p><ul className="mt-5 grid gap-2 text-sm text-[#514943] sm:grid-cols-2">{["Pontuação e leitura das 8 dimensões", "Matriz de prioridades com próxima ação", "Três movimentos para os próximos 30 dias", "Perguntas estratégicas para a liderança", "Revisão de qualidade antes da liberação", "Relatório para salvar em PDF"].map(item => <li key={item} className="flex items-center gap-2"><Check className="h-4 w-4 shrink-0 text-[#a65e3f]" />{item}</li>)}</ul></div><div className="lg:text-right"><p className="font-serif text-5xl text-[#a65e3f]">{PRODUCT_OFFER.priceLabel}</p><p className="mt-1 text-sm text-[#776e68]">à vista no cartão de crédito ou Pix</p><Button onClick={start} className="mt-5 rounded-full bg-[#a65e3f] text-white hover:bg-[#86472f]">Quero receber meu Diagnóstico <ArrowRight className="ml-2 h-4 w-4" /></Button></div></div></section>

        <section id="faq" className="px-5 py-24 lg:px-10"><div className="mx-auto max-w-4xl"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#a65e3f]">Dúvidas frequentes</p><h2 className="mt-4 font-serif text-4xl">Veja se este diagnóstico faz sentido para você</h2><div className="mt-10 divide-y divide-[#2a2622]/10">{[["O que eu recebo ao final?","Você recebe uma análise visual por dimensão, pontos fortes, lacunas, prioridades e próximos passos. O resultado também indica quando avançar para um Planejamento Estratégico Inteligente."],["Por que o relatório leva até 24h para ser liberado?","Porque cada relatório passa por uma revisão de qualidade antes da liberação. Conferimos se as respostas, o contexto informado e as prioridades sugeridas estão coerentes entre si. Essa revisão não substitui um parecer personalizado, que faz parte do Planejamento Estratégico Inteligente."],["Vale investir em um diagnóstico antes de agir?","Se a empresa está em dúvida sobre onde investir tempo e dinheiro, agir sem clareza costuma sair mais caro: campanhas, contratações ou mudanças que não atacam o verdadeiro gargalo. O diagnóstico existe para que o próximo investimento seja feito no lugar certo."],["A pontuação é um benchmark de mercado?","Não. A pontuação é uma análise interna do instrumento, calculada a partir de critérios explícitos, e o relatório mostra esses critérios e as lacunas de informação. Para um benchmark de mercado, é necessário seguir com o Planejamento Estratégico Inteligente."],["Preciso ter todas as informações da empresa?","Não. Você pode marcar “Não informado” quando não tiver segurança. A análise evidencia as lacunas e sinaliza o nível de segurança das informações disponíveis, sem transformar a falta de informação em uma pontuação artificial."],["Para quem este diagnóstico é indicado?","Para sócios, responsáveis e gestores de empresas de diferentes setores e portes que precisam organizar prioridades, alinhar decisões e transformar intenção em execução com critérios mais claros."],["O Diagnóstico Estratégico 360º serve apenas para empresas que estão com problemas?","Não. Ele também é útil para empresas que estão crescendo, reorganizando sua operação ou buscando confirmar se as decisões atuais estão coerentes com o momento do negócio."],["O diagnóstico garante resultados?","Não. Nenhuma etapa, nem o diagnóstico nem o Planejamento Estratégico Inteligente, garante resultado. A eficácia da análise depende da execução e da gestão das ações pela empresa."],["O diagnóstico substitui o planejamento estratégico?","Não. O Diagnóstico Estratégico 360º organiza o cenário e aponta prioridades. O Planejamento Estratégico Inteligente aprofunda essa análise e transforma as prioridades em objetivos, iniciativas, responsáveis, prazos e indicadores personalizados."]].map(([q,a]) => <details key={q} className="group py-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold"><span>{q}</span><span className="text-2xl font-light text-[#a65e3f] transition group-open:rotate-45">+</span></summary><p className="max-w-3xl pt-4 leading-7 text-[#776e68]">{a}</p></details>)}</div></div></section>

        <section className="px-5 pb-20 lg:px-10"><div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 rounded-[2rem] bg-[#2a2622] p-8 text-[#faf8f5] sm:p-10 lg:flex-row lg:items-center"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#eadfd6]">Ainda com dúvidas?</p><h2 className="mt-3 font-serif text-3xl sm:text-4xl">Converse antes de decidir.</h2><p className="mt-3 max-w-2xl leading-7 text-[#dfd5ce]">Ainda não sabe se esta análise é adequada para o momento da sua empresa? Converse com a gente pelo WhatsApp e entenda como o Diagnóstico Estratégico 360º pode apoiar sua decisão.</p></div><a href="https://wa.me/5514996755751?text=Ol%C3%A1%2C%20Taynara!%20Quero%20entender%20se%20o%20Diagn%C3%B3stico%20Estrat%C3%A9gico%20360%C2%BA%20faz%20sentido%20para%20minha%20empresa." target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center rounded-full bg-[#eadfd6] px-6 py-3 text-sm font-semibold text-[#2a2622] transition hover:bg-[#f1e8e1]">Falar no WhatsApp <ArrowRight className="ml-2 h-4 w-4" /></a></div></section>

        <section id="privacidade" className="border-t border-[#2a2622]/10 bg-white px-5 py-16 lg:px-10"><div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-2"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#a65e3f]">Privacidade</p><h2 className="mt-3 font-serif text-2xl">Uso responsável das informações.</h2><p className="mt-3 text-sm leading-7 text-[#776e68]">Coletamos somente dados necessários para identificar a empresa, salvar o progresso e gerar o diagnóstico. As respostas ficam vinculadas à conta autenticada e não devem conter dados pessoais sensíveis ou dados de clientes. Você pode solicitar correção ou exclusão das informações pelos canais de atendimento.</p></div><div id="termos"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#a65e3f]">Termos essenciais</p><h2 className="mt-3 font-serif text-2xl">Como utilizar este relatório</h2><p className="mt-3 text-sm leading-7 text-[#776e68]">O Diagnóstico Estratégico 360º é uma avaliação orientativa baseada nas respostas fornecidas, com o objetivo de organizar prioridades e guiar as ações. A revisão feita antes da liberação confere a coerência do relatório, mas não é auditoria, certificação, benchmark de mercado nem parecer profissional personalizado; esses aprofundamentos fazem parte do Planejamento Estratégico Inteligente. Nenhuma etapa garante resultado, pois a eficácia da análise depende da execução e da gestão das ações pela empresa. O cliente é responsável pela qualidade das informações enviadas e pelas decisões tomadas a partir do relatório.</p></div></div></section>
      </main>
      <footer className="border-t border-[#2a2622]/10 px-5 py-8 lg:px-10"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 text-sm text-[#776e68] sm:flex-row"><span>© 2026 Diagnóstico Estratégico 360º</span><span>Clareza para decidir, prioridade para agir.</span></div></footer>
    </div>
  );
}

function Step({ number, icon, title, text }: { number: string; icon: React.ReactNode; title: string; text: string }) {
  return <div className="rounded-[1.5rem] border border-[#2a2622]/10 bg-white p-7"><div className="flex items-center justify-between"><span className="font-mono text-xs text-[#a65e3f]">{number}</span><span className="text-[#a65e3f]">{icon}</span></div><h3 className="mt-12 font-serif text-2xl">{title}</h3><p className="mt-3 leading-7 text-[#776e68]">{text}</p></div>;
}

const reportExampleSteps = [
  {
    label: "Onde agir primeiro",
    summary: "As oito dimensões são comparadas entre si e o relatório indica por onde começar, com o motivo de cada escolha.",
  },
  {
    label: "O que fazer em 30 dias",
    summary: "As prioridades viram três movimentos práticos, cada um com o resultado que você deve enxergar ao final do mês.",
  },
  {
    label: "O que levar para a liderança",
    summary: "Perguntas para conduzir a conversa com sócios e gestores e transformar a análise em decisão.",
  },
];

function ReportExample() {
  const [active, setActive] = useState(0);
  const [autoplay, setAutoplay] = useState(true);
  useEffect(() => {
    if (!autoplay || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setTimeout(() => setActive(current => (current + 1) % reportExampleSteps.length), 7000);
    return () => window.clearTimeout(timer);
  }, [active, autoplay]);
  const select = (index: number) => { setAutoplay(false); setActive(index); };

  return <div className="mt-12 grid gap-6 lg:grid-cols-[.8fr_1.2fr] lg:items-stretch">
    <div className="flex flex-col gap-3" role="tablist" aria-label="Partes do relatório">
      {reportExampleSteps.map((step, index) => {
        const selected = index === active;
        return <button key={step.label} role="tab" aria-selected={selected} onClick={() => select(index)} className={`relative overflow-hidden rounded-2xl border p-5 text-left transition ${selected ? "border-[#a65e3f]/40 bg-white shadow-[0_12px_30px_rgba(42,38,34,.08)]" : "border-[#2a2622]/10 bg-transparent hover:bg-white/60"}`}>
          <span className="flex items-center gap-3"><span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${selected ? "bg-[#a65e3f] text-white" : "bg-[#eadfd6] text-[#a65e3f]"}`}>{index + 1}</span><span className="font-semibold">{step.label}</span></span>
          {selected && <p className="mt-3 pl-10 text-sm leading-6 text-[#6b625c]">{step.summary}</p>}
          {selected && autoplay && <span key={`bar-${active}`} className="absolute bottom-0 left-0 h-0.5 bg-[#a65e3f] motion-safe:animate-[report-progress_7s_linear_forwards]" />}
        </button>;
      })}
      <p className="mt-2 flex items-start gap-2 px-1 text-sm leading-6 text-[#6b625c]"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#a65e3f]" />Antes da liberação, cada relatório passa por uma revisão de qualidade. Você recebe o seu em até 24h após o pagamento.</p>
    </div>

    <div className="relative min-h-[340px] rounded-[2rem] border border-[#2a2622]/10 bg-white p-6 sm:p-8">
      <div className="mb-4 flex justify-end sm:absolute sm:right-6 sm:top-6 sm:mb-0"><span className="rounded-full bg-[#f1e8e1] px-3 py-1 text-[11px] font-semibold text-[#a65e3f]">Exemplo ilustrativo</span></div>
      <div key={active} className="motion-safe:animate-[report-fade_.45s_ease-out]">
        {active === 0 && <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#a65e3f]">Matriz de prioridades</p>
          <div className="mt-6 divide-y divide-[#2a2622]/10 rounded-2xl border border-[#2a2622]/10">{[["Vendas e processo comercial", 22, "Muito alto"], ["Indicadores e decisões", 31, "Alto"], ["Posicionamento e valor", 44, "Alto"]].map(([title, score, impact], index) => <div key={title as string} className="flex items-center gap-4 px-4 py-3.5">
            <span className="font-mono text-xs text-[#a65e3f]">0{index + 1}</span>
            <div className="min-w-0 flex-1"><p className="font-medium leading-5">{title}</p><p className="mt-0.5 text-xs text-[#776e68]">Nota {score}/100</p></div>
            <span className="shrink-0 rounded-full bg-[#f1e8e1] px-3 py-1 text-xs font-semibold text-[#a65e3f]">Impacto {String(impact).toLowerCase()}</span>
          </div>)}</div>
          <div className="mt-7 rounded-2xl bg-[#faf8f5] p-4 text-sm leading-6 text-[#514943]"><span className="font-semibold">Por que vendas vem primeiro:</span> o processo comercial depende de esforço individual, sem etapas e próximos passos visíveis, o que tira previsibilidade do crescimento.</div>
        </div>}
        {active === 1 && <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#a65e3f]">Três movimentos para os próximos 30 dias</p>
          <ol className="mt-6 space-y-5">{[["Desenhar as etapas da venda e o próximo passo de cada oportunidade", "Você passa a ver onde as vendas travam."], ["Escolher até cinco indicadores ligados aos objetivos do ano", "As reuniões passam a decidir com base em números."], ["Escrever em uma frase o problema que a empresa resolve e para quem", "A comunicação ganha uma mensagem central."]].map(([move, result], index) => <li key={move} className="flex gap-4"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#f1e8e1] text-xs font-bold text-[#a65e3f]">{index + 1}</span><div><p className="font-medium leading-6">{move}</p><p className="mt-1 text-sm text-[#776e68]">{result}</p></div></li>)}</ol>
        </div>}
        {active === 2 && <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#a65e3f]">Perguntas para a reunião de liderança</p>
          <ul className="mt-6 space-y-4">{["Qual decisão, se tomada agora, reduziria mais a dispersão de energia na empresa?", "O que precisa deixar de ser feito para que a prioridade escolhida avance?", "Como vamos saber, em 30 ou 90 dias, que estamos no caminho certo?"].map(question => <li key={question} className="rounded-2xl border-l-2 border-[#a65e3f] bg-[#faf8f5] px-4 py-3 font-serif text-lg leading-7">{question}</li>)}</ul>
        </div>}
      </div>
    </div>
  </div>;
}
