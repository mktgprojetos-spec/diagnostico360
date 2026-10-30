import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, ArrowRight, Check, Save } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { DIAGNOSTIC_DIMENSIONS, DIAGNOSTIC_SCALE } from "@shared/diagnostic";

export default function AssessmentPage() {
  const { user, loading } = useAuth({ redirectOnUnauthenticated: true });
  const [, setLocation] = useLocation();
  const id = Number(new URLSearchParams(window.location.search).get("id"));
  const query = trpc.assessment.get.useQuery({ id }, { enabled: Boolean(user && id), retry: false });
  const save = trpc.assessment.save.useMutation();
  const submit = trpc.assessment.submit.useMutation({ onSuccess: () => setLocation(`/resultado/${id}`) });
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number | null>>({});
  const dimension = DIAGNOSTIC_DIMENSIONS[step];

  useEffect(() => {
    if (!query.data) return;
    const mapped = Object.fromEntries(query.data.answers.map(answer => [answer.questionId, answer.value]));
    setAnswers(mapped);
    setStep(Math.min(7, query.data.assessment.currentStep ?? 0));
  }, [query.data]);

  const answeredCount = useMemo(() => Object.values(answers).filter(value => typeof value === "number").length, [answers]);
  const stepComplete = dimension.questions.every(question => answers[question.id] !== undefined);
  const allAnswers = useMemo(() => Object.fromEntries(DIAGNOSTIC_DIMENSIONS.flatMap(item => item.questions.map(question => [question.id, answers[question.id] ?? null]))), [answers]);

  if (loading || query.isLoading) return <div className="flex min-h-screen items-center justify-center bg-[#f7f6f2] text-sm text-[#627375]">Carregando diagnóstico…</div>;
  if (!user || !query.data) return <div className="flex min-h-screen items-center justify-center bg-[#f7f6f2] p-6 text-center">Não foi possível carregar esta avaliação.</div>;

  const persist = (nextStep: number) => save.mutate({ assessmentId: id, answers: allAnswers, currentStep: nextStep });
  const goNext = () => { persist(Math.min(7, step + 1)); setStep(current => Math.min(7, current + 1)); };
  const goBack = () => { persist(Math.max(0, step - 1)); setStep(current => Math.max(0, current - 1)); };
  const finish = () => { if (answeredCount < 24) return; submit.mutate({ assessmentId: id, answers: allAnswers }); };

  return <div className="min-h-screen bg-[#f7f6f2] text-[#1c292b]"><header className="border-b border-[#1c292b]/10 bg-[#f7f6f2]/90 px-5 py-4 backdrop-blur-xl lg:px-10"><div className="mx-auto flex max-w-6xl items-center justify-between"><a href="/app" className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0d4f56] text-xs font-bold text-white">RX</span><span className="font-serif">Raio-X Estratégico 360</span></a><span className="flex items-center gap-2 text-xs text-[#627375]"><Save className="h-4 w-4 text-[#0d7778]" /> {save.isPending ? "Salvando…" : "Progresso salvo"}</span></div></header><main className="mx-auto max-w-6xl px-5 py-10 lg:px-10"><div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0d7778]">Diagnóstico em andamento</p><h1 className="mt-3 font-serif text-4xl tracking-[-0.03em]">Como sua empresa está organizada hoje?</h1></div><p className="text-sm text-[#627375]">{answeredCount} de 32 respondidas</p></div><div className="mb-8"><div className="mb-2 flex justify-between text-xs font-semibold text-[#627375]"><span>Etapa {step + 1} de 8</span><span>{Math.round(((step + 1) / 8) * 100)}%</span></div><Progress value={((step + 1) / 8) * 100} className="h-2 bg-[#dce9e7]" /></div><div className="grid gap-8 lg:grid-cols-[220px_1fr]"><aside className="hidden lg:block"><div className="sticky top-8 space-y-2">{DIAGNOSTIC_DIMENSIONS.map((item, index) => <button key={item.id} onClick={() => setStep(index)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition ${index === step ? "bg-[#183337] text-white" : "text-[#627375] hover:bg-white"}`}><span className={`font-mono text-xs ${index === step ? "text-[#b8ded8]" : "text-[#0d7778]"}`}>{item.eyebrow}</span><span className="truncate">{item.title}</span>{index < step && <Check className="ml-auto h-4 w-4 text-[#b8ded8]" />}</button>)}</div></aside><section className="rounded-[2rem] border border-[#1c292b]/10 bg-white p-6 shadow-sm sm:p-10"><div className="mb-10 border-b border-[#1c292b]/10 pb-7"><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0d7778]">{dimension.eyebrow} / 08</p><h2 className="mt-3 font-serif text-3xl">{dimension.title}</h2><p className="mt-3 max-w-2xl leading-7 text-[#627375]">{dimension.description} Escolha a alternativa que melhor representa a realidade atual.</p></div><div className="space-y-10">{dimension.questions.map((question, questionIndex) => <div key={question.id}><div className="flex gap-3"><span className="mt-0.5 font-mono text-xs text-[#0d7778]">{question.id}</span><h3 className="font-medium leading-6">{question.text}</h3></div><div className="mt-4 grid gap-2 sm:grid-cols-3 lg:grid-cols-6">{DIAGNOSTIC_SCALE.map(option => { const selected = answers[question.id] === option.value; return <button key={`${question.id}-${option.label}`} onClick={() => setAnswers(current => ({ ...current, [question.id]: option.value }))} className={`min-h-16 rounded-xl border px-2 py-2 text-center text-xs transition ${selected ? "border-[#0d7778] bg-[#e8f4f0] text-[#0d4f56] shadow-sm" : "border-[#1c292b]/10 text-[#627375] hover:border-[#0d7778]/50 hover:bg-[#f7f6f2]"}`}><span className="block font-semibold">{option.value === null ? "N/I" : option.value}</span><span className="mt-1 block leading-4">{option.label}</span></button>; })}</div>{questionIndex < dimension.questions.length - 1 && <div className="mt-8 border-b border-[#1c292b]/10" />}</div>)}</div><div className="mt-12 flex flex-col-reverse justify-between gap-3 border-t border-[#1c292b]/10 pt-6 sm:flex-row"><Button variant="outline" onClick={goBack} disabled={step === 0} className="rounded-full"><ArrowLeft className="mr-2 h-4 w-4" /> Voltar</Button>{step < 7 ? <Button onClick={goNext} disabled={!stepComplete} className="rounded-full bg-[#0d4f56] text-white hover:bg-[#083d43]">Próxima dimensão <ArrowRight className="ml-2 h-4 w-4" /></Button> : <Button onClick={finish} disabled={answeredCount < 24 || submit.isPending} className="rounded-full bg-[#0d4f56] text-white hover:bg-[#083d43]">{submit.isPending ? "Processando…" : answeredCount < 24 ? "Responda mais perguntas" : "Ver meu resultado"}<ArrowRight className="ml-2 h-4 w-4" /></Button>}</div><p className="mt-4 text-center text-xs text-[#627375]">Para manter uma leitura responsável, precisamos de pelo menos 24 respostas pontuadas.</p></section></div></main></div>;
}
