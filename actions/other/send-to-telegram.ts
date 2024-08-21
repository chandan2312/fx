//@ts-ignore
import TelegramBot from "node-telegram-bot-api";

export const sendTelegramNotification = async (message: any) => {
	const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, {
		polling: false,
	});

	const chatId = process.env.TELEGRAM_CHAT_ID;

	const { sendMessage, error } = await bot.sendMessage(chatId, message);

	if (error) {
		console.error("Error sending message:", error);
		return { error: error.message };
	} else {
		console.log("Message sent:", sendMessage);
		return { status: 200, message: sendMessage };
	}
};
