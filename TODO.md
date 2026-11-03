# TODO — MVP Raio-X Estratégico 360

## 1. Landing page e oferta

- [x] Exibir posicionamento amplo para empresas de diferentes setores.
- [x] Explicar problema, solução, entregáveis, funcionamento e limitações.
- [x] Exibir CTA para iniciar o diagnóstico.
- [x] Direcionar o lead para cadastro autenticado antes de liberar o diagnóstico.
- [x] Incluir FAQ, política de privacidade e termos resumidos.
- [x] Exibir preço configurável como hipótese de teste, sem afirmar validação de mercado.

## 2. Autenticação e perfil da empresa

- [x] Usar Manus OAuth e preservar o cookie `webdev_app_session`.
- [x] Mostrar estado deslogado até a autenticação real ser concluída.
- [x] Permitir cadastrar Empresa, Responsável da empresa e telefone obrigatórios; E-mail e Instagram ou LinkedIn opcionais; setor selecionado em lista, porte, momento atual orientado aos pilares de decisão e desafio principal.
- [x] Aplicar autorização no servidor e no banco.

## 3. Questionário progressivo

- [x] Implementar oito dimensões e 32 perguntas.
- [x] Mostrar progresso e dimensão atual.
- [x] Permitir respostas de 0 a 4 e “Não informado”.
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
- [x] Exibir limitações metodológicas.
- [x] Exibir próximos passos e solução complementar.
- [x] Permitir imprimir ou salvar o relatório em PDF pelo navegador.
- [x] Manter histórico das avaliações do cliente.
- [x] Permitir editar e reenviar o Raio-X a partir do resultado ou do histórico.
- [x] Exibir CTA de agendamento do Planejamento Estratégico Guiado para o WhatsApp +55 14 99675-5751.

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
