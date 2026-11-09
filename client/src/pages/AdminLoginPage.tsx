import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { LockKeyhole, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

export default function AdminLoginPage() {
  const [, setLocation] = useLocation();
  const [password, setPassword] = useState("");
  const login = trpc.auth.adminLogin.useMutation({ onSuccess: () => setLocation("/admin") });

  return <div className="flex min-h-screen items-center justify-center bg-[#faf8f5] px-5 py-12 text-[#2a2622]"><div className="w-full max-w-md rounded-[2rem] border border-[#2a2622]/10 bg-white p-8 shadow-sm sm:p-10"><div className="flex items-center gap-3"><span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#a65e3f] text-sm font-bold text-white">D3</span><div><p className="font-serif text-xl">Diagnóstico 360º</p><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#a65e3f]">Acesso administrativo</p></div></div><div className="mt-10"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#f1e8e1] text-[#a65e3f]"><LockKeyhole className="h-5 w-5" /></div><h1 className="mt-5 font-serif text-4xl tracking-[-0.03em]">Entrar no painel</h1><p className="mt-3 text-sm leading-6 text-[#776e68]">Use o acesso administrativo próprio para acompanhar avaliações e validar o fluxo de pagamentos em modo de teste.</p></div><form className="mt-8 space-y-5" onSubmit={event => { event.preventDefault(); login.mutate({ username: "admin", password }); }}><label className="block text-sm font-semibold">Usuário<Input value="admin" readOnly className="mt-2 bg-[#faf8f5]" /></label><label className="block text-sm font-semibold">Senha<Input type="password" value={password} onChange={event => setPassword(event.target.value)} placeholder="Digite sua senha" autoComplete="current-password" className="mt-2" required /></label>{login.error && <p className="rounded-xl bg-[#f8eee8] px-4 py-3 text-sm text-[#7a5545]">{login.error.message}</p>}<Button type="submit" disabled={login.isPending} className="h-12 w-full rounded-full bg-[#a65e3f] text-white hover:bg-[#86472f]"><ShieldCheck className="mr-2 h-4 w-4" />{login.isPending ? "Validando…" : "Entrar no painel"}</Button></form><a href="/" className="mt-6 block text-center text-sm font-semibold text-[#a65e3f]">Voltar para a página inicial</a></div></div>;
}
