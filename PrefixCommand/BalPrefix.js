const Discord = require("discord.js");
const Economia = require("../Schemas/EconomiaSchema.js");

module.exports = {
  name: 'bal',
  description: 'Muestra tu balance económico o el de otro usuario',
  
  async execute(message, args) {
    const usuarioObjetivo = message.mentions.users.first() || message.author;

    let usuario = await Economia.findOne({ userId: usuarioObjetivo.id });
    if (!usuario) {
      usuario = await Economia.create({ userId: usuarioObjetivo.id, dinero: 0, banco: 0 });
    }

    const dineroTotal = (usuario.dinero || 0) + (usuario.banco || 0);
    const posicion = await Economia.countDocuments({ $expr: { $gt: [{ $add: ['$dinero', '$banco'] }, dineroTotal] } }) + 1;

    const embed = new Discord.EmbedBuilder()
      .setAuthor({ name: usuarioObjetivo.username, iconURL: usuarioObjetivo.displayAvatarURL() })
      .setDescription(`Puesto en el top dinero: ${posicion}\n\n**Dinero:** \n<:moneda:1272983068675801123>${usuario.dinero || 0}\n**Banco:**\n<:moneda:1272983068675801123>${usuario.banco || 0}\n**Total:**\n<:moneda:1272983068675801123>${dineroTotal}`)
      .setColor(5814783);

    if (usuarioObjetivo.id !== message.author.id) {
      embed.setFooter({ text: `Solicitado por ${message.author.username}`, iconURL: message.author.displayAvatarURL() });
    }

    await message.channel.send({ embeds: [embed] });
  }
};