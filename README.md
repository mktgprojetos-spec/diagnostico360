# Diagnóstico Estratégico 360º

React / Express / tRPC / Drizzle starter, adapted from the Sandbox web-db-user template.

- `pnpm dev`: development server; honors `PORT` (default 3000).
- `pnpm build` / `pnpm start`: build and serve `dist/index.js` and `dist/public/`.
- `pnpm db:migrate`: apply checked-in migrations. `pnpm db:push`: generate and apply new schema changes.
- `pnpm check` / `pnpm test`: types and application tests.

Start with the Webdev skill's default-template guide. Platform login, storage, payments and service contracts live in its shared references; read the relevant capability before extending its helper.

`server/_core/publicConfig.ts` exposes only named public runtime values. Private keys stay server-side. The platform serves managed `/manus-storage/` assets; the application does not register a second proxy.

Platform configuration is readable and editable through `webdev.config`. Default settings are initial values, not enforced constraints. The agent may modify the files, commands and configuration or follow the flexible guide for another stack.

## E-mails (independente da plataforma)

Avisos por e-mail usam SMTP próprio (`server/email.ts`), sem depender do serviço de notificações do Manus:

- **Cliente:** recebe o link do relatório quando a avaliação é aprovada no `/admin`.
- **Responsável:** recebe um aviso a cada pagamento confirmado, com o prazo de 24h para aprovação.

Configure estas variáveis de ambiente (secrets) na hospedagem:

| Variável | Exemplo |
| --- | --- |
| `SMTP_HOST` | `smtp.gmail.com` |
| `SMTP_PORT` | `465` (SSL) ou `587` (STARTTLS) |
| `SMTP_USER` | `contato@seudominio.com.br` |
| `SMTP_PASS` | senha de app do provedor |
| `EMAIL_FROM` | `Taynara Campos <contato@seudominio.com.br>` |
| `OWNER_NOTIFICATION_EMAIL` | e-mail que recebe os avisos de pagamento |
| `PUBLIC_APP_URL` | `https://raiox360-lfbgosfs.manus.space` |

Sem essas variáveis o sistema continua funcionando; apenas os e-mails não são enviados (o painel avisa para usar o WhatsApp).

## Pagamentos (Mercado Pago Checkout Pro)

O pagamento usa o Mercado Pago (`server/mercadopago.ts`): Pix e cartão de crédito em até 12x.
Quantas parcelas são **sem juros** é definido na própria conta Mercado Pago
("Parcelamento sem juros" → "Código QR e pagamentos on-line"). Hoje: até 3x sem juros.

| Variável | Onde encontrar |
| --- | --- |
| `MERCADOPAGO_ACCESS_TOKEN` | Suas integrações → sua aplicação → Credenciais (teste: `TEST-…`; produção: `APP_USR-…`) |
| `MERCADOPAGO_WEBHOOK_SECRET` | Suas integrações → sua aplicação → Webhooks → assinatura secreta |

Webhook: `https://SEU-DOMINIO/api/mercadopago/webhook`, evento **Pagamentos**.
O pagamento é sempre reconsultado na API antes de liberar o diagnóstico.
As colunas `stripe*` do banco foram mantidas (sem migração) e passam a guardar os IDs do Mercado Pago.

## Acesso de administradora

- A conta dona do projeto no Manus (`OWNER_OPEN_ID`) é administradora automaticamente.
- Outras contas: secret `ADMIN_EMAILS` com e-mails separados por vírgula (ex.: `mkt.gprojetos@gmail.com`). Vale a partir do próximo login.
- Alternativa sem conta Manus: `/admin-login`, usuário `admin` e senha do secret `ADMIN_PASSWORD`.
- Administradoras criam diagnósticos de teste sem a regra dos 90 dias; eles ficam marcados como "Teste" e fora das métricas.

## Diagnósticos de teste

- No `/admin`, o botão **Marcar como teste** tira um diagnóstico das métricas do dashboard (coluna `assessments.isTest`, migração `0006`).
- Diagnósticos feitos por contas administradoras já contam como teste automaticamente.
- Ao publicar esta versão, rode `pnpm db:migrate` para criar a coluna.
