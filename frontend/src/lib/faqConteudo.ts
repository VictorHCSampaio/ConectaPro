export type FaqItem = {
  pergunta: string
  resposta: string
}

export type FaqCategoria = {
  id: string
  titulo: string
  itens: FaqItem[]
}

export const FAQ_CATEGORIAS: FaqCategoria[] = [
  {
    id: 'conta',
    titulo: 'Conta e acesso',
    itens: [
      {
        pergunta: 'Como crio uma conta?',
        resposta:
          'No topo da página, clique em Cadastrar e escolha o tipo de conta. Escolha aluno se você quer encontrar professores e agendar aulas, ou professor se você quer oferecer aulas. Depois é só preencher nome, email e senha e confirmar. Contas de aluno já ficam ativas na hora. Contas de professor passam por uma análise de um administrador antes de liberar o perfil.',
      },
      {
        pergunta: 'Qual a diferença entre conta de aluno e de professor?',
        resposta:
          'A conta de aluno é gratuita e serve para buscar professores, conversar pelo chat e agendar aulas. A conta de professor serve para oferecer aulas e aparecer nas buscas, mas antes precisa ser aprovada por um administrador e ter uma assinatura ativa. Em resumo, o aluno usa a plataforma de graça e o professor mantém uma assinatura para divulgar o trabalho dele.',
      },
      {
        pergunta: 'Esqueci minha senha, o que faço?',
        resposta:
          'Na tela de login, clique em Esqueci minha senha e informe o email da sua conta. Você vai receber um email com um link temporário para criar uma senha nova. Abra o link, defina a senha e entre normalmente. Se o email não aparecer na caixa de entrada, confira também a pasta de spam.',
      },
      {
        pergunta: 'O que é o código de verificação (2FA)?',
        resposta:
          'É a verificação em duas etapas, uma camada extra de segurança para a sua conta. Durante o cadastro você vincula um aplicativo autenticador no celular, como o Google Authenticator, lendo um QR Code na tela. A partir daí, a cada login o aplicativo mostra um código de seis dígitos que muda a cada poucos segundos, e você digita esse código para confirmar que é você. Assim, mesmo que alguém descubra a sua senha, não consegue entrar sem o seu celular.',
      },
    ],
  },
  {
    id: 'professor',
    titulo: 'Sou professor',
    itens: [
      {
        pergunta: 'Por que minha conta está "em análise"?',
        resposta:
          'Toda conta de professor passa pela avaliação de um administrador antes de ser liberada, para garantir a qualidade da plataforma. Enquanto está em análise você já consegue entrar na sua conta, mas ainda não pode editar o perfil nem aparecer nas buscas. Assim que um administrador revisar os seus dados, você é aprovado ou recebe um retorno com o que precisa ajustar.',
      },
      {
        pergunta: 'Preciso enviar certificado?',
        resposta:
          'Sim, o envio do certificado é obrigatório para a análise, pois é ele que comprova a sua formação ou experiência. Caso você não tenha um certificado, não tem problema: marque a opção Não tenho certificado na tela de status do cadastro e escreva uma justificativa contando a sua experiência e o motivo de não possuir o documento. O administrador analisa essa justificativa da mesma forma que analisaria um certificado. O certificado deve ser uma imagem, nos formatos PNG ou JPG.',
      },
      {
        pergunta: 'Meu cadastro foi rejeitado, e agora?',
        resposta:
          'Quando um cadastro é rejeitado, o administrador escreve o motivo, e ele aparece para você na tela de status do cadastro. Leia com atenção o que foi pedido, faça os ajustes, envie um novo certificado ou corrija a sua justificativa, e clique em Reenviar para análise. O seu cadastro volta para a fila e será avaliado de novo, sem precisar criar outra conta.',
      },
      {
        pergunta: 'Depois de aprovado, por que preciso pagar?',
        resposta:
          'No ConectaPro, o professor é quem mantém uma assinatura para usar a plataforma, enquanto o aluno não paga nada. Por isso, depois que o seu cadastro é aprovado, o próximo passo é realizar o pagamento. Somente após a confirmação do pagamento o seu perfil é liberado para edição e você passa a aparecer nas buscas dos alunos.',
      },
      {
        pergunta: 'Como edito meu perfil, matérias e preços?',
        resposta:
          'Com a conta ativa, ou seja, aprovada e com o pagamento confirmado, acesse Meu perfil. Lá você edita a sua biografia, as matérias que leciona, as modalidades que atende (online, presencial ou as duas), o preço por hora e os horários em que está disponível. Vale caprichar na biografia e manter os horários atualizados, pois é isso que os alunos veem ao te procurar.',
      },
      {
        pergunta: 'Como funciona a foto de perfil?',
        resposta:
          'Na edição do perfil você pode enviar uma foto, que aparece para os alunos nas buscas e no seu perfil público. Use uma imagem nos formatos PNG, JPG ou WEBP. Uma foto nítida e profissional passa mais confiança e costuma atrair mais alunos.',
      },
    ],
  },
  {
    id: 'aluno',
    titulo: 'Sou aluno',
    itens: [
      {
        pergunta: 'Como encontro um professor?',
        resposta:
          'Acesse a página Professores. Lá você pode filtrar por matéria e por modalidade, online ou presencial, para ver apenas os professores que atendem o que você precisa. Cada resultado mostra a foto, as matérias, o preço por hora e as informações do professor, para você comparar com calma antes de escolher.',
      },
      {
        pergunta: 'Agendar uma aula custa dinheiro?',
        resposta:
          'Não. Para o aluno a plataforma é gratuita, e agendar uma aula funciona como uma reserva de horário, sem nenhuma cobrança pelo ConectaPro. Os detalhes sobre a aula em si você combina diretamente com o professor.',
      },
      {
        pergunta: 'Posso falar com o professor antes de agendar?',
        resposta:
          'Sim. Use o chat da plataforma para conversar com o professor antes de marcar qualquer coisa. É o canal ideal para tirar dúvidas sobre o conteúdo, combinar os detalhes da aula e confirmar a disponibilidade dele.',
      },
      {
        pergunta: 'Como vejo os horários disponíveis de um professor?',
        resposta:
          'Ao abrir o perfil de um professor, você vê os horários que ele marcou como disponíveis. Basta escolher um horário livre para fazer a sua reserva. Se tiver dúvida sobre algum horário, confirme com ele pelo chat.',
      },
      {
        pergunta: 'Qual a diferença entre aula online e presencial?',
        resposta:
          'Cada professor escolhe as modalidades que oferece. Na aula online vocês se encontram por vídeo ou pela ferramenta que combinarem. Na presencial a aula acontece pessoalmente. Na busca você vê qual modalidade cada professor atende e consegue filtrar pela que preferir.',
      },
    ],
  },
  {
    id: 'pagamento',
    titulo: 'Pagamento',
    itens: [
      {
        pergunta: 'Quem paga no ConectaPro?',
        resposta:
          'Somente o professor paga, por meio de uma assinatura que dá acesso à plataforma. O aluno não paga nada para criar conta, buscar professores, conversar ou agendar aulas. Esse modelo mantém a plataforma gratuita para quem está procurando aprender.',
      },
      {
        pergunta: 'Quais as formas de pagamento?',
        resposta:
          'O pagamento da assinatura do professor é feito pelo Mercado Pago. No momento da compra você é direcionado para o ambiente seguro do Mercado Pago, que apresenta as formas de pagamento disponíveis para você concluir.',
      },
      {
        pergunta: 'E se o pagamento for recusado?',
        resposta:
          'Se o pagamento não for aprovado, a sua conta continua com o perfil bloqueado, e você pode tentar de novo na tela de pagamento. Vale conferir os dados informados e o saldo ou limite disponível. Assim que o pagamento é confirmado, o perfil é liberado automaticamente.',
      },
    ],
  },
  {
    id: 'comunicacao',
    titulo: 'Chat e notificações',
    itens: [
      {
        pergunta: 'Como funciona o chat?',
        resposta:
          'Depois de logado, você pode conversar diretamente com professores ou alunos pelo chat da plataforma. É por ali que vocês combinam os detalhes das aulas, tiram dúvidas e mantêm todo o histórico da conversa em um só lugar.',
      },
      {
        pergunta: 'Para que serve o sininho no topo?',
        resposta:
          'O sininho mostra as suas notificações. Por ele você fica sabendo de novidades importantes, como novas mensagens no chat e mudanças no status do seu cadastro. Quando há algo novo, aparece um indicador no ícone para você não perder.',
      },
      {
        pergunta: 'Como denuncio um comportamento inadequado?',
        resposta:
          'Se você presenciar qualquer conduta inadequada, use o canal de denúncia para avisar a administração. A sua denúncia é registrada e analisada pela equipe, que toma as providências necessárias. Isso ajuda a manter a plataforma segura para todo mundo.',
      },
    ],
  },
  {
    id: 'sobre',
    titulo: 'Sobre o ConectaPro',
    itens: [
      {
        pergunta: 'O que é o ConectaPro?',
        resposta:
          'O ConectaPro é uma plataforma que conecta alunos a professores particulares. Em um só lugar, o aluno busca professores por matéria e modalidade, conversa pelo chat e agenda aulas, enquanto o professor divulga o trabalho dele e organiza os atendimentos.',
      },
      {
        pergunta: 'Como falo com o suporte?',
        resposta:
          'Para dúvidas que este assistente não conseguir resolver, entre em contato com a administração pelos canais disponíveis na plataforma. Se o assunto for uma conduta inadequada de alguém, use o canal de denúncia para que a equipe avalie o caso.',
      },
    ],
  },
]
