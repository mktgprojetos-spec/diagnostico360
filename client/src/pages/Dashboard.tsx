import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Building2, ClipboardCheck, LogIn, LogOut, Plus, RefreshCw } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { startLogin } from "@/const";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

const sectors = ["Serviços", "Comércio e varejo", "Indústria", "Tecnologia", "Educação", "Construção e imobiliário", "Alimentação e hospitalidade", "Saúde e bem-estar", "Agronegócio", "Finanças e contabilidade", "Comunicação e marketing", "Outro"];
const sizes = ["1–5 pessoas", "6–20 pessoas", "21–50 pessoas", "51–200 pessoas", "Mais de 200 pessoas"];
const stages = [
  "Definindo direção e prioridades",
  "Organizando posicionamento e proposta de valor",
  "Conhecendo melhor clientes e mercado",
  "Estruturando marketing e comunicação",
  "Aprimorando vendas e processo comercial",
  "Organizando processos e capacidade de execução",
  "Criando indicadores para decidir melhor",
  "Gerenciando riscos e próximos ciclos",
  "Em crescimento e buscando escala",
  "Reorganizando prioridades",
  "Consolidada e revisando a estratégia",
];

export default function Dashboard() {
  const { user, loading, logout } = useAuth();
  const [, setLocation] = useLocation();
  const companyQuery = trpc.company.current.useQuery(undefined, { enabled: Boolean(user), retry: false });
  const listQuery = trpc.assessment.list.useQuery(undefined, { enabled: Boolean(user && companyQuery.data), retry: false });
  const [editingCompany, setEditingCompany] = useState(false);
  const saveCompany = trpc.company.save.useMutation({ onSuccess: () => { setEditingCompany(false); companyQuery.refetch(); listQuery.refetch(); } });
  const createAssessment = trpc.assessment.create.useMutation({ onSuccess: assessment => setLocation(`/diagnostico?id=${assessment.id}`) });
  const [form, setForm] = useState({ name: "", responsibleName: "", email: "", phone: "", socialUrl: "", sector: sectors[0], size: sizes[1], stage: stages[0], challenge: "" });

  if (loading) return <Loading />;
  if (!user) return <LoginCard />;

  if (companyQuery.isLoading) return <Loading />;
  if (!companyQuery.data || !companyQuery.data.responsibleName || !companyQuery.data.phone || editingCompany) {
    const existing = companyQuery.data;
    const formWithExisting = existing ? { ...form, name: existing.name, responsibleName: existing.responsibleName ?? "", email: existing.email ?? "", phone: existing.phone ?? "", socialUrl: existing.socialUrl ?? "", sector: existing.sector, size: existing.size, stage: existing.stage, challenge: existing.challenge } : form;
    return <CompanyForm form={formWithExisting} setForm={setForm} onSubmit={() => saveCompany.mutate(formWithExisting)} pending={saveCompany.isPending} editing={Boolean(existing)} />;
  }

  const company = companyQuery.data;
  const assessments = listQuery.data ?? [];
  const latest = assessments[0];

  return <AppShell user={user} logout={logout} current="Minha área">
    <div className="mx-auto max-w-6xl space-y-8">
      <section className="rounded-[2rem] bg-[#2a2622] p-7 text-[#faf8f5] sm:p-10"><div className="flex flex-col justify-between gap-8 md:flex-row md:items-end"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#eadfd6]">Minha área</p><h1 className="mt-4 max-w-xl font-serif text-4xl tracking-[-0.03em] sm:text-5xl">Olá, {user.name?.split(" ")[0] ?? "por aqui"}.</h1><p className="mt-4 max-w-xl leading-7 text-[#dfd5ce]">Vamos transformar o contexto de {company.name} em clareza sobre o que merece atenção agora.</p></div><Button onClick={() => latest ? (latest.status === "draft" ? setLocation(`/diagnostico?id=${latest.id}`) : setLocation(`/resultado/${latest.id}`)) : createAssessment.mutate()} disabled={createAssessment.isPending} className="rounded-full bg-[#eadfd6] text-[#2a2622] hover:bg-[#f1e8e1]"><Plus className="mr-2 h-4 w-4" /> {latest ? (latest.status === "draft" ? "Continuar diagnóstico" : "Ver último resultado") : "Iniciar diagnóstico"}</Button></div></section>
      <section className="grid gap-5 md:grid-cols-3"><Metric label="Empresa" value={company.name} icon={<Building2 />} /><Metric label="Avaliações" value={String(assessments.length).padStart(2, "0")} icon={<ClipboardCheck />} /><div className="rounded-[1.5rem] border border-[#2a2622]/10 bg-white p-6"><div className="flex items-center justify-between text-[#a65e3f]"><span className="text-xs font-bold uppercase tracking-[0.17em] text-[#776e68]">Último status</span><RefreshCw className="h-4 w-4" /></div><p className="mt-4 truncate font-serif text-2xl">{latest ? statusLabel(latest.status) : "Ainda não iniciado"}</p><button onClick={() => setEditingCompany(true)} className="mt-3 text-xs font-semibold text-[#a65e3f] hover:underline">Editar dados e contatos</button></div></section>
      <section className="rounded-[1.5rem] border border-[#2a2622]/10 bg-white p-6 sm:p-8"><div className="flex items-center justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.2em] text-[#a65e3f]">Histórico</p><h2 className="mt-2 font-serif text-3xl">Suas avaliações</h2></div><button onClick={() => { companyQuery.refetch(); listQuery.refetch(); }} className="rounded-full p-2 text-[#776e68] hover:bg-[#f1e8e1]" aria-label="Atualizar"><RefreshCw className="h-4 w-4" /></button></div>{assessments.length === 0 ? <div className="mt-8 rounded-2xl bg-[#faf8f5] p-8 text-center"><p className="font-medium">Seu primeiro diagnóstico ainda não começou.</p><p className="mt-2 text-sm text-[#776e68]">Responda às perguntas no seu ritmo e salve para continuar depois.</p></div> : <div className="mt-7 space-y-3">{assessments.map(item => <button key={item.id} onClick={() => setLocation(item.status === "draft" ? `/diagnostico?id=${item.id}` : `/resultado/${item.id}`)} className="flex w-full items-center justify-between gap-4 rounded-2xl border border-[#2a2622]/10 p-4 text-left transition hover:border-[#a65e3f]/40 hover:bg-[#faf8f5]"><div><p className="font-semibold">Raio-X Estratégico 360 <span className="ml-2 font-mono text-xs text-[#776e68]">#{String(item.id).padStart(4, "0")}</span></p><p className="mt-1 text-sm text-[#776e68]">Atualizado em {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString("pt-BR") : "—"}</p></div><div className="flex items-center gap-3"><Badge variant={item.status === "approved" ? "default" : "outline"}>{statusLabel(item.status)}</Badge><ArrowRight className="h-4 w-4 text-[#a65e3f]" /></div></button>)}</div>}</section>
    </div>
  </AppShell>;
}

function CompanyForm({ form, setForm, onSubmit, pending, editing }: { form: { name: string; responsibleName: string; email: string; phone: string; socialUrl: string; sector: string; size: string; stage: string; challenge: string }; setForm: React.Dispatch<React.SetStateAction<typeof form>>; onSubmit: () => void; pending: boolean; editing?: boolean }) {
  return <div className="min-h-screen bg-[#faf8f5] px-5 py-12 lg:px-10"><div className="mx-auto max-w-2xl"><div className="mb-10"><a href="/" className="text-xs font-bold uppercase tracking-[0.2em] text-[#a65e3f]">Raio-X Estratégico 360</a><h1 className="mt-5 font-serif text-5xl tracking-[-0.04em]">{editing ? "Atualize os dados da empresa." : <>Antes de começar,<br /><span className="text-[#a65e3f]">vamos conhecer a empresa.</span></>}</h1><p className="mt-5 text-lg leading-8 text-[#776e68]">{editing ? "Mantenha os contatos atualizados para receber o próximo passo." : "Para acessar o diagnóstico, informe a empresa, o responsável e um telefone. O e-mail e o Instagram ou LinkedIn são opcionais."}</p></div><form onSubmit={event => { event.preventDefault(); onSubmit(); }} className="space-y-6 rounded-[2rem] border border-[#2a2622]/10 bg-white p-6 shadow-sm sm:p-9"><Field label="Empresa"><Input required value={form.name} onChange={event => setForm(current => ({ ...current, name: event.target.value }))} placeholder="Como a empresa é conhecida?" /></Field><Field label="Responsável da empresa"><Input required value={form.responsibleName} onChange={event => setForm(current => ({ ...current, responsibleName: event.target.value }))} placeholder="Nome de quem responde pela empresa" /></Field><div className="grid gap-5 sm:grid-cols-2"><Field label="E-mail"><Input type="email" value={form.email} onChange={event => setForm(current => ({ ...current, email: event.target.value }))} placeholder="contato@empresa.com" /></Field><Field label="Telefone / WhatsApp"><Input required type="tel" value={form.phone} onChange={event => setForm(current => ({ ...current, phone: event.target.value }))} placeholder="(14) 99999-9999" /></Field></div><Field label="Instagram ou LinkedIn (opcional)"><Input type="url" value={form.socialUrl} onChange={event => setForm(current => ({ ...current, socialUrl: event.target.value }))} placeholder="https://instagram.com/suaempresa" /></Field><Field label="Setor de atuação"><select required value={form.sector} onChange={event => setForm(current => ({ ...current, sector: event.target.value }))} className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm">{sectors.map(item => <option key={item}>{item}</option>)}</select></Field><div className="grid gap-5 sm:grid-cols-2"><Field label="Tamanho da equipe"><select value={form.size} onChange={event => setForm(current => ({ ...current, size: event.target.value }))} className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm">{sizes.map(item => <option key={item}>{item}</option>)}</select></Field><Field label="Momento atual"><select value={form.stage} onChange={event => setForm(current => ({ ...current, stage: event.target.value }))} className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm">{stages.map(item => <option key={item}>{item}</option>)}</select></Field></div><Field label="Qual é o principal desafio hoje?"><Textarea required value={form.challenge} onChange={event => setForm(current => ({ ...current, challenge: event.target.value }))} placeholder="Conte o que está dificultando decisões, crescimento ou execução." /></Field><Button disabled={pending} className="h-12 w-full rounded-full bg-[#a65e3f] text-white hover:bg-[#86472f]">{pending ? "Salvando…" : editing ? "Salvar dados" : "Salvar e acessar diagnóstico"}<ArrowRight className="ml-2 h-4 w-4" /></Button></form></div></div>;
}

function AppShell({ children, user, logout, current }: { children: React.ReactNode; user: { name?: string | null; email?: string | null }; logout: () => Promise<void>; current: string }) { return <div className="min-h-screen bg-[#faf8f5] text-[#2a2622]"><header className="border-b border-[#2a2622]/10 bg-[#faf8f5]/90 px-5 py-4 backdrop-blur-xl lg:px-10"><div className="mx-auto flex max-w-7xl items-center justify-between"><a href="/" className="flex items-center gap-3"><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#a65e3f] text-xs font-bold text-white">RX</span><span><span className="block font-serif leading-none">Raio-X</span><span className="block text-[9px] font-bold uppercase tracking-[0.22em] text-[#a65e3f]">360</span></span></a><div className="flex items-center gap-4"><span className="hidden text-sm text-[#776e68] sm:block">{current}</span><button onClick={() => void logout()} className="flex items-center gap-2 rounded-full border border-[#2a2622]/10 px-3 py-2 text-xs font-semibold hover:bg-white"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#eadfd6] text-[#a65e3f]">{user.name?.charAt(0).toUpperCase() ?? "U"}</span><span className="hidden sm:block">Sair</span><LogOut className="h-3.5 w-3.5" /></button></div></div></header>{children}</div>; }
function Metric({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) { return <div className="rounded-[1.5rem] border border-[#2a2622]/10 bg-white p-6"><div className="flex items-center justify-between text-[#a65e3f]"><span className="text-xs font-bold uppercase tracking-[0.17em] text-[#776e68]">{label}</span>{icon}</div><p className="mt-6 truncate font-serif text-2xl">{value}</p></div>; }
function Field({ label, children }: { label: string; children: React.ReactNode }) { return <label className="block"><span className="mb-2 block text-sm font-semibold">{label}</span>{children}</label>; }
function statusLabel(status: string) { return status === "draft" ? "Em andamento" : status === "submitted" ? "Enviado" : status === "in_review" ? "Em revisão" : "Aprovado"; }
function Loading() { return <div className="flex min-h-screen items-center justify-center bg-[#faf8f5]"><div className="text-center"><div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-[#eadfd6] border-t-[#a65e3f]" /><p className="mt-4 text-sm text-[#776e68]">Carregando sua área…</p></div></div>; }
function LoginCard() { return <div className="flex min-h-screen items-center justify-center bg-[#faf8f5] px-5"><div className="max-w-md rounded-[2rem] border border-[#2a2622]/10 bg-white p-8 text-center shadow-sm"><span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#a65e3f] text-sm font-bold text-white">RX</span><h1 className="mt-6 font-serif text-3xl">Entre para continuar</h1><p className="mt-3 leading-7 text-[#776e68]">Sua área de diagnóstico é protegida para manter as informações da empresa separadas.</p><Button onClick={() => startLogin()} className="mt-7 w-full rounded-full bg-[#a65e3f] text-white hover:bg-[#86472f]">Entrar com minha conta <LogIn className="ml-2 h-4 w-4" /></Button><a href="/" className="mt-5 block text-sm text-[#a65e3f]">Voltar para a página inicial</a></div></div>; }
