const Discord = require("discord.js")
const Economia = require("../../Schemas/EconomiaSchema.js");
const client = require('../../index.js')

module.exports = {
  name: 'bal',
  description: 'Muestra tu balance económico o el de otro usuario',
  type: Discord.ApplicationCommandType.ChatInput,
  options: [
    {
      name: 'usuario',
      description: 'Usuario del que quieres ver el balance (opcional)',
      type: Discord.ApplicationCommandOptionType.User,
      required: false
    }
  ],
  run: async (client, interaction) => {
    const usuarioObjetivo = interaction.options.getUser('usuario') || interaction.user;

    const usuario = await Economia.findOne({ userId: usuarioObjetivo.id });
    if (!usuario) {
      await Economia.create({ userId: usuarioObjetivo.id, dinero: 0, banco: 0 });
    }

    const dineroTotal = (usuario?.dinero || 0) + (usuario?.banco || 0);
    const posicion = await Economia.countDocuments({ $expr: { $gt: [{ $add: ['$dinero', '$banco'] }, dineroTotal] } }) + 1;

    const embed = new Discord.EmbedBuilder()
      .setAuthor({ name: usuarioObjetivo.username, iconURL: usuarioObjetivo.displayAvatarURL() })
      .setDescription(`Puesto en el top dinero: ${posicion}\n\n**Dinero:** \n<:moneda:1272983068675801123>${usuario?.dinero || 0}\n**Banco:**\n<:moneda:1272983068675801123>${usuario?.banco || 0}\n**Total:**\n<:moneda:1272983068675801123>${dineroTotal}`)
      .setColor(5814783);

    if (usuarioObjetivo.id !== interaction.user.id) {
      embed.setFooter({ text: `Solicitado por ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() });
    }

    await interaction.reply({ embeds: [embed] });
  }
}