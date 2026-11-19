# Plano de implementação — Diagnóstico Estratégico 360º

## Objetivo

Construir um MVP funcional para vender e entregar uma avaliação estratégica guiada a empresas de diferentes setores. O MVP deve transformar respostas em uma leitura estruturada de maturidade organizacional, prioridades justificadas e próximos passos, com critérios claros, sem se apresentar como benchmark científico, auditoria ou garantia de resultado.

## Escopo desta versão

- landing page pública;
- cadastro e login com Manus OAuth;
- cadastro básico da empresa;
- questionário progressivo v0.2 com oito dimensões e 24 perguntas, preservando a definição v0.1 de 32 perguntas para resultados históricos;
- salvamento de progresso;
- pontuação determinística e reproduzível;
- cálculo de completude e confiança;
- resultado visual por dimensão;
- recomendações baseadas nas respostas;
- relatório visual imprimível/baixável pelo navegador;
- histórico de avaliações;
- painel administrativo mínimo para revisão e aprovação;
- isolamento de dados por usuário/empresa;
- política de privacidade e termos resumidos;
- logs de revisão e status.

Ficam fora desta primeira implementação: pagamento real, geração automática de PDF no backend, IA generativa, benchmarking externo, suíte de OKR, gestão de projetos e assinatura recorrente.

## Abordagem técnica

Usar o starter React/Express/tRPC/Drizzle existente no projeto, com MySQL gerenciado. A autenticação seguirá Manus OAuth e o cookie de sessão padrão `webdev_app_session`. As tabelas de domínio serão adicionadas ao schema Drizzle e migradas de forma aditiva.

O motor de diagnóstico ficará em módulo puro e testável no servidor. Ele receberá uma versão do questionário e respostas, calculará médias dimensionais, completude, confiança e recomendações. O frontend nunca será a fonte de verdade para pontuação ou autorização.

## Estrutura prevista

- `client/src/pages/`: landing, dashboard, questionário, resultado, relatório e administração.
- `client/src/components/`: navegação, cartões de dimensão, escala de resposta, progresso e componentes visuais.
- `client/src/lib/`: cliente tRPC, utilidades de avaliação e formatação.
- `server/diagnostic.ts`: regras determinísticas do diagnóstico.
- `server/db.ts`: queries de usuários, empresas, avaliações, respostas e revisões.
- `server/routers.ts`: procedimentos públicos, protegidos e administrativos.
- `drizzle/schema.ts`: tabelas e relações do domínio.
- `drizzle/`: migrações geradas e versionadas.
- `client/public/manus-routes.json`: manifesto de rotas servido pelo Vite.

## Direção de design

Três opções consideradas:

- **Editorial executivo (0,07):** composição de revista de negócios com contraste tipográfico e leitura por blocos.
- **Painel sereno (0,04):** interface clara, modular e orientada a dados, com destaque em azul petróleo.
- **Tech premium (0,06):** superfícies escuras, gradientes e alta densidade visual.

Escolha: **Editorial executivo**.

### Movimento

Editorial contemporâneo de negócios, com assimetria controlada e hierarquia tipográfica forte.

### Princípios

1. Clareza antes de complexidade.
2. Dados sempre acompanhados de interpretação.
3. Confiança por transparência metodológica.
4. Ação sugerida em cada etapa.

### Cores

Fundo off-white `#FAF8F5` e superfícies brancas para uma sensação de documento profissional. Terracota `#A65E3F` como cor proprietária de ação, proximidade e decisão. Bege rosado `#F1E8E1` sustenta as áreas de apoio e o grafite `#2A2622` mantém a leitura sofisticada sem usar preto absoluto. A referência visual é editorial, quente e sóbria, sem transformar o produto amplo em uma marca de saúde ou marketing.

### Layout

Hero dividido em texto e painel de resultado ilustrativo. Seções alternam faixas amplas e colunas assimétricas. O questionário usa uma coluna principal de leitura com navegação lateral de progresso em telas largas e barra superior em telas pequenas.

### Elementos de assinatura

- régua vertical de progresso com marcadores de dimensão;
- cartões de resultado com linhas de evidência;
- pequenos selos de confiança e de status metodológico.

### Interação e animação

Transições curtas de 160–220ms, sem animações decorativas. Ao trocar de etapa, a interface deve preservar contexto e mostrar confirmação de salvamento. Resultados carregam progressivamente apenas quando isso melhora a compreensão.

### Tipografia

Usar **Cormorant Garamond** para títulos e wordmark, com contraste editorial e quebras intencionais, e **Inter** para corpo, controles e dados. O corpo permanece entre 16 e 18px em áreas de leitura; botões e microcopy usam caixa alta e espaçamento moderado quando isso reforça a hierarquia.

### Essência da marca

**Clareza estratégica para empresas que precisam transformar intenção em prioridade e execução.** Personalidade: lúcida, confiável e prática.

### Voz

Headlines: diretas, sem promessas grandiosas. CTAs: orientadas ao próximo passo.

Exemplos:

- “Entenda o que merece atenção antes de decidir onde investir energia.”
- “Começar o diagnóstico”

### Wordmark

Usar “Diagnóstico” em destaque com separação visual do “360”, sugerindo leitura ampla sem recorrer a ícone médico. O símbolo deve ser uma moldura aberta com três eixos, remetendo a visão, prioridade e movimento.

## Fluxo de entrega

1. Atualizar schema e motor determinístico.
2. Criar rotas tRPC para avaliações e respostas.
3. Criar landing page e autenticação.
4. Criar jornada protegida do questionário.
5. Criar resultado, relatório e histórico.
6. Criar painel administrativo mínimo.
7. Configurar manifesto de rotas e diagnósticos.
8. Rodar typecheck, testes unitários, build e verificação HTTP.
9. Iniciar Preview e revisar os fluxos essenciais.
10. Salvar checkpoint no repositório canônico.
