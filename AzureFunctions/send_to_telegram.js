const { app } = require('@azure/functions');

const chatId = process.env["TelegramChatId"];
const token = process.env["TelegramToken"];

app.eventGrid('send_to_telegram', {
    handler: async (event, context) => {
        context.log('Event grid function processed event:', event);

        let telegramResults;
        if (event.eventType == "Microsoft.Devices.DeviceDisconnected") {
            telegramResults = await fetch(`https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatId}&text=${event.data.deviceId} was disconnected!`);
        }

        else if (event.eventType == "Microsoft.Devices.DeviceConnected") {
            telegramResults = await fetch(`https://api.telegram.org/bot${token}/sendMessage?chat_id=${chatId}&text=${event.data.deviceId} has connected`);
        }

        if (telegramResults.status === 200) {
            context.log("R: ", telegramResults)
        }
    },
});