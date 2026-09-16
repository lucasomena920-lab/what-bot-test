export interface BotConfigData {
  companyName: string;
  greeting: string;
  menu: string;
  businessHours: string;
  services: string;
  humanSupport: string;
  fallback: string;
}

export const defaultBotConfig: BotConfigData = {
  companyName: "Minha empresa",

  greeting:
    "Olá! 👋 Sou o assistente automático da *{empresa}*. Digite *menu* para ver as opções.",

  menu:
    "*Menu principal*\n\n" +
    "1️⃣ Horários de atendimento\n" +
    "2️⃣ Serviços\n" +
    "3️⃣ Falar com um atendente\n\n" +
    "Digite o número da opção desejada.",

  businessHours:
    "🕒 *Horários de atendimento*\n\n" +
    "Segunda a sexta: 09:00 às 18:00\n" +
    "Sábado: 09:00 às 13:00\n" +
    "Domingo: fechado.",

  services:
    "📋 *Serviços*\n\n" +
    "• Atendimento pelo WhatsApp\n" +
    "• Informações e suporte\n" +
    "• Encaminhamento para atendente\n\n" +
    "Digite *menu* para voltar ao menu principal.",

  humanSupport:
    "👤 Certo. Sua solicitação foi marcada para atendimento humano. " +
    "Um atendente continuará a conversa assim que possível.",

  fallback:
    "Não entendi essa opção. Digite *menu* para ver as opções disponíveis."
};

// Mantém compatibilidade com o código antigo.
export const botConfig = defaultBotConfig;