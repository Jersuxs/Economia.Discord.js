const Discord = require("discord.js");
const Economia = require("../Schemas/EconomiaSchema.js");

module.exports = {
  name: 'pay',
  description: 'Paga una cantidad de dinero a otro usuario',
  
  async execute(message, args) {
    const usuarioObjetivo = message.mentions.users.first();
    const cantidad = parseInt(args[1]);

    if (!usuarioObjetivo) {
      return message.reply("Por favor, menciona a un usuario válido.");
    }

    if (message.author.id === usuarioObjetivo.id) {
      return message.reply("No puedes pagarte a ti mismo.");
    }

    if (isNaN(cantidad) || cantidad <= 0) {
      return message.reply("La cantidad debe ser mayor que 0.");
    }

    let usuarioPagador = await Economia.findOne({ userId: message.author.id });
    if (!usuarioPagador) {
      usuarioPagador = await Economia.create({ userId: message.author.id, dinero: 0, banco: 0 });
    }

    const dineroTotalPagador = usuarioPagador.dinero + usuarioPagador.banco;

    if (dineroTotalPagador < cantidad) {
      return message.reply("No tienes suficiente dinero para realizar este pago.");
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

    await message.reply(`Has pagado **<:moneda:1272983068675801123>${cantidad} euros** a ${usuarioObjetivo}.`);
  }
};
