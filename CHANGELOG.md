# Entrega `entrega1611`

## 1. Visão Geral da Entrega

O ConectaPro deixa de ser só busca e agendamento. Esta entrega adiciona conversa entre aluno e professor, denúncias com fila administrativa, aprovação de professor com certificado, perfil e avaliação de aluno, e direitos de conta (exportação e exclusão). O papel `ADMIN` fica separado de aluno e professor, e as regras de aula passam a valer no backend.

## 2. Novas Funcionalidades

### Allan14GDS

- Chat bidirecional entre aluno e professor, com central de conversas, recibo de leitura e notificações.
- Canal de denúncias ligado à moderação.
- Papel `ADMIN` exclusivo (`TipoUsuario.ADMIN` e `ROLE_ADMIN`). Dashboard, `/admin/**` e moderação exigem esse papel.
- Fila administrativa de professores: visualização do certificado, conversa na análise e selo de verificado na listagem pública.
- Professor logado não agenda aula com outro professor (validação no `AgendamentoService` e no frontend). Administrador continua fora dessa trava.
- Filtro **Desde o início** no dashboard.

### HenriqueCastro18

- Upload de foto de perfil no S3, com a aplicação subindo mesmo sem credenciais AWS.
- Aprovação de professor por certificado ou justificativa.
- Assistente de dúvidas frequentes.
- Termos de uso: leitura completa antes do aceite, e o aceite gravado no cadastro (`aceitouTermos`).
- Senha de cadastro com no mínimo 8 caracteres, uma maiúscula, um número e um caractere especial.
- **Lembrar de mim** define se o token fica persistente ou só na sessão atual, inclusive depois do TOTP.
- Cancelamento de aula só com pelo menos 1 hora de antecedência.
- Clique na notificação abre o chat (`CHAT`) ou a página de aulas (`AULA_NOVA` e `AULA_LEMBRETE`).
- Lembrete automático de aula (1 h e 24 h).

### VictorHCSampaio

- Avaliações e perfil público do aluno, com novos endpoints e modelo.
- Upload e remoção de avatar do professor.
- Cancelamento de aula pelo aluno e pelo professor, com liberação do slot.
- Moderação: denúncia enviada por e-mail administrativo, aba de denúncias de alunos e página única de resolução, com timeout de usuário.
- Exportação dos dados do usuário (LGPD) e exclusão de conta.

## 3. Melhorias de UI/UX

### Allan14GDS

- `UserAvatar` e a prévia do `AvatarUpload` mostram a inicial do nome quando não há foto. URL vazia, `"null"`, `"undefined"` ou imagem que falha no carregamento caem nesse fallback, em vez de renderizar uma tag `<img>` quebrada.
- Imagens nas seções Diferencial Estratégico e Feiras e Eventos da landing. O selo de verificado do painel em destaque fica ao lado do nome, sem o badge flutuante duplicado.
- UX do administrador: navegação e avatar próprios do perfil administrativo.
- Ajustes visuais da fila de denúncias.

### HenriqueCastro18

- Navegação agrupada no menu do admin e no menu do avatar.
- Ordem dos dias no fluxo de agendamento ajustada.
- Modal de termos mais claro, com bloqueio do aceite até o fim da leitura.

## 4. Correções de Bugs

- Prévia de avatar quebrada quando a URL da foto era inválida ou a imagem não carregava. O componente agora valida a URL e trata `onError` (Allan14GDS).
- Professor logado via o próprio perfil na listagem pública. Esse perfil deixa de aparecer para a conta logada (Allan14GDS).
- A aplicação não subia sem credenciais AWS configuradas (HenriqueCastro18).
- Falha de deploy na Vercel (VictorHCSampaio).
- Testes de integração tentavam conexão SMTP real. O `EmailService` passou a ser mockado (Allan14GDS).

## 5. Ajustes Técnicos / Refatorações

- Checkstyle: chaves obrigatórias em blocos `if` (Allan14GDS).
- Imports não usados removidos (VictorHCSampaio e HenriqueCastro18).
- `BPMN_DIAGRAM.md` atualizado e `CLASS_DIAGRAM.md` criado, alinhados à implementação (HenriqueCastro18).
- Segurança de chat e de agendamento concentrada no backend: participante da conversa, dono do agendamento, professor ativo e conta administrativa fora da vitrine de professores.
- Novos serviços e controllers para chat, denúncia, moderação, notificação, avaliação, perfil, S3 e administração de professores, com testes de serviço e de integração correspondentes.
