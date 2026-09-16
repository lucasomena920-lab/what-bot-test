 WhatsApp Bot

Atendimento automatizado com painel web e encaminhamento para atendimento humano.

Sistema desenvolvido para centralizar a conexão com o WhatsApp e administrar respostas automáticas em uma interface web. Cada conta pode configurar suas mensagens e acompanhar os contatos que precisam de atendimento humano.

Status: em desenvolvimento · Tecnologias: TypeScript e Node.js

⚠️ Atenção — alterações necessárias

[!WARNING]
A integração atual utiliza Baileys, com conexão por QR Code. A substituição pela API oficial do WhatsApp Business (Cloud API) é uma pendência do projeto e ainda não foi implementada.

Essa migração deve ser tratada como uma etapa necessária antes da disponibilização comercial do sistema. O funcionamento descrito neste README corresponde à versão atual.

Pendências da migração

Substituir a integração com Baileys pela API oficial.

Adaptar a conexão e a autenticação ao novo modelo de integração.

Ajustar o recebimento e o envio de mensagens.

Atualizar os estados de conexão e as orientações do painel.

Validar os fluxos automáticos e a transição para atendimento humano.

Revisar a configuração do ambiente e atualizar a documentação.

Funcionalidades

Recurso

O que faz

Acesso por conta

Permite entrar no painel com uma conta própria.

Conexão com o WhatsApp

Vincula a conta por QR Code na integração atual.

Estado da conexão

Exibe a situação do WhatsApp e permite desconectar a conta.

Respostas automáticas

Processa as mensagens conforme o fluxo configurado.

Configuração pelo painel

Permite editar as mensagens sem alterar o código.

Atendimento humano

Suspende o bot para um contato enquanto ele recebe atendimento.

Retomada do bot

Permite reativar as respostas automáticas após o atendimento humano.

Como funciona

1. Acesso ao painel

Após o login, o usuário pode acompanhar a conexão do WhatsApp, configurar as respostas e visualizar os contatos que aguardam atendimento humano.

2. Conexão com o WhatsApp

Na versão atual, a conexão é feita por QR Code. O sistema mantém os dados da sessão para reutilizá-la em reinicializações normais da aplicação, enquanto a sessão permanecer válida.

O painel informa o estado da conexão e permite desconectar a conta quando necessário.

3. Atendimento automático

Ao receber uma mensagem, o sistema verifica o estado do contato e as configurações da conta. Se o atendimento automático estiver ativo, processa a opção enviada e responde de acordo com o fluxo definido.

O fluxo pode incluir saudação, menu de opções, horário de atendimento, apresentação de serviços, resposta padrão e encaminhamento para uma pessoa.

Atendimento humano

Quando o cliente solicita um atendente, o bot suspende as respostas automáticas somente para aquele contato, que passa a aparecer na área de atendimentos do painel.

Enquanto o atendimento humano estiver ativo, o bot não responde à conversa. Ao concluir o atendimento, o operador pode reativar a automação para esse contato.

Regras do fluxo

Situação ao receber uma mensagem

Comportamento do sistema

Atendimento humano já está ativo

Mantém o bot suspenso para o contato.

Cliente solicita um atendente, com o bot ativo

Ativa o atendimento humano e suspende a automação para o contato.

Cliente envia uma opção reconhecida, com o bot ativo

Envia a resposta configurada.

Cliente envia uma opção não reconhecida, com o bot ativo

Envia a mensagem padrão.

Painel de gerenciamento

O painel reúne as principais operações em quatro áreas:

Visão geral: acompanhamento do sistema.

Conexão do WhatsApp: vinculação da conta e consulta do estado da conexão.

Atendimentos: acompanhamento dos contatos em atendimento humano.

Configuração do bot: personalização das mensagens e do fluxo automático.

Personalização do atendimento

Cada conta pode configurar as mensagens conforme as necessidades do negócio:

Configuração

Finalidade

Identificação da empresa

Apresentar o negócio ao cliente.

Saudação

Definir a mensagem inicial.

Menu

Apresentar as opções de atendimento.

Horário de atendimento

Informar os horários do negócio.

Serviços

Apresentar os serviços disponíveis.

Mensagem de atendimento humano

Orientar o cliente ao solicitar um atendente.

Resposta padrão

Responder às opções não reconhecidas.

Tecnologias

TypeScript: desenvolvimento da aplicação.

Node.js: execução do servidor.

Tecnologias web: interface do painel de gerenciamento.

Baileys: integração atual com o WhatsApp, com substituição planejada pela API oficial.

Desenvolvimento local

Pré-requisitos

Node.js e npm instalados.

Configurações locais e serviços exigidos pela aplicação preparados.

[!NOTE]
Os comandos abaixo cobrem instalação, desenvolvimento e compilação. A aplicação também depende da configuração local do ambiente; este README não detalha todas as variáveis e etapas de infraestrutura.

Instalar dependências

npm install

Executar em desenvolvimento

npm run dev

Compilar o projeto

npm run build

Privacidade e dados locais

O projeto foi pensado para utilizar as informações necessárias ao atendimento. Não foi desenvolvido para manter uma cópia completa do histórico de conversas do WhatsApp.

Credenciais, tokens, arquivos de sessão, configurações privadas e dados de execução devem permanecer fora do repositório. As configurações necessárias devem ser definidas no ambiente local.

Esta documentação apresenta o funcionamento geral do sistema, sem incluir valores de credenciais ou configurações privadas.

Status do projeto

As funcionalidades descritas para a versão atual incluem:

Conexão com o WhatsApp por QR Code usando Baileys.

Configuração das mensagens pelo painel.

Atendimento automático conforme o fluxo definido.

Encaminhamento para atendimento humano por contato.

Reativação do bot após o atendimento humano.

Migração para a API oficial do WhatsApp Business.

O sistema segue em desenvolvimento. Novas funcionalidades e melhorias serão adicionadas conforme a evolução do projeto.

Uso

O uso do sistema deve respeitar as políticas e condições dos serviços integrados. A existência das funcionalidades descritas não representa uma declaração de que o projeto está pronto para produção.
