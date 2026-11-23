import { ArrowRight, Clock3, FileCheck2, ShieldCheck, UserCheck } from "lucide-react";
import { REVIEW_SLA_HOURS } from "@shared/product";

const WHATSAPP_URL = "https://wa.me/5514996755751?text=Ol%C3%A1%2C%20Taynara!%20Tenho%20uma%20d%C3%BAvida%20sobre%20a%20libera%C3%A7%C3%A3o%20do%20meu%20Diagn%C3%B3stico%20360.";

function formatDeadline(paidAt: Date | string | null | undefined) {
  if (!paidAt) return null;
  const deadline = new Date(new Date(paidAt).getTime() + REVIEW_SLA_HOURS * 60 * 60 * 1000);
  if (deadline.getTime() <= Date.now()) return "overdue" as const;
  return `${deadline.toLocaleDateString("pt-BR")} às ${deadline.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
}

export function ReviewPending({ assessmentId, paidAt }: { assessmentId: number; paidAt?: Date | string | null }) {
  const deadline = formatDeadline(paidAt);
  const reasons = [
    { icon: <FileCheck2 className="h-5 w-5" />, title: "Coerência da análise", text: "Conferimos se pontuações, contexto informado e prioridades contam a mesma história antes de virarem recomendação." },
    { icon: <UserCheck className="h-5 w-5" />, title: "Revisão humana", text: "Uma pessoa confere o relatório antes da liberação, para que nenhuma recomendação incoerente chegue até você." },
    { icon: <ShieldCheck className="h-5 w-5" />, title: "Segurança para os dois lados", text: "Você recebe uma análise consistente para orientar decisões, e nós asseguramos o mesmo padrão de qualidade em cada entrega." },
  ];

  return <div className="min-h-screen bg-[#faf8f5] px-5 py-10 text-[#2a2622] sm:py-16">
    <div className="mx-auto max-w-4xl">
      <a href="/app" className="flex items-center gap-3 text-sm font-semibold text-[#a65e3f]"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#a65e3f] text-xs font-bold text-white">D3</span>Voltar para minha área</a>
      <div className="mt-10 rounded-[2rem] bg-[#2a2622] p-7 text-[#faf8f5] sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#eadfd6]">Pagamento confirmado</p>
        <h1 className="mt-4 font-serif text-4xl tracking-[-0.03em] sm:text-5xl">Seu diagnóstico está em revisão final.</h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-[#dfd5ce]">Obrigada pela confiança. {deadline === "overdue" ? "Estamos concluindo" : `O relatório final será liberado em até ${REVIEW_SLA_HOURS} horas, depois de`} uma revisão cuidadosa das suas respostas e da análise gerada{deadline === "overdue" ? " para liberar o seu relatório final" : ""}.</p>
        <div className="mt-8 flex items-center gap-3 rounded-2xl bg-white/10 p-4 text-sm">
          <Clock3 className="h-5 w-5 shrink-0 text-[#eadfd6]" />
          <span>{deadline === "overdue" ? <>Sua revisão está sendo finalizada e o relatório será liberado em breve.</> : deadline ? <>Liberação prevista até <strong>{deadline}</strong>.</> : <>Liberação prevista em até <strong>{REVIEW_SLA_HOURS} horas</strong>.</>} Esta página se atualiza sozinha, e o relatório também aparecerá na sua área.</span>
        </div>
      </div>
      <section className="mt-5 rounded-[2rem] border border-[#2a2622]/10 bg-white p-7 sm:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#a65e3f]">Por que existe esta etapa</p>
        <h2 className="mt-2 font-serif text-3xl">Uma revisão para você decidir com segurança.</h2>
        <div className="mt-8 grid gap-5 md:grid-cols-3">{reasons.map(reason => <div key={reason.title} className="rounded-2xl bg-[#f1e8e1] p-5"><span className="text-[#a65e3f]">{reason.icon}</span><h3 className="mt-3 font-semibold">{reason.title}</h3><p className="mt-2 text-sm leading-6 text-[#6b625c]">{reason.text}</p></div>)}</div>
        <div className="mt-8 flex flex-wrap gap-3">
          <a href="/app" className="inline-flex h-10 items-center rounded-full bg-[#a65e3f] px-5 text-sm font-semibold text-white transition hover:bg-[#86472f]">Ir para minha área <ArrowRight className="ml-2 h-4 w-4" /></a>
          <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center rounded-full border border-[#a65e3f] px-5 text-sm font-semibold text-[#a65e3f]">Falar no WhatsApp</a>
        </div>
      </section>
    </div>
  </div>;
}
