import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Check, Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { DIAGNOSTIC_DIMENSIONS, DIAGNOSTIC_SCALE } from "@shared/diagnostic";
import { toast } from "sonner";

const MOMENTS = [
  "Definindo direção e prioridades",
  "Reorganizando prioridades",
  "Estruturando posicionamento e proposta de valor",
  "Conhecendo melhor clientes e mercado",
  "Estruturando marketing e comunicação",
  "Aprimorando vendas e processo comercial",
  "Organizando processos e capacidade de execução",
  "Criando indicadores para decidir melhor",
  "Gerenciando riscos e próximos passos",
  "Em crescimento e buscando escala",
  "Consolidada e revisando a estratégia",
];

export default function AssessmentPage() {
  const { user, loading } = useAuth({ redirectOnUnauthenticated: true });
  const [, setLocation] = useLocation();
  const id = Number(new URLSearchParams(window.location.search).get("id"));
  const query = trpc.assessment.get.useQuery({ id }, { enabled: Boolean(user && id), retry: false });
  const save = trpc.assessment.save.useMutation({ onError: error => toast.error(error.message) });
  const submit = trpc.assessment.submit.useMutation({ onSuccess: () => setLocation(`/resultado/${id}`), onError: error => toast.error(error.message) });
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | null>>({});
  const [contextMoments, setContextMoments] = useState<string[]>([]);
  const [contextChallenge, setContextChallenge] = useState("");
  const [contextExpectation, setContextExpectation] = useState("");
  const dimensionIndex = Math.max(0, step - 1);
  const dimension = DIAGNOSTIC_DIMENSIONS[dimensionIndex];

  useEffect(() => {
    if (!query.data) return;
    const mapped = Object.fromEntries(query.data.answers.map(answer => [answer.questionId, answer.value]));
    setAnswers(mapped);
    const savedMoments = query.data.assessment.contextMoments ? JSON.parse(query.data.assessment.contextMoments) as string[] : [];
    setContextMoments(savedMoments);
    setContextChallenge(query.data.assessment.contextChallenge ?? "");
    setContextExpectation(query.data.assessment.contextExpectation ?? "");
    setStep(Math.min(8, Math.max(0, query.data.assessment.currentStep ?? 0)));
  }, [query.data]);

  const answeredCount = useMemo(() => Object.values(answers).filter(value => typeof value === "number").length, [answers]);
  const allAnswers = useMemo(() => Object.fromEntries(DIAGNOSTIC_DIMENSIONS.flatMap(item => item.questions.map(question => [question.id, answers[question.id] ?? null]))), [answers]);
  const contextComplete = contextMoments.length > 0 && contextMoments.length <= 3 && contextChallenge.trim().length >= 10 && contextExpectation.trim().length >= 10;
  const stepComplete = step === 0 ? contextComplete : dimension.questions.every(question => answers[question.id] !== undefined);
  const persist = (nextStep: number) => save.mutate({ assessmentId: id, answers: allAnswers, currentStep: nextStep, contextMoments, contextChallenge, contextExpectation });
  const goNext = () => { persist(step + 1); setStep(current => Math.min(8, current + 1)); };
  const goBack = () => { persist(Math.max(0, step - 1)); setStep(current => Math.max(0, current - 1)); };
  const finish = () => { if (!contextComplete || answeredCount < 24) return; submit.mutate({ assessmentId: id, answers: allAnswers, contextMoments, contextChallenge, contextExpectation }); };

  if (loading || query.isLoading) return <div className="flex min-h-screen items-center justify-center bg-[#faf8f5] text-sm text-[#776e68]">Carregando diagnóstico…</div>;
  if (!user || !query.data) return <div className="flex min-h-screen items-center justify-center bg-[#faf8f5] p-6 text-center">Não foi possível carregar esta avaliação.</div>;
  if (query.data.assessment.status !== "draft") return <div className="flex min-h-screen items-center justify-center bg-[#faf8f5] px-5 py-10 text-[#2a2622]"><div className="max-w-lg rounded-[2rem] border border-[#2a2622]/10 bg-white p-8 text-center shadow-sm"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#a65e3f]">Diagnóstico finalizado</p><h1 className="mt-4 font-serif text-3xl">Esta avaliação está fechada.</h1><p className="mt-4 leading-7 text-[#776e68]">Para preservar a consistência da análise, respostas não podem ser alteradas depois do envio. Se você identificou um erro factual, solicite uma correção administrativa.</p><a href={`mailto:taynaracampos@hotmail.com?subject=${encodeURIComponent("Solicitação de correção | Diagnóstico Estratégico 360º")}&body=${encodeURIComponent(`Olá, Taynara.\n\nGostaria de solicitar uma correção na avaliação #${id}.\n\nMotivo:\n`)}`} className="mt-6 inline-flex rounded-full bg-[#a65e3f] px-5 py-3 text-sm font-semibold text-white">Solicitar correção</a><a href={`/resultado/${id}`} className="mt-4 block text-sm font-semibold text-[#a65e3f]">Voltar ao resultado</a></div></div>;

  return <div className="min-h-screen bg-[#faf8f5] text-[#2a2622]"><header className="border-b border-[#2a2622]/10 bg-[#faf8f5]/90 px-5 py-4 backdrop-blur-xl"><div className="mx-auto flex max-w-6xl items-center justify-between"><a href="/app" className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#a65e3f] text-xs font-bold text-white">D3</span><span className="font-serif">Diagnóstico Estratégico 360º</span></a><span className="flex items-center gap-2 text-xs text-[#776e68]"><Save className="h-4 w-4 text-[#a65e3f]" /> {save.isPending ? "Salvando…" : "Progresso salvo"}</span></div></header><main className="mx-auto max-w-6xl px-5 py-10 lg:px-10"><div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#a65e3f]">Diagnóstico em andamento</p><h1 className="mt-3 font-serif text-4xl tracking-[-0.03em]">{step === 0 ? "Vamos entender o contexto da sua empresa." : "Como sua empresa está organizada hoje?"}</h1></div><p className="text-sm text-[#776e68]">{step === 0 ? "Contexto inicial" : `${answeredCount} de 32 respondidas`}</p></div><div className="mb-8"><div className="mb-2 flex justify-between text-xs font-semibold text-[#776e68]"><span>Etapa {step + 1} de 9</span><span>{Math.round(((step + 1) / 9) * 100)}%</span></div><Progress value={((step + 1) / 9) * 100} className="h-2 bg-[#eadfd6]" /></div>{step === 0 ? <ContextStep contextMoments={contextMoments} setContextMoments={setContextMoments} contextChallenge={contextChallenge} setContextChallenge={setContextChallenge} contextExpectation={contextExpectation} setContextExpectation={setContextExpectation} onNext={goNext} complete={contextComplete} /> : <div className="grid gap-8 lg:grid-cols-[220px_1fr]"><aside className="hidden lg:block"><div className="sticky top-8 space-y-2"><ContextNav /><>{DIAGNOSTIC_DIMENSIONS.map((item, index) => <button key={item.id} onClick={() => setStep(index + 1)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${index + 1 === step ? "bg-[#2a2622] text-white" : "text-[#776e68] hover:bg-white"}`}><span className={`font-mono text-xs ${index + 1 === step ? "text-[#eadfd6]" : "text-[#a65e3f]"}`}>{item.eyebrow}</span><span className="truncate">{item.title}</span>{index + 1 < step && <Check className="ml-auto h-4 w-4 text-[#eadfd6]" />}</button>)}</></div></aside><section className="rounded-[2rem] border border-[#2a2622]/10 bg-white p-6 shadow-sm sm:p-10"><div className="mb-10 border-b border-[#2a2622]/10 pb-7"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#a65e3f]">{dimension.eyebrow} / 08</p><h2 className="mt-3 font-serif text-3xl">{dimension.title}</h2><p className="mt-3 max-w-2xl leading-7 text-[#776e68]">{dimension.description} Escolha a alternativa que melhor representa a realidade atual.</p></div><div className="space-y-10">{dimension.questions.map((question, questionIndex) => <div key={question.id}><div className="flex gap-3"><span className="mt-0.5 font-mono text-xs text-[#a65e3f]">{question.id}</span><h3 className="font-medium leading-6">{question.text}</h3></div><div className="mt-4 grid gap-2 sm:grid-cols-3 lg:grid-cols-6">{DIAGNOSTIC_SCALE.map(option => { const selected = answers[question.id] === option.value; return <button key={`${question.id}-${option.label}`} onClick={() => setAnswers(current => ({ ...current, [question.id]: option.value }))} className={`min-h-16 rounded-xl border px-2 py-2 text-center text-xs transition ${selected ? "border-[#a65e3f] bg-[#f1e8e1] text-[#a65e3f] shadow-sm" : "border-[#2a2622]/10 text-[#776e68] hover:border-[#a65e3f]/50 hover:bg-[#faf8f5]"}`}><span className="block font-semibold">{option.value === null ? "N/I" : option.value}</span><span className="mt-1 block leading-4">{option.label}</span></button>; })}</div>{questionIndex < dimension.questions.length - 1 && <div className="mt-8 border-b border-[#2a2622]/10" />}</div>)}</div><div className="mt-12 flex flex-col-reverse justify-between gap-3 border-t border-[#2a2622]/10 pt-6 sm:flex-row"><Button variant="outline" onClick={goBack} disabled={step === 1} className="rounded-full"><ArrowLeft className="mr-2 h-4 w-4" /> Voltar</Button>{step < 8 ? <Button onClick={goNext} disabled={!stepComplete} className="rounded-full bg-[#a65e3f] text-white hover:bg-[#86472f]">Próxima dimensão <ArrowRight className="ml-2 h-4 w-4" /></Button> : <Button onClick={finish} disabled={answeredCount < 24 || submit.isPending} className="rounded-full bg-[#a65e3f] text-white hover:bg-[#86472f]">{submit.isPending ? "Processando…" : answeredCount < 24 ? "Responda mais perguntas" : "Ver meu resultado"}<ArrowRight className="ml-2 h-4 w-4" /></Button>}</div><p className="mt-4 text-center text-xs text-[#776e68]">Para manter uma análise consistente, precisamos de pelo menos 24 respostas pontuadas.</p></section></div>}</main></div>;
}

