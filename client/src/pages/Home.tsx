import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, BarChart3, Check, Compass, LogIn, Menu, Sparkles, Target, X } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { PRODUCT_OFFER } from "@shared/product";

const dimensions = ["Clareza estratégica", "Posicionamento e valor", "Clientes e mercado", "Marketing e comunicação", "Vendas", "Processos e execução", "Indicadores", "Gestão e evolução"];
const STRIPE_TEST_PAYMENT_LINK = "https://buy.stripe.com/test_9B6dRb1yIgvogpX71odby00";
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
            <a href="#faq" className="transition hover:text-[#a65e3f]">Dúvidas</a>
          </nav>
          <div className="hidden items-center gap-3 md:flex">
            {user ? <Button variant="outline" onClick={() => setLocation("/app")} className="rounded-full border-[#a65e3f]/30">Minha área</Button> : <button onClick={() => startLogin()} className="text-sm font-semibold text-[#a65e3f]">Entrar</button>}
            <Button onClick={start} disabled={loading} className="rounded-full bg-[#a65e3f] px-5 text-[#faf8f5] hover:bg-[#86472f]">Ver como está minha empresa <ArrowRight className="ml-2 h-4 w-4" /></Button>
          </div>
          <button onClick={() => setMenuOpen(value => !value)} className="rounded-xl p-2 md:hidden" aria-label="Abrir menu">{menuOpen ? <X /> : <Menu />}</button>
        </div>
        {menuOpen && <div className="border-t border-[#2a2622]/10 px-5 py-4 md:hidden"><div className="flex flex-col gap-4 text-sm"><a href="#como-funciona" onClick={() => setMenuOpen(false)}>Como funciona</a><a href="#entrega" onClick={() => setMenuOpen(false)}>O que você recebe</a><button className="text-left font-semibold text-[#a65e3f]" onClick={start}>Ver como está minha empresa</button></div></div>}
      </header>

      <main>
        <section className="relative overflow-hidden px-5 pb-24 pt-16 lg:px-10 lg:pb-32 lg:pt-24">
          <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-[#eadfd6]/50 blur-3xl" />
          <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.05fr_.95fr]">
            <div className="relative">
              <Badge variant="outline" className="mb-7 rounded-full border-[#a65e3f]/25 bg-white/40 px-4 py-1.5 font-semibold uppercase tracking-[0.16em] text-[#a65e3f]">Diagnóstico estratégico guiado</Badge>
              <h1 className="max-w-3xl font-serif text-5xl leading-[.98] tracking-[-0.04em] text-[#2a2622] sm:text-6xl lg:text-7xl">Entenda o que está travando sua empresa <span className="text-[#a65e3f]">e escolha onde agir primeiro.</span></h1>
              <p className="mt-7 max-w-xl text-lg leading-8 text-[#6b625c]">O Diagnóstico Estratégico 360º transforma percepções dispersas em uma visão ampla e organizada da empresa. Você entende o que está funcionando, onde existem lacunas e qual decisão merece atenção antes de investir mais tempo, dinheiro ou energia.</p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row"><Button onClick={start} size="lg" className="h-13 rounded-full bg-[#a65e3f] px-7 text-base text-white hover:bg-[#86472f]">Quero entender minha empresa <ArrowRight className="ml-2 h-4 w-4" /></Button><a href="#como-funciona" className="inline-flex h-13 items-center justify-center rounded-full border border-[#2a2622]/15 px-7 text-sm font-semibold text-[#2a2622] transition hover:bg-white">Entender como funciona</a></div>
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

        <section className="border-y border-[#2a2622]/10 bg-[#2a2622] px-5 py-8 text-[#faf8f5] lg:px-10"><div className="mx-auto grid max-w-7xl gap-5 md:grid-cols-3"><div><p className="text-3xl font-serif">8</p><p className="mt-1 text-sm text-[#eadfd6]">dimensões conectadas</p></div><div><p className="text-3xl font-serif">32</p><p className="mt-1 text-sm text-[#eadfd6]">perguntas objetivas</p></div><div><p className="text-3xl font-serif">1</p><p className="mt-1 text-sm text-[#eadfd6]">direção clara para orientar os próximos passos</p></div></div></section>

        <section id="como-funciona" className="px-5 py-24 lg:px-10"><div className="mx-auto max-w-7xl"><div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#a65e3f]">Como funciona</p><h2 className="mt-4 font-serif text-4xl tracking-[-0.03em] sm:text-5xl">Pare de decidir no escuro.</h2><p className="mt-5 text-lg leading-8 text-[#776e68]">O Diagnóstico Estratégico 360º é para sócios, responsáveis e gestores de empresas de qualquer setor que precisam sair da sensação de apagar incêndios e conectar prioridades, decisões e execução.</p></div><div className="mt-14 grid gap-5 md:grid-cols-3"><Step number="01" icon={<Compass />} title="Informe" text="Responda perguntas objetivas sobre o momento real da sua empresa. Você pode salvar e continuar depois." /><Step number="02" icon={<BarChart3 />} title="Entenda" text="Veja uma análise por dimensão, com pontos fortes, lacunas e nível de segurança das informações." /><Step number="03" icon={<Target />} title="Priorize" text="Receba prioridades justificadas pelas suas respostas e um próximo passo possível para avançar." /></div></div></section>

        <section id="entrega" className="bg-[#f1e8e1] px-5 py-24 lg:px-10"><div className="mx-auto grid max-w-7xl gap-14 lg:grid-cols-[.8fr_1.2fr] lg:items-start"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#a65e3f]">O que você recebe</p><h2 className="mt-4 font-serif text-4xl tracking-[-0.03em] sm:text-5xl">Uma visão ampla para decidir melhor.</h2><p className="mt-5 text-lg leading-8 text-[#6b625c]">Você recebe uma visão organizada das oito dimensões que sustentam a gestão: estratégia, mercado, comunicação, vendas, execução, indicadores e evolução. O resultado mostra onde concentrar atenção e qual é o próximo passo mais coerente para o momento da empresa.</p><Button onClick={start} className="mt-8 rounded-full bg-[#a65e3f] text-white hover:bg-[#86472f]">Receber minha análise <ArrowRight className="ml-2 h-4 w-4" /></Button></div><div className="grid gap-x-10 gap-y-7 sm:grid-cols-2">{dimensions.map((item, index) => <div key={item} className="flex gap-3 border-b border-[#a65e3f]/15 pb-5"><span className="font-mono text-xs text-[#a65e3f]">0{index + 1}</span><div><h3 className="font-semibold">{item}</h3><p className="mt-1 text-sm leading-6 text-[#776e68]">{deliveryDetails[index]}</p></div></div>)}</div></div></section>

        <section className="px-5 py-20 lg:px-10"><div className="mx-auto grid max-w-7xl gap-8 rounded-[2rem] border border-[#a65e3f]/15 bg-white p-7 shadow-[0_18px_50px_rgba(13,79,86,.08)] sm:p-10 lg:grid-cols-[1fr_auto] lg:items-center"><div><h2 className="mt-3 font-serif text-3xl">Comece pela decisão que está esperando.</h2><p className="mt-3 max-w-2xl leading-7 text-[#776e68]">{PRODUCT_OFFER.delivery}. Você investe em uma análise estruturada para entender onde concentrar atenção antes de escolher os próximos passos.</p><p className="mt-4 text-sm text-[#776e68]">As condições de acesso são apresentadas no checkout, depois que você decidir avançar.</p></div><div className="lg:text-right"><Button onClick={start} className="mt-4 rounded-full bg-[#a65e3f] text-white hover:bg-[#86472f]">Quero receber meu Diagnóstico <ArrowRight className="ml-2 h-4 w-4" /></Button><a href={STRIPE_TEST_PAYMENT_LINK} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center rounded-full border border-[#a65e3f]/30 px-5 py-2.5 text-xs font-semibold text-[#a65e3f] transition hover:bg-[#f1e8e1]">Testar checkout Stripe (sandbox) <ArrowRight className="ml-2 h-3.5 w-3.5" /></a><p className="mt-2 text-[11px] text-[#776e68]">Link temporário para validação, sem cobrança real.</p></div></div></section>

        <section id="faq" className="px-5 py-24 lg:px-10"><div className="mx-auto max-w-4xl"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#a65e3f]">Dúvidas frequentes</p><h2 className="mt-4 font-serif text-4xl">Veja se este diagnóstico faz sentido para você</h2><div className="mt-10 divide-y divide-[#2a2622]/10">{[["O que eu recebo ao final?","Você recebe uma análise visual por dimensão, pontos fortes, lacunas, prioridades e próximos passos. Se fizer sentido, o resultado também indica quando avançar para um Planejamento Estratégico Guiado."],["A pontuação é um benchmark de mercado?","Não. A pontuação é uma análise interna do instrumento, calculada a partir de critérios explícitos. O relatório apresenta os critérios da análise e as lacunas de informação."],["Preciso ter todas as informações da empresa?","Não. Você pode marcar “Não informado” quando não tiver segurança. A análise evidencia as lacunas e sinaliza o nível de segurança das informações disponíveis, sem transformar a falta de informação em uma pontuação artificial."],["Para quem este diagnóstico é indicado?","Para sócios, responsáveis e gestores de empresas de diferentes setores e portes que precisam organizar prioridades, alinhar decisões e transformar intenção em execução sem depender de achismos."],["Quais são os principais benefícios do Diagnóstico estratégico guiado 360º?","Você ganha uma visão ampla e estruturada da empresa, identifica o que merece atenção, organiza prioridades e transforma percepções em próximos passos mais claros para a gestão."],["Como o Diagnóstico Estratégico 360º ajuda nas decisões do dia a dia?","Ele conecta estratégia, mercado, comunicação, vendas, processos, indicadores e evolução em uma mesma análise. Assim, você consegue separar urgências de prioridades e decidir com mais clareza onde concentrar energia."],["O Diagnóstico Estratégico 360º serve apenas para empresas que estão com problemas?","Não. Ele também é útil para empresas que estão crescendo, reorganizando sua operação ou buscando confirmar se as decisões atuais estão coerentes com o momento do negócio."],["O diagnóstico substitui o planejamento estratégico?","Não. O Diagnóstico estratégico guiado 360º organiza o cenário e aponta prioridades. O Planejamento Estratégico Guiado aprofunda essa análise e transforma as prioridades em objetivos, iniciativas, responsáveis, prazos e indicadores personalizados."],["O que muda depois de realizar o diagnóstico?","Você passa a ter uma visão mais organizada do momento da empresa, uma direção clara para orientar os próximos passos e perguntas estratégicas para conduzir conversas mais produtivas com a liderança."]].map(([q,a]) => <details key={q} className="group py-5"><summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold"><span>{q}</span><span className="text-2xl font-light text-[#a65e3f] transition group-open:rotate-45">+</span></summary><p className="max-w-3xl pt-4 leading-7 text-[#776e68]">{a}</p></details>)}</div></div></section>

        <section className="px-5 pb-20 lg:px-10"><div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-6 rounded-[2rem] bg-[#2a2622] p-8 text-[#faf8f5] sm:p-10 lg:flex-row lg:items-center"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#eadfd6]">Ainda com dúvidas?</p><h2 className="mt-3 font-serif text-3xl sm:text-4xl">Converse antes de decidir.</h2><p className="mt-3 max-w-2xl leading-7 text-[#dfd5ce]">Ainda não sabe se esta análise é adequada para o momento da sua empresa? Converse com a gente pelo WhatsApp e entenda como o Diagnóstico Estratégico 360º pode apoiar sua decisão.</p></div><a href="https://wa.me/5514996755751?text=Ol%C3%A1%2C%20Taynara!%20Quero%20entender%20se%20o%20Diagn%C3%B3stico%20Estrat%C3%A9gico%20360%C2%BA%20faz%20sentido%20para%20minha%20empresa." target="_blank" rel="noreferrer" className="inline-flex shrink-0 items-center rounded-full bg-[#eadfd6] px-6 py-3 text-sm font-semibold text-[#2a2622] transition hover:bg-[#f1e8e1]">Falar no WhatsApp <ArrowRight className="ml-2 h-4 w-4" /></a></div></section>

        <section id="privacidade" className="border-t border-[#2a2622]/10 bg-white px-5 py-16 lg:px-10"><div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-2"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#a65e3f]">Privacidade</p><h2 className="mt-3 font-serif text-2xl">Uso responsável das informações.</h2><p className="mt-3 text-sm leading-7 text-[#776e68]">Coletamos somente dados necessários para identificar a empresa, salvar o progresso e gerar o diagnóstico. As respostas ficam vinculadas à conta autenticada e não devem conter dados pessoais sensíveis ou dados de clientes. Você pode solicitar correção ou exclusão das informações pelos canais de atendimento.</p></div><div id="termos"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#a65e3f]">Termos essenciais</p><h2 className="mt-3 font-serif text-2xl">Como utilizar este relatório</h2><p className="mt-3 text-sm leading-7 text-[#776e68]">O Diagnóstico Estratégico 360º é uma avaliação orientativa baseada nas respostas fornecidas. O relatório tem como objetivo guiar as ações e organizar prioridades. Não é auditoria, certificação, benchmark de mercado, parecer profissional ou garantia de resultado. Para obter um parecer profissional e personalizado, é necessário seguir com o Planejamento Estratégico. O cliente é responsável pela qualidade das informações enviadas e pelas decisões tomadas a partir do relatório.</p></div></div></section>
      </main>
      <footer className="border-t border-[#2a2622]/10 px-5 py-8 lg:px-10"><div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 text-sm text-[#776e68] sm:flex-row"><span>© 2026 Diagnóstico Estratégico 360º</span><span>Clareza para decidir, prioridade para agir.</span></div></footer>
    </div>
  );
}

function Step({ number, icon, title, text }: { number: string; icon: React.ReactNode; title: string; text: string }) {
  return <div className="rounded-[1.5rem] border border-[#2a2622]/10 bg-white p-7"><div className="flex items-center justify-between"><span className="font-mono text-xs text-[#a65e3f]">{number}</span><span className="text-[#a65e3f]">{icon}</span></div><h3 className="mt-12 font-serif text-2xl">{title}</h3><p className="mt-3 leading-7 text-[#776e68]">{text}</p></div>;
}
