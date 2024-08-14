const Discord = require("discord.js")
const Economia = require("../../Schemas/EconomiaSchema.js");
const client = require('../../index.js')

module.exports = {
  name: 'withdraw', 
  description: 'Retira dinero del banco', 
  type: Discord.ApplicationCommandType.ChatInput,
  options: [
    {
      name: 'cantidad',
      description: 'Cantidad de dinero a retirar',
      type: Discord.ApplicationCommandOptionType.Integer,
      required: true,
    }
  ],

  run: async (client, interaction) => {
    const cantidad = interaction.options.getInteger('cantidad');
    const usuario = await Economia.findOne({ userId: interaction.user.id });

    if (!usuario || usuario.banco < cantidad) {
      return interaction.reply("No tienes suficiente dinero en el banco para retirar esa cantidad.");
    }

    await Economia.findOneAndUpdate(
      { userId: interaction.user.id },
      { $inc: { dinero: cantidad, banco: -cantidad } }
    );

    await interaction.reply(`Acabas de sacar <:moneda:1272983068675801123>${cantidad} del Banco.`);
  }
}