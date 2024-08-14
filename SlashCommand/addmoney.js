const Discord = require("discord.js")
const Economia = require("../../Schemas/EconomiaSchema.js");
const client = require('../../index.js')

module.exports = {
  name: 'add-money', 
  description: 'Añade dinero a un usuario', 
  type: Discord.ApplicationCommandType.ChatInput,
  options: [
    {
      name: 'usuario',
      description: 'Usuario al que dar dinero',
      type: Discord.ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: 'cantidad',
      description: 'Cantidad de dinero a dar',
      type: Discord.ApplicationCommandOptionType.Integer,
      required: true,
    }
  ],

  run: async (client, interaction) => {
    if (!interaction.member.permissions.has(Discord.PermissionFlagsBits.Administrator)) {
      return interaction.reply({ content: "No tienes permisos para usar este comando.", ephemeral: true });
    }

    const usuario = interaction.options.getUser('usuario');
    const cantidad = interaction.options.getInteger('cantidad');

    await Economia.findOneAndUpdate(
      { userId: usuario.id },
      { $inc: { banco: cantidad } },
      { upsert: true }
    );

    await interaction.reply(`Felicidades, has podido dar <:moneda:1272983068675801123>${cantidad} al usuario ${usuario}.`);
  }
}