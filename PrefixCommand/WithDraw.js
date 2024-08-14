const Discord = require("discord.js");
const Economia = require("../Schemas/EconomiaSchema.js");

module.exports = {
  name: 'withdraw',
  description: 'Retira dinero del banco',
  
  async execute(message, args) {
    const cantidad = parseInt(args[0]);
    if (isNaN(cantidad)) {
      return message.reply("Por favor, proporciona una cantidad válida para retirar.");
    }

    const usuario = await Economia.findOne({ userId: message.author.id });

    if (!usuario || usuario.banco < cantidad) {
      return message.reply("No tienes suficiente dinero en el banco para retirar esa cantidad.");
    }

    await Economia.findOneAndUpdate(
      { userId: message.author.id },
      { $inc: { dinero: cantidad, banco: -cantidad } }
    );

    await message.reply(`Acabas de sacar <:moneda:1272983068675801123>${cantidad} del Banco.`);
  }
};
