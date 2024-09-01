const Discord = require("discord.js");
const Economia = require("../../Schemas/EconomiaSchema.js");

module.exports = {
  name: 'eliminar-venta',
  description: 'Elimina una venta de la tienda',
  type: Discord.ApplicationCommandType.ChatInput,
  options: [
    {
      name: 'nombre',
      description: 'Nombre de la venta que quieres eliminar',
      type: Discord.ApplicationCommandOptionType.String,
      required: true,
    }
  ],
  run: async (client, interaction) => {
    if (!interaction.member.roles.cache.has('1266070200399298674')) {
      return interaction.reply({ content: 'No tienes permiso para usar este comando.', ephemeral: true });
    }

    const nombreVenta = interaction.options.getString('nombre');

    try {
      const tienda = await Economia.findOne({ userId: 'tienda' });

      if (!tienda || !tienda.shopItems.some(item => item.name === nombreVenta)) {
        return interaction.reply('No se encontró una venta con ese nombre.');
      }

      tienda.shopItems = tienda.shopItems.filter(item => item.name !== nombreVenta);
      await tienda.save();

      await interaction.reply(`La venta ${nombreVenta} fue exitosamente eliminada.`);
    } catch (error) {
      console.error(error);
      await interaction.reply('Hubo un error al eliminar la venta. Por favor, inténtalo de nuevo.');
    }
  }
};
