const Discord = require("discord.js")
const Economia = require("../../Schemas/EconomiaSchema.js");
const client = require('../../index.js')

module.exports = {
  name: 'deposit', 
  description: 'Deposita dinero en el banco', 
  type: Discord.ApplicationCommandType.ChatInput,
  options: [
    {
      name: 'cantidad',
      description: 'Cantidad de dinero a depositar',
      type: Discord.ApplicationCommandOptionType.Integer,
      required: true,
    }
  ],

  run: async (client, interaction) => {
    const cantidad = interaction.options.getInteger('cantidad');
    const usuario = await Economia.findOne({ userId: interaction.user.id });

    if (!usuario || usuario.dinero < cantidad) {
      return interaction.reply("No tienes suficiente dinero para depositar esa cantidad.");
    }

    await Economia.findOneAndUpdate(
      { userId: interaction.user.id },
      { $inc: { dinero: -cantidad, banco: cantidad } }
    );

    await interaction.reply(`Acabas de depositar <:moneda:1272983068675801123>${cantidad} en el Banco`);
  }
}