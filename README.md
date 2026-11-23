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
