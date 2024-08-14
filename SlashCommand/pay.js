const Discord = require("discord.js")
const Economia = require("../../Schemas/EconomiaSchema.js");
const client = require('../../index.js')

module.exports = {
  name: 'pay',
  description: 'Paga una cantidad de dinero a otro usuario',
  type: Discord.ApplicationCommandType.ChatInput,
  options: [
    {
      name: 'usuario',
      description: 'Usuario al que quieres pagar',
      type: Discord.ApplicationCommandOptionType.User,
      required: true
    },
    {
      name: 'cantidad',
      description: 'Cantidad de dinero que quieres pagar',
      type: Discord.ApplicationCommandOptionType.Integer,
      required: true
    }
  ],
  run: async (client, interaction) => {
    const usuarioObjetivo = interaction.options.getUser('usuario');
    const cantidad = interaction.options.getInteger('cantidad');

    if (interaction.user.id === usuarioObjetivo.id) {
      return interaction.reply({ content: "No puedes pagarte a ti mismo.", ephemeral: true });
    }

    if (cantidad <= 0) {
      return interaction.reply({ content: "La cantidad debe ser mayor que 0.", ephemeral: true });
    }

    let usuarioPagador = await Economia.findOne({ userId: interaction.user.id });
    if (!usuarioPagador) {
      usuarioPagador = await Economia.create({ userId: interaction.user.id, dinero: 0, banco: 0 });
    }

    const dineroTotalPagador = usuarioPagador.dinero + usuarioPagador.banco;

    if (dineroTotalPagador < cantidad) {
      return interaction.reply({ content: "No tienes suficiente dinero para realizar este pago.", ephemeral: true });
    }

    let usuarioReceptor = await Economia.findOne({ userId: usuarioObjetivo.id });
    if (!usuarioReceptor) {
      usuarioReceptor = await Economia.create({ userId: usuarioObjetivo.id, dinero: 0, banco: 0 });
    }

    // Realizar la transacción
    if (usuarioPagador.dinero >= cantidad) {
      usuarioPagador.dinero -= cantidad;
    } else {
      const restante = cantidad - usuarioPagador.dinero;
      usuarioPagador.dinero = 0;
      usuarioPagador.banco -= restante;
    }

    usuarioReceptor.dinero += cantidad;

    await usuarioPagador.save();
    await usuarioReceptor.save();

    await interaction.reply({ content: `Has pagado **<:moneda:1272983068675801123>${cantidad} euros** a ${usuarioObjetivo}.` });
  }
}