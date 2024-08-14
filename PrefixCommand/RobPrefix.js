const Discord = require("discord.js");
const Economia = require("../Schemas/EconomiaSchema.js");

module.exports = {
  name: 'rob',
  description: 'Intenta robar dinero a otro usuario',
  async execute(message, args) {
    const usuarioObjetivo = message.mentions.users.first();
    if (!usuarioObjetivo) {
      return message.reply('Por favor, menciona a un usuario al que quieras robar.');
    }

    const ladron = await Economia.findOne({ userId: message.author.id });
    const victima = await Economia.findOne({ userId: usuarioObjetivo.id });

    const now = Date.now();

    if (ladron && ladron.lastRob && ladron.lastRob > now - 86400000) { // 86400000 ms = 24 horas
      const timeLeft = Math.ceil((ladron.lastRob - (now - 86400000)) / 3600000);
      return message.reply(`Debes esperar ${timeLeft} horas antes de usar este comando nuevamente.`);
    }

    if (!victima) {
      await Economia.create({ userId: usuarioObjetivo.id, dinero: 0, banco: 0 });
      return message.reply("Este usuario no tiene dinero para robar.");
    }

    if (victima.dinero <= 0) {
      return message.reply("Este usuario no tiene dinero en efectivo para robar.");
    }

    const cantidadRobada = Math.floor(victima.dinero * 0.1);

    victima.dinero -= cantidadRobada;
    if (!ladron) {
      await Economia.create({ userId: message.author.id, dinero: cantidadRobada, banco: 0, lastRob: now });
    } else {
      ladron.dinero += cantidadRobada;
      ladron.lastRob = now;
      await ladron.save();
    }
    await victima.save();

    await message.reply(`Felicidades, has podido robarle a ${usuarioObjetivo.username} <:moneda:1272983068675801123>${cantidadRobada} euros.`);
  }
};
