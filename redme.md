WhatsApp Bot

Sistema de atendimento automatizado para WhatsApp com painel de gerenciamento, configuração de respostas e suporte a atendimento humano.

O projeto foi desenvolvido para centralizar a conexão do WhatsApp e permitir que o atendimento automático seja administrado de forma simples por meio de uma interface web.

Como o sistema funciona

O funcionamento é dividido em três partes principais:

1. Acesso ao painel

O usuário entra no sistema por meio de uma conta própria.

Após o login, o painel permite acompanhar o estado do WhatsApp, configurar o atendimento automático e visualizar contatos que estão aguardando atendimento humano.

2. Conexão com o WhatsApp

A conta do WhatsApp é vinculada ao sistema por QR Code.

Depois da conexão, o sistema mantém a sessão ativa para evitar a necessidade de escanear um novo QR Code a cada reinicialização normal da aplicação.

O painel informa o estado atual da conexão e permite desconectar a conta quando necessário.

3. Atendimento automático

Quando uma mensagem é recebida, o sistema verifica a configuração definida para aquela conta e responde de acordo com o fluxo configurado.

O atendimento pode incluir:

mensagem inicial;

menu de opções;

informações de horário;

apresentação de serviços;

respostas para opções não reconhecidas;

encaminhamento para atendimento humano.

As mensagens exibidas ao cliente podem ser alteradas diretamente pelo painel.

Atendimento humano

Quando um cliente solicita falar com uma pessoa, o atendimento automático é suspenso somente para aquele contato.

O contato passa a aparecer na área de atendimentos do painel.

Enquanto o atendimento humano estiver ativo, o bot não interfere na conversa.

Depois que o atendimento for concluído, o operador pode reativar o atendimento automático para aquele contato.

Fluxo geral

Cliente envia uma mensagem
        |
        v
Sistema recebe a mensagem
        |
        v
Verifica o estado do contato
        |
        +---- Atendimento humano ativo
        |          |
        |          v
        |     Bot não responde
        |
        v
Processa a opção enviada
        |
        +---- Opção reconhecida
        |          |
        |          v
        |     Envia a resposta configurada
        |
        +---- Solicitação de atendente
        |          |
        |          v
        |     Ativa atendimento humano
        |
        +---- Opção não reconhecida
                   |
                   v
             Envia mensagem padrão

Painel

O painel atualmente possui áreas para:

visão geral;

conexão do WhatsApp;

atendimentos;

configuração do bot.

A interface foi criada para permitir que as principais funções sejam administradas sem necessidade de editar o código.

Configuração do atendimento

Cada conta pode definir suas próprias mensagens.

Entre as configurações disponíveis estão:

identificação da empresa;

saudação;

menu;

horário de atendimento;

serviços;

mensagem de atendimento humano;

resposta padrão.

Dessa forma, o mesmo sistema pode ser adaptado para diferentes tipos de negócio.

Privacidade

O projeto foi pensado para trabalhar apenas com as informações necessárias para o funcionamento do atendimento.

O sistema não foi desenvolvido para manter uma cópia completa do histórico de conversas do WhatsApp.

Dados internos de autenticação, conexão e configuração não fazem parte deste repositório público.

Tecnologias

O projeto é desenvolvido principalmente com:

TypeScript;

Node.js;

tecnologias web para o painel.

Detalhes internos de infraestrutura, autenticação, persistência e gerenciamento de sessões foram intencionalmente omitidos desta documentação pública.

Desenvolvimento

Instale as dependências:

npm install

Execute em modo de desenvolvimento:

npm run dev

Compile o projeto:

npm run build

As configurações necessárias para execução devem ser definidas localmente no ambiente de desenvolvimento.

Arquivos contendo credenciais, configurações privadas ou dados de execução não devem ser enviados ao repositório.

Status do projeto

O projeto está em desenvolvimento.

As principais funções de conexão, configuração do bot, atendimento automático e atendimento humano já fazem parte da aplicação.

Novas funções e melhorias serão adicionadas conforme a evolução do sistema.

Uso

Este projeto deve ser utilizado de acordo com as políticas e condições aplicáveis aos serviços integrados.

As informações desta documentação descrevem apenas o funcionamento geral da aplicação. Detalhes internos considerados sensíveis não são publicados no repositório.