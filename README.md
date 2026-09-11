# ConectaPro

> Plataforma web atuando como um hub centralizado para facilitar a conexão direta entre professores particulares e clientes (alunos, pais e instituições de ensino).

## O Problema

Atualmente, o mercado educacional sofre com a dificuldade de encontrar profissionais qualificados para contratação, seja para aulas particulares ou para o suporte acadêmico em escolas e universidades. A busca por esses profissionais costuma depender de indicações informais ou de grupos genéricos em redes sociais, o que impede a comparação prévia da formação e da experiência dos educadores. Paralelamente, os professores enfrentam grandes obstáculos para divulgar seu próprio trabalho de forma profissional e alcançar novos alunos.

## A Solução

O **ConectaPro** nasce para curar essa dor, funcionando como um hub especializado que conecta diretamente quem precisa aprender com quem sabe ensinar. O projeto centraliza os perfis dos educadores, permitindo que os clientes filtrem e encontrem o profissional ideal para sua necessidade de forma rápida e segura, profissionalizando a contratação de serviços educacionais.

## Escopo do Projeto (Primeira Versão)

- **Cadastro Especializado:** Perfis detalhados para professores (com dados de formação e área de atuação) e cadastros direcionados para clientes e instituições de ensino.
- **Busca Inteligente:** Motor de busca e filtragem segmentado por matéria e localização (CEP).
- **Perfis Públicos:** Visualização completa das credenciais, modalidades de aula e valores dos educadores.
- **Segurança:** Sistema robusto de autenticação (login/senha) e autorização para todos os usuários.

## Tecnologias e Arquitetura

### Front-end

- **React & JavaScript:** Criação da interface de usuário responsiva.
- **Tailwind CSS:** Estilização ágil por meio de classes utilitárias.
- **Vercel:** Hospedagem (Deploy) da aplicação web.

### Back-end

- **Java & Spring Boot:** Criação da API RESTful central.
- **PostgreSQL:** Banco de dados relacional com mapeamento via Spring Data JPA e Hibernate.
- **JWT & BCrypt:** Segurança de acesso via tokens e criptografia avançada de senhas.
- **Render:** Hospedagem da API e da base de dados principal.

### Integrações Externas

- **ViaCEP:** Preenchimento automático e viabilização dos filtros de endereço.
- **Mercado Pago:** Gestão de transações financeiras referentes à assinatura da plataforma.
- **AWS S3:** Armazenamento em nuvem de arquivos estáticos, documentos comprobatórios e imagens de perfil.
- **SendGrid:** Disparo automatizado de e-mails transacionais.

## Equipe de Desenvolvimento

Projeto Final de Curso (PFC) desenvolvido para obtenção do título de Bacharel em Engenharia de Software pela **Universidade de Mogi das Cruzes (UMC)**.

| Desenvolvedor          | RGM         |
| :--------------------- | :---------- |
| **Allan C D Guedes**   | 11231103501 |
| **Henrique C M Costa** | 11222100629 |
| **Victor H C Sampaio** | 11231101604 |
