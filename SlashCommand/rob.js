const Discord = require("discord.js");
const Economia = require("../../Schemas/EconomiaSchema.js");

module.exports = {
  name: 'rob',
  description: 'Intenta robar dinero a otro usuario',
  type: Discord.ApplicationCommandType.ChatInput,
  options: [
    {
      name: 'usuario',
      description: 'Usuario al que quieres robar',
      type: Discord.ApplicationCommandOptionType.User,
      required: true
    }
  ],
  run: async (client, interaction) => {
    const usuarioObjetivo = interaction.options.getUser('usuario');
    const ladron = await Economia.findOne({ userId: interaction.user.id });
    const victima = await Economia.findOne({ userId: usuarioObjetivo.id });

    const now = Date.now();

    if (ladron && ladron.lastRob && ladron.lastRob > now - 86400000) { // 86400000 ms = 24 horas
      const timeLeft = Math.ceil((ladron.lastRob - (now - 86400000)) / 3600000);
      return interaction.reply({ content: `Debes esperar ${timeLeft} horas antes de usar este comando nuevamente.`, ephemeral: true });
    }

    if (!victima) {
      await Economia.create({ userId: usuarioObjetivo.id, dinero: 0, banco: 0 });
      return interaction.reply({ content: "Este usuario no tiene dinero para robar.", ephemeral: true });
    }

    if (victima.dinero <= 0) {
      return interaction.reply({ content: "Este usuario no tiene dinero en efectivo para robar.", ephemeral: true });
    }

    const cantidadRobada = Math.floor(victima.dinero * 0.1);

    victima.dinero -= cantidadRobada;
    if (!ladron) {
      await Economia.create({ userId: interaction.user.id, dinero: cantidadRobada, banco: 0, lastRob: now });
    } else {
      ladron.dinero += cantidadRobada;
      ladron.lastRob = now;
      await ladron.save();
    }
    await victima.save();

    await interaction.reply({ content: `Felicidades, has podido robarle a ${usuarioObjetivo.username} <:moneda:1272983068675801123>${cantidadRobada} euros.` });
  }
}
