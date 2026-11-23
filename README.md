# ConectaPro

> Plataforma web atuando como um hub centralizado para facilitar a conexão direta entre professores particulares e clientes (alunos, pais e instituições de ensino).

## O Problema

Atualmente, o mercado educacional sofre com a dificuldade de encontrar profissionais qualificados para contratação, seja para aulas particulares ou para o suporte acadêmico em escolas e universidades. A busca por esses profissionais costuma depender de indicações informais ou de grupos genéricos em redes sociais, o que impede a comparação prévia da formação e da experiência dos educadores. Paralelamente, os professores enfrentam grandes obstáculos para divulgar seu próprio trabalho de forma profissional e alcançar novos alunos.

## A Solução

O **ConectaPro** nasce para curar essa dor, funcionando como um hub especializado que conecta diretamente quem precisa aprender com quem sabe ensinar. O projeto centraliza os perfis dos educadores, permitindo que os clientes filtrem e encontrem o profissional ideal para sua necessidade de forma rápida e segura, profissionalizando a contratação de serviços educacionais.

## Escopo do Projeto

- **Cadastro Especializado:** Perfis detalhados para professores (com dados de formação e área de atuação) e cadastros direcionados para alunos, com papel de administrador separado.
- **Busca Inteligente:** Motor de busca e filtragem segmentado por matéria e localização (CEP).
- **Perfis Públicos:** Visualização completa das credenciais, modalidades de aula e valores dos educadores, com selo de professor verificado.
- **Agendamento:** Reserva de aulas em horários disponibilizados pelo professor, com cancelamento e liberação do slot.
- **Chat:** Conversa direta entre aluno e professor, com recibo de leitura e notificações.
- **Avaliações:** Avaliação e perfil público do aluno e do professor.
- **Denúncias e Moderação:** Canal de denúncias com fila administrativa, timeout e banimento de usuários.
- **Pagamento:** Assinatura paga pelo professor para ativar a conta. O aluno não paga.
- **Dashboard Administrativo:** Métricas e aprovação de professores por certificado.
- **Segurança:** Autenticação com JWT, senhas protegidas com BCrypt, verificação em duas etapas por TOTP e autorização por papel.

## Tecnologias e Arquitetura

### Front-end

- **React + TypeScript:** Interface responsiva em SPA, com build via Vite.
- **Tailwind CSS:** Estilização por meio de classes utilitárias.
- **React Router & Axios:** Roteamento das páginas e consumo da API.
- **Vercel:** Hospedagem (Deploy) da aplicação web.

### Back-end

- **Java & Spring Boot:** API RESTful central.
- **PostgreSQL (Supabase):** Banco de dados relacional com mapeamento via Spring Data JPA e Hibernate.
- **Spring Security:** Autenticação stateless com JWT (login/senha), senhas protegidas com BCrypt e verificação em duas etapas por TOTP.
- **Render:** Hospedagem da API.

### Integrações Externas

- **BrasilAPI:** Consulta de CEP para preenchimento automático de endereço e cálculo da distância entre aluno e professor.
- **Mercado Pago:** Checkout e webhook da assinatura paga pelo professor.
- **AWS S3:** Armazenamento de imagens de perfil (bucket público) e certificados (bucket privado).
- **SMTP (JavaMailSender):** Disparo de e-mails transacionais, como reset de senha e avisos de moderação.

## Equipe de Desenvolvimento

Projeto Final de Curso (PFC) desenvolvido para obtenção do título de Bacharel em Engenharia de Software pela **Universidade de Mogi das Cruzes (UMC)**.

| Desenvolvedor          | RGM         |
| :--------------------- | :---------- |
| **Allan C D Guedes**   | 11231103501 |
| **Henrique C M Costa** | 11222100629 |
| **Victor H C Sampaio** | 11231101604 |
