import nodemailer from "nodemailer";
import { REVIEW_SLA_HOURS } from "@shared/product";

/**
 * Envio de e-mail independente da plataforma de hospedagem.
 * Funciona com qualquer provedor SMTP (Gmail/Google Workspace, Hostinger, Zoho, Resend, Brevo…).
 *
 * Variáveis de ambiente:
 *   SMTP_HOST, SMTP_PORT (465 = SSL, 587 = STARTTLS), SMTP_USER, SMTP_PASS
 *   EMAIL_FROM                 ex.: "Taynara Campos <contato@seudominio.com.br>"
 *   OWNER_NOTIFICATION_EMAIL   e-mail que recebe os avisos internos (pagamentos)
 *   PUBLIC_APP_URL             ex.: https://diagnostico360.com.br (usado nos links dos e-mails)
 */
const env = {
  get host() { return process.env.SMTP_HOST ?? ""; },
  get port() { return Number(process.env.SMTP_PORT ?? 587); },
  get user() { return process.env.SMTP_USER ?? ""; },
  get pass() { return process.env.SMTP_PASS ?? ""; },
  get from() { return process.env.EMAIL_FROM ?? process.env.SMTP_USER ?? ""; },
  get ownerEmail() { return process.env.OWNER_NOTIFICATION_EMAIL ?? ""; },
  get appUrl() { return (process.env.PUBLIC_APP_URL ?? "").replace(/\/$/, ""); },
};

export function isEmailConfigured() {
  return Boolean(env.host && env.user && env.pass && env.from);
}

let transporter: nodemailer.Transporter | null = null;
function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: env.host,
      port: env.port,
      secure: env.port === 465,
      auth: { user: env.user, pass: env.pass },
    });
  }
  return transporter;
}

/** Envia um e-mail. Nunca lança erro: retorna false se não estiver configurado ou se falhar. */
export async function sendEmail(to: string, subject: string, html: string, text: string) {
  if (!isEmailConfigured()) {
    console.warn("[Email] SMTP não configurado; e-mail não enviado:", subject);
    return false;
  }
  try {
    await getTransporter().sendMail({ from: env.from, to, subject, html, text });
    return true;
  } catch (error) {
    console.error("[Email] Falha ao enviar:", subject, error);
    return false;
  }
}

export function appUrl(fallbackOrigin?: string | null) {
  return env.appUrl || (fallbackOrigin ?? "").replace(/\/$/, "");
}

const escape = (value: string) => value.replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char]!));

function layout(title: string, body: string, cta?: { label: string; url: string }) {
  return `<!doctype html><html><body style="margin:0;background:#faf8f5;font-family:Arial,Helvetica,sans-serif;color:#2a2622">
<div style="max-width:560px;margin:0 auto;padding:32px 20px">
<p style="font-size:11px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;color:#a65e3f">Diagnóstico Estratégico 360º</p>
<h1 style="font-family:Georgia,serif;font-weight:normal;font-size:26px;line-height:1.25">${escape(title)}</h1>
<div style="font-size:15px;line-height:1.7;color:#514943">${body}</div>
${cta ? `<p style="margin:28px 0"><a href="${cta.url}" style="background:#a65e3f;color:#fff;text-decoration:none;padding:12px 22px;border-radius:999px;font-weight:bold;font-size:14px">${escape(cta.label)}</a></p>` : ""}
<p style="font-size:12px;color:#776e68;border-top:1px solid #e8e3de;padding-top:16px;margin-top:32px">Este é um e-mail automático do Diagnóstico Estratégico 360º.</p>
</div></body></html>`;
}

const code = (assessmentId: number) => `#${String(assessmentId).padStart(4, "0")}`;

/** E-mail para o cliente quando o relatório é aprovado. */
export function sendReportReleasedEmail(input: { to: string; responsibleName?: string | null; assessmentId: number; baseUrl: string }) {
  const reportUrl = `${input.baseUrl}/relatorio/${input.assessmentId}`;
  const greeting = input.responsibleName ? `Olá, ${escape(input.responsibleName.split(" ")[0])}!` : "Olá!";
  const subject = `Seu Diagnóstico Estratégico 360º ${code(input.assessmentId)} está liberado`;
  const html = layout("Seu relatório final está liberado.", `
<p>${greeting}</p>
<p>A revisão do seu Diagnóstico ${code(input.assessmentId)} foi concluída. Conferimos a coerência entre suas respostas, o contexto informado e as prioridades sugeridas, e o relatório final já está disponível na sua área.</p>
<p>Uma sugestão: leia o relatório com calma e reserve um momento com a liderança para discutir as perguntas estratégicas do final. É ali que a análise começa a virar decisão.</p>`, { label: "Ver meu relatório", url: reportUrl });
  const text = `${greeting}\n\nA revisão do seu Diagnóstico ${code(input.assessmentId)} foi concluída e o relatório final já está liberado:\n${reportUrl}\n`;
  return sendEmail(input.to, subject, html, text);
}

/** Aviso interno para a responsável quando um pagamento é confirmado. */
export function sendPaymentReceivedOwnerEmail(input: { assessmentId: number; baseUrl: string }) {
  if (!env.ownerEmail) {
    console.warn("[Email] OWNER_NOTIFICATION_EMAIL não configurado; aviso interno não enviado.");
    return Promise.resolve(false);
  }
  const deadline = new Date(Date.now() + REVIEW_SLA_HOURS * 3600000).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
  const subject = `Pagamento confirmado: aprovar Diagnóstico ${code(input.assessmentId)} até ${deadline}`;
  const html = layout(`Diagnóstico ${code(input.assessmentId)} aguardando sua aprovação`, `
<p>O pagamento foi confirmado e o cliente está vendo a tela de revisão final.</p>
<p><strong>Prazo prometido para liberação: ${deadline}</strong> (${REVIEW_SLA_HOURS}h após o pagamento).</p>`, input.baseUrl ? { label: "Abrir painel administrativo", url: `${input.baseUrl}/admin` } : undefined);
  const text = `Pagamento confirmado do Diagnóstico ${code(input.assessmentId)}. Aprovar até ${deadline}. Painel: ${input.baseUrl}/admin`;
  return sendEmail(env.ownerEmail, subject, html, text);
}
