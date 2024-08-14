const Discord = require("discord.js")
const Economia = require("../../Schemas/EconomiaSchema.js");
const client = require('../../index.js')

module.exports = {
  name: 'quitar-dinero',
  description: 'Quita una cantidad de dinero a un usuario',
  type: Discord.ApplicationCommandType.ChatInput,
  options: [
    {
      name: 'usuario',
      description: 'Usuario al que quieres quitar dinero',
      type: Discord.ApplicationCommandOptionType.User,
      required: true
    },
    {
      name: 'cantidad',
      description: 'Cantidad de dinero que quieres quitar',
      type: Discord.ApplicationCommandOptionType.Integer,
      required: true
    }
  ],
  run: async (client, interaction) => {
    if (!interaction.member.permissions.has(Discord.PermissionFlagsBits.Administrator)) {
      return interaction.reply({ content: "No tienes permisos para usar este comando.", ephemeral: true });
    }

    const usuarioObjetivo = interaction.options.getUser('usuario');
    const cantidad = interaction.options.getInteger('cantidad');

    if (cantidad <= 0) {
      return interaction.reply({ content: "La cantidad debe ser mayor que 0.", ephemeral: true });
    }

    const usuarioEconomia = await Economia.findOne({ userId: usuarioObjetivo.id });

    if (!usuarioEconomia) {
      await Economia.create({ userId: usuarioObjetivo.id, dinero: 0, banco: 0 });
      return interaction.reply({ content: "Este usuario no tiene dinero para quitar.", ephemeral: true });
    }

    const dineroTotal = usuarioEconomia.dinero + usuarioEconomia.banco;

    if (dineroTotal < cantidad) {
      return interaction.reply({ content: "El usuario no tiene suficiente dinero para quitar esa cantidad.", ephemeral: true });
    }

    // Quitar primero del dinero en mano
    if (usuarioEconomia.dinero >= cantidad) {
      usuarioEconomia.dinero -= cantidad;
    } else {
      const restante = cantidad - usuarioEconomia.dinero;
      usuarioEconomia.dinero = 0;
      usuarioEconomia.banco -= restante;
    }

    await usuarioEconomia.save();

    await interaction.reply({ content: `Se le ha quitado al usuario ${usuarioObjetivo} **<:moneda:1272983068675801123>${cantidad} euros.**` });
  }
}