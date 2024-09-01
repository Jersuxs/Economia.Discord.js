const Discord = require("discord.js");
const Economia = require("../../Schemas/EconomiaSchema.js");

module.exports = {
  name: 'comprar',
  description: 'Compra un objeto de la tienda',
  type: Discord.ApplicationCommandType.ChatInput,
  options: [
    {
      name: 'objeto',
      description: 'Nombre del objeto que quieres comprar',
      type: Discord.ApplicationCommandOptionType.String,
      required: true,
    }
  ],
  run: async (client, interaction) => {
    const objetoNombre = interaction.options.getString('objeto');
    
    let usuario = await Economia.findOne({ userId: interaction.user.id });
    if (!usuario) {
      usuario = await Economia.create({ userId: interaction.user.id, dinero: 0, banco: 0 });
    }

    const tienda = await Economia.findOne({ userId: 'tienda' });

    if (!tienda || !tienda.shopItems.some(item => item.name === objetoNombre)) {
      return interaction.reply('Este objeto no existe en la tienda.');
    }

    const item = tienda.shopItems.find(item => item.name === objetoNombre);

    if (usuario.dinero < item.price) {
      return interaction.reply(`Usted no tiene el dinero suficiente para comprar ${item.name}.`);
    }

    usuario.dinero -= item.price;
    await usuario.save();

    if (item.roleId) {
      const role = interaction.guild.roles.cache.get(item.roleId);
      if (role) {
        await interaction.member.roles.add(role);
      }
    }

    await interaction.reply(`Usted compró ${item.name} por <:moneda:1272983068675801123>${item.price} euros.`);
  }
};