function ContextStep({ contextMoments, setContextMoments, contextChallenge, setContextChallenge, contextExpectation, setContextExpectation, onNext, complete }: { contextMoments: string[]; setContextMoments: (value: string[]) => void; contextChallenge: string; setContextChallenge: (value: string) => void; contextExpectation: string; setContextExpectation: (value: string) => void; onNext: () => void; complete: boolean }) {
  const toggle = (moment: string) => setContextMoments(contextMoments.includes(moment) ? contextMoments.filter(item => item !== moment) : contextMoments.length < 3 ? [...contextMoments, moment] : contextMoments);
  return <section className="mx-auto max-w-3xl rounded-[2rem] border border-[#2a2622]/10 bg-white p-6 shadow-sm sm:p-10"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#a65e3f]">Contexto do diagnóstico</p><h2 className="mt-3 font-serif text-3xl">O que está acontecendo agora?</h2><p className="mt-3 leading-7 text-[#776e68]">Estas informações pertencem a esta avaliação e ajudam a interpretar o resultado. Selecione até 3 alternativas que melhor representam o momento atual da empresa.</p><div className="mt-7 grid gap-3 sm:grid-cols-2">{MOMENTS.map(moment => <button type="button" key={moment} onClick={() => toggle(moment)} className={`rounded-xl border px-4 py-3 text-left text-sm transition ${contextMoments.includes(moment) ? "border-[#a65e3f] bg-[#f1e8e1] font-semibold text-[#a65e3f]" : "border-[#2a2622]/10 text-[#625851] hover:border-[#a65e3f]/40"}`}>{moment}</button>)}</div><p className="mt-2 text-xs text-[#776e68]">{contextMoments.length}/3 selecionadas</p><label className="mt-8 block"><span className="mb-2 block text-sm font-semibold">O que mais está dificultando as decisões ou o avanço da empresa neste momento?</span><textarea required value={contextChallenge} onChange={event => setContextChallenge(event.target.value)} className="min-h-28 w-full rounded-xl border border-[#2a2622]/10 p-3 text-sm outline-none focus:border-[#a65e3f]" placeholder="Descreva a situação que motivou a busca pelo diagnóstico." /></label><label className="mt-6 block"><span className="mb-2 block text-sm font-semibold">O que você espera compreender com este diagnóstico?</span><textarea required value={contextExpectation} onChange={event => setContextExpectation(event.target.value)} className="min-h-24 w-full rounded-xl border border-[#2a2622]/10 p-3 text-sm outline-none focus:border-[#a65e3f]" placeholder="Qual resposta seria mais importante obter ao final desta análise?" /></label><div className="mt-8 flex justify-end border-t border-[#2a2622]/10 pt-6"><Button onClick={onNext} disabled={!complete} className="rounded-full bg-[#a65e3f] text-white hover:bg-[#86472f]">Começar as 8 dimensões <ArrowRight className="ml-2 h-4 w-4" /></Button></div></section>;
}

function ContextNav() { return <div className="mb-2 flex w-full items-center gap-3 rounded-xl bg-[#f1e8e1] px-3 py-2.5 text-sm font-semibold text-[#a65e3f]"><span className="font-mono text-xs">00</span><span className="truncate">Contexto inicial</span></div>; }
