const Discord = require("discord.js");
const Cripto = require("../../Schemas/CriptoSchema.js");
const Economia = require("../../Schemas/EconomiaSchema.js");
const schedule = require('node-schedule');

// Función auxiliar para actualizar el precio de una moneda
function actualizarPrecio(moneda, precioActual, precioMinimo, precioMaximo) {
  const cambio = Math.random() < 0.5 ? 1 : -1;
  const cantidadCambio = Math.floor(Math.random() * 100) + 1; // Cambio entre 1 y 100
  let nuevoPrecio = precioActual + (cambio * cantidadCambio);
  
  // Asegurar que el precio esté dentro de los límites
  nuevoPrecio = Math.min(Math.max(nuevoPrecio, precioMinimo), precioMaximo);
  
  return nuevoPrecio;
}

// Función para programar la actualización de precios
async function programarActualizacion() {
  const usuarios = await Cripto.find();
  for (const usuario of usuarios) {
    const tiempoRestante = usuario.proximaActualizacion - Date.now();
    if (tiempoRestante > 0) {
      schedule.scheduleJob(Date.now() + tiempoRestante, async function() {
        usuario.RakanCoin.precio = actualizarPrecio(
          'RakanCoin',
          usuario.RakanCoin.precio,
          100,
          1000
        );

        usuario.PimulaCoin.precio = actualizarPrecio(
          'PimulaCoin',
          usuario.PimulaCoin.precio,
          1000,
          7000
        );

        usuario.FnCoin.precio = actualizarPrecio(
          'FnCoin',
          usuario.FnCoin.precio,
          5000,
          25000
        );

        usuario.ultimaActualizacion = Date.now();
        usuario.proximaActualizacion = new Date(Date.now() + 6 * 60 * 60 * 1000); // 6 horas después de la actualización
        await usuario.save();
        console.log('Precios de criptomonedas actualizados');
      });
    }
  }
}

programarActualizacion();

module.exports = {
  name: 'cripto',
  description: 'Comandos relacionados con criptomonedas',
  type: Discord.ApplicationCommandType.ChatInput,
  options: [
    {
      name: 'acciones',
      description: 'Ver acciones de una criptomoneda',
      type: Discord.ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: 'moneda',
          description: 'Elige la criptomoneda',
          type: Discord.ApplicationCommandOptionType.String,
          required: true,
          choices: [
            { name: 'RakanCoin', value: 'RakanCoin' },
            { name: 'PimulaCoin', value: 'PimulaCoin' },
            { name: 'FnCoin', value: 'FnCoin' }
          ]
        }
      ]
    },
    {
      name: 'comprar',
      description: 'Comprar criptomonedas',
      type: Discord.ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: 'moneda',
          description: 'Elige la criptomoneda',
          type: Discord.ApplicationCommandOptionType.String,
          required: true,
          choices: [
            { name: 'RakanCoin', value: 'RakanCoin' },
            { name: 'PimulaCoin', value: 'PimulaCoin' },
            { name: 'FnCoin', value: 'FnCoin' }
          ]
        },
        {
          name: 'cantidad',
          description: 'Cantidad a comprar',
          type: Discord.ApplicationCommandOptionType.Integer,
          required: true
        }
      ]
    },
    {
      name: 'vender',
      description: 'Vender criptomonedas',
      type: Discord.ApplicationCommandOptionType.Subcommand,
      options: [
        {
          name: 'moneda',
          description: 'Elige la criptomoneda',
          type: Discord.ApplicationCommandOptionType.String,
          required: true,
          choices: [
            { name: 'RakanCoin', value: 'RakanCoin' },
            { name: 'PimulaCoin', value: 'PimulaCoin' },
            { name: 'FnCoin', value: 'FnCoin' }
          ]
        },
        {
          name: 'cantidad',
          description: 'Cantidad a vender',
          type: Discord.ApplicationCommandOptionType.Integer,
          required: true
        }
      ]
    }
  ],

  run: async (client, interaction) => {
    const subcommand = interaction.options.getSubcommand();
    const moneda = interaction.options.getString('moneda');
    const cantidad = interaction.options.getInteger('cantidad');

    let usuario = await Cripto.findOne({ userId: interaction.user.id });
    if (!usuario) {
      usuario = await Cripto.create({ userId: interaction.user.id });
    }

    let economia = await Economia.findOne({ userId: interaction.user.id });
    if (!economia) {
      economia = await Economia.create({ userId: interaction.user.id });
    }

    switch (subcommand) {
      case 'acciones':
        const embed = new Discord.EmbedBuilder()
          .setTitle(`Acciones de ${moneda}`)
          .setDescription(`Las acciones de ${moneda} han **${usuario[moneda].precio > usuario[moneda].precioDefault ? 'subido' : 'bajado'}** hoy.
            Ahora mismo 1 moneda cuesta: **<:moneda:1272983068675801123>${usuario[moneda].precio}**
            La moneda por defecto costaba: **<:moneda:1272983068675801123>${usuario[moneda].precioDefault}**
            Usted tiene: **${usuario[moneda].cantidad}**`)
          .setFooter({ text: new Date().toLocaleString() });
        
        await interaction.reply({ embeds: [embed] });
        break;

      case 'comprar':
        const costoTotal = usuario[moneda].precio * cantidad;
        if (economia.dinero < costoTotal) {
          await interaction.reply('No tienes suficiente dinero para comprar estas monedas.');
          return;
        }
        
        economia.dinero -= costoTotal;
        usuario[moneda].cantidad += cantidad;
        await economia.save();
        await usuario.save();
        
        await interaction.reply(`Has comprado ${cantidad} ${moneda} por <:moneda:1272983068675801123>${costoTotal}.`);
        break;

      case 'vender':
        if (usuario[moneda].cantidad < cantidad) {
          await interaction.reply(`No tienes suficientes ${moneda} para vender.`);
          return;
        }
        
        const ganancia = usuario[moneda].precio * cantidad;
        economia.dinero += ganancia;
        usuario[moneda].cantidad -= cantidad;
        await economia.save();
        await usuario.save();
        
        await interaction.reply(`Has vendido ${cantidad} ${moneda} por <:moneda:1272983068675801123>${ganancia}.`);
        break;
    }
  }
};
