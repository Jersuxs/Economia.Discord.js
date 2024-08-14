const Discord = require("discord.js");
const Economia = require("../Schemas/EconomiaSchema.js");

module.exports = {
  name: 'deposit',
  aliases: ['dep'],
  description: 'Deposita dinero en el banco',
  
  async execute(message, args) {
    const cantidad = parseInt(args[0]);
    if (isNaN(cantidad)) {
      return message.reply("Por favor, proporciona una cantidad válida para depositar.");
    }

    const usuario = await Economia.findOne({ userId: message.author.id });

    if (!usuario || usuario.dinero < cantidad) {
      return message.reply("No tienes suficiente dinero para depositar esa cantidad.");
    }

    await Economia.findOneAndUpdate(
      { userId: message.author.id },
      { $inc: { dinero: -cantidad, banco: cantidad } }
    );

    await message.reply(`Acabas de depositar <:moneda:1272983068675801123>${cantidad} en el Banco`);
  }
};
