const Discord = require("discord.js")
const Economia = require("../../Schemas/EconomiaSchema.js");
const client = require('../../index.js')

module.exports = {
  name: 'work', 
  description: 'Trabaja para ganar dinero', 
  type: Discord.ApplicationCommandType.ChatInput,

  run: async (client, interaction) => {
    const usuario = await Economia.findOne({ userId: interaction.user.id });
    if (!usuario) {
      await Economia.create({ userId: interaction.user.id, dinero: 0, banco: 0, lastWork: 0 });
    }

    const ahora = Date.now();
    const cooldown = 4 * 60 * 60 * 1000; // 4 horas en milisegundos

    if (usuario.lastWork && ahora - usuario.lastWork < cooldown) {
      const tiempoRestante = cooldown - (ahora - usuario.lastWork);
      const horas = Math.floor(tiempoRestante / 3600000);
      const minutos = Math.floor((tiempoRestante % 3600000) / 60000);
      return interaction.reply(`No puedes trabajar dentro de: ${horas}h ${minutos}m`);
    }

    const trabajos = [
      "Usted sacastes a los perros y recojistes sus cacas. Esto te genero <:moneda:1272983068675801123>{dinero} euros.",
      "Usted programo un bot de Discord, se hizo famoso y gano <:moneda:1272983068675801123>{dinero} euros.",
      "Usted creo un servidor RP, se hizo bastante famoso y es de los mejores (RP Hispano) y ganastes <:moneda:1272983068675801123>{dinero} euros.",
      "Pedistes dinero por la calle y ganastes <:moneda:1272983068675801123>{dinero} euros.",
      "Trabajastes como presidente del Betis pero te despidieron 2 segundos después, ganastes: <:moneda:1272983068675801123>{dinero} euros.",
      "Trabajastes de limpiador de cristales y ganastes <:moneda:1272983068675801123>{dinero} euros.",
      "Trabajastes de limpiador de baños y ganastes: <:moneda:1272983068675801123>{dinero} euros.",
      "Fuistes a apostar 20k pero te quedastes sin nada y apenas ganastes: <:moneda:1272983068675801123>{dinero} euros.",
      "Trabajo de limpiador de vehículos y gano: <:moneda:1272983068675801123>{dinero} euros.",
      "Has sido staff de RPHispano y Paublox como le distes pena te dio: <:moneda:1272983068675801123>{dinero} euros."
    ];

    const dineroGanado = Math.floor(Math.random() * 101) + 100; // Entre 100 y 200
    const trabajoElegido = trabajos[Math.floor(Math.random() * trabajos.length)].replace('{dinero}', dineroGanado);

    await Economia.findOneAndUpdate(
      { userId: interaction.user.id },
      { $inc: { dinero: dineroGanado }, $set: { lastWork: ahora } },
      { upsert: true }
    );

    const embed = new Discord.EmbedBuilder()
      .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
      .setDescription(trabajoElegido)
      .setColor(5814783);

    await interaction.reply({ embeds: [embed] });
  }
}