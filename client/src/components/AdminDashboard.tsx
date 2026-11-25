import { PRICE_IN_CENTS, REVIEW_SLA_HOURS } from "@shared/product";
import { AlertTriangle, CheckCircle2, Clock3, FileText, TrendingUp, Wallet } from "lucide-react";

type Row = {
  id: number;
  status: string;
  paymentStatus: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  submittedAt: Date | string | null;
  paidAt: Date | string | null;
  isTest?: boolean;
};

const SLA_MS = REVIEW_SLA_HOURS * 3600000;
const currency = (value: number) => value.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const ms = (value: Date | string) => new Date(value).getTime();

/** Numeração interna sequencial (1, 2, 3…) por ordem de criação. Uso exclusivo do admin. */
export function internalNumbers(rows: Pick<Row, "id" | "createdAt">[]) {
  const map = new Map<number, number>();
  [...rows].sort((a, b) => ms(a.createdAt) - ms(b.createdAt) || a.id - b.id).forEach((row, index) => map.set(row.id, index + 1));
  return map;
}

export function AdminDashboard({ rows: allRows }: { rows: Row[] }) {
  const now = Date.now();
  const rows = allRows.filter(row => !row.isTest);
  const testCount = allRows.length - rows.length;
  const submitted = rows.filter(row => row.status !== "draft");
  const paid = rows.filter(row => row.paymentStatus === "paid");
  const released = paid.filter(row => row.status === "approved");
  const awaiting = paid.filter(row => row.status !== "approved");
  const overdue = awaiting.filter(row => row.paidAt && now > ms(row.paidAt) + SLA_MS);
  const revenue = paid.length * (PRICE_IN_CENTS / 100);
  const conversion = submitted.length ? Math.round((paid.length / submitted.length) * 100) : 0;
  const releaseTimes = released.filter(row => row.paidAt).map(row => (ms(row.updatedAt) - ms(row.paidAt!)) / 3600000).filter(hours => hours >= 0);
  const avgRelease = releaseTimes.length ? releaseTimes.reduce((sum, hours) => sum + hours, 0) / releaseTimes.length : null;

  const months = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(); date.setDate(1); date.setMonth(date.getMonth() - (5 - index));
    const key = `${date.getFullYear()}-${date.getMonth()}`;
    const count = paid.filter(row => { const d = new Date(row.paidAt ?? row.updatedAt); return `${d.getFullYear()}-${d.getMonth()}` === key; }).length;
    return { label: date.toLocaleDateString("pt-BR", { month: "short" }).replace(".", ""), count };
  });
  const maxMonth = Math.max(1, ...months.map(month => month.count));

  const funnel = [
    { label: "Iniciados", value: rows.length },
    { label: "Enviados", value: submitted.length },
    { label: "Pagos", value: paid.length },
    { label: "Relatórios liberados", value: released.length },
  ];

  return <section className="mt-10 space-y-5">
    {testCount > 0 && <p className="text-xs text-[#776e68]">{testCount} {testCount === 1 ? "diagnóstico de teste (feito por conta administradora) não entra" : "diagnósticos de teste (feitos por contas administradoras) não entram"} nas métricas.</p>}
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <Card icon={<CheckCircle2 className="h-5 w-5" />} label="Relatórios liberados" value={String(released.length)} hint={`${paid.length} pagos no total`} />
      <Card icon={<Clock3 className="h-5 w-5" />} label="Aguardando aprovação" value={String(awaiting.length)} hint={overdue.length ? `${overdue.length} com prazo vencido` : "Nenhum prazo vencido"} alert={overdue.length > 0} />
      <Card icon={<Wallet className="h-5 w-5" />} label="Receita confirmada" value={currency(revenue)} hint={`${currency(PRICE_IN_CENTS / 100)} por diagnóstico`} />
      <Card icon={<TrendingUp className="h-5 w-5" />} label="Conversão em pagamento" value={`${conversion}%`} hint={`${paid.length} de ${submitted.length} enviados`} />
    </div>

    <div className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
      <div className="rounded-[1.5rem] border border-[#2a2622]/10 bg-white p-6">
        <div className="flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-[0.17em] text-[#776e68]">Diagnósticos pagos por mês</p><FileText className="h-4 w-4 text-[#a65e3f]" /></div>
        <div className="mt-6 flex h-52 items-end gap-3">{months.map(month => <div key={month.label} className="flex flex-1 flex-col items-center gap-2">
          <span className="text-xs font-semibold text-[#2a2622]">{month.count || ""}</span>
          <div className="w-full rounded-t-lg bg-[#a65e3f]/85" style={{ height: `${Math.max(month.count ? 8 : 2, (month.count / maxMonth) * 160)}px`, opacity: month.count ? 1 : 0.25 }} />
          <span className="text-xs capitalize text-[#776e68]">{month.label}</span>
        </div>)}</div>
      </div>
      <div className="rounded-[1.5rem] border border-[#2a2622]/10 bg-white p-6">
        <p className="text-xs font-bold uppercase tracking-[0.17em] text-[#776e68]">Funil</p>
        <div className="mt-5 space-y-3">{funnel.map(step => <div key={step.label}>
          <div className="mb-1 flex justify-between text-sm"><span>{step.label}</span><span className="font-semibold">{step.value}</span></div>
          <div className="h-2 rounded-full bg-[#eadfd6]"><div className="h-2 rounded-full bg-[#a65e3f]" style={{ width: `${rows.length ? (step.value / rows.length) * 100 : 0}%` }} /></div>
        </div>)}</div>
        <p className="mt-5 border-t border-[#2a2622]/10 pt-4 text-sm text-[#6b625c]">Tempo médio entre pagamento e liberação: <strong className="text-[#2a2622]">{avgRelease === null ? "sem dados ainda" : avgRelease < 1 ? "menos de 1h" : `${Math.round(avgRelease)}h`}</strong></p>
      </div>
    </div>
  </section>;
}

function Card({ icon, label, value, hint, alert }: { icon: React.ReactNode; label: string; value: string; hint: string; alert?: boolean }) {
  return <div className={`rounded-[1.5rem] border bg-white p-6 ${alert ? "border-red-300" : "border-[#2a2622]/10"}`}>
    <div className="flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-[0.17em] text-[#776e68]">{label}</p><span className={alert ? "text-red-700" : "text-[#a65e3f]"}>{alert ? <AlertTriangle className="h-5 w-5" /> : icon}</span></div>
    <p className="mt-4 font-serif text-4xl text-[#2a2622]">{value}</p>
    <p className={`mt-2 text-xs ${alert ? "font-semibold text-red-700" : "text-[#776e68]"}`}>{hint}</p>
  </div>;
}
