# TODO — MVP Diagnóstico Estratégico 360º

## 1. Landing page e oferta

- [x] Exibir posicionamento amplo para empresas de diferentes setores.
- [x] Explicar problema, solução, entregáveis, funcionamento e critérios de análise.
- [x] Exibir CTA para iniciar o diagnóstico.
- [x] Direcionar o lead para cadastro autenticado antes de liberar o diagnóstico.
- [x] Incluir FAQ, política de privacidade e termos resumidos.
- [x] Exibir preço configurável como hipótese de teste, sem afirmar validação de mercado.

## 2. Autenticação e perfil da empresa

- [x] Usar Manus OAuth e preservar o cookie `webdev_app_session`.
- [x] Mostrar estado deslogado até a autenticação real ser concluída.
- [x] Permitir cadastrar Empresa, Responsável da empresa e telefone obrigatórios; E-mail e Instagram ou LinkedIn opcionais; setor e porte estáveis selecionados em lista.
- [x] Aplicar autorização no servidor e no banco.

## 3. Questionário progressivo

- [x] Implementar a versão atual v0.2 com oito dimensões e 24 perguntas, mantendo a definição v0.1 com 32 perguntas para avaliações históricas.
- [x] Mostrar progresso por contexto e dimensão, com indicação da etapa atual e do total respondido.
- [x] Permitir respostas de 0 a 4 e “Não informado” em uma escala visual compacta, com explicações acessíveis por apoio contextual.
- [x] Salvar respostas e progresso.
- [x] Permitir sair e continuar depois.
- [x] Evitar coletar dados pessoais sensíveis ou dados de clientes.

## 4. Motor de diagnóstico

- [x] Calcular pontuação de dimensão por média das respostas pontuadas.
- [x] Calcular pontuação geral somente com dimensões elegíveis.
- [x] Calcular completude e confiança.
- [x] Classificar faixas internas sem apresentar benchmark ou certificação.
- [x] Identificar lacunas e respostas não informadas.
- [x] Gerar prioridades e recomendações rastreáveis às respostas.
- [x] Manter cálculo determinístico no backend.

## 5. Resultado e relatório

- [x] Exibir resumo executivo e pontuação geral.
- [x] Exibir resultado por dimensão.
- [x] Exibir pontos fortes, lacunas e prioridades.
- [x] Exibir critérios metodológicos e premissas da análise.
- [x] Exibir próximos passos e solução complementar.
- [x] Permitir imprimir ou salvar o relatório em PDF pelo navegador.
- [x] Manter histórico das avaliações do cliente.
- [x] Manter rascunhos editáveis, fechar avaliações finalizadas e encaminhar correções administrativas para análise.
- [x] Exibir CTA de agendamento do Planejamento Estratégico Guiado para o WhatsApp +55 14 99675-5751.
- [x] Bloquear pontuação, prioridades e relatório até a confirmação do pagamento de R$ 497.
- [x] Disponibilizar pagamento à vista ou em 12x de R$ 41,42 no cartão via Stripe.
- [x] Preservar a digitação dos campos Empresa e E-mail durante o cadastro e edição.
- [x] Incluir síntese executiva personalizada com leitura do momento, principal atenção e nível de confiança.
- [x] Incluir padrão central identificado para conectar as notas em uma interpretação estratégica.
- [x] Incluir matriz de prioridades com impacto, urgência, justificativa e próxima ação.
- [x] Incluir três movimentos recomendados para os próximos 30 dias, com resultado esperado.
- [x] Incluir perguntas estratégicas para orientar a conversa da liderança.
- [x] Diferenciar claramente o que o diagnóstico entrega do que será construído no Planejamento Estratégico Guiado.
- [x] Coletar em cada avaliação até três momentos atuais, o desafio principal e a expectativa do lead.
- [x] Preservar o contexto de cada avaliação no histórico e exibi-lo no relatório sem alterar automaticamente a pontuação objetiva.

## 6. Revisão administrativa

- [x] Listar avaliações e status.
- [x] Visualizar respostas e resultados.
- [x] Permitir marcar revisão e aprovar relatório.
- [x] Registrar autor, data e justificativa de alterações.
- [x] Restringir acesso administrativo ao papel admin.

## 7. Qualidade técnica

- [x] Manter isolamento por empresa/usuário.
- [x] Configurar `public/manus-routes.json` com todas as páginas.
- [x] Configurar diagnósticos TypeScript.
- [x] Executar typecheck, testes e build.
- [x] Verificar endpoint `/api/health`.
- [x] Iniciar Preview com conteúdo real.
- [ ] Salvar checkpoint canônico após validação.
