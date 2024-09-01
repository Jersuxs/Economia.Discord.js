const Discord = require("discord.js");
const Economia = require("../../Schemas/EconomiaSchema.js");

module.exports = {
  name: 'shop',
  description: 'Muestra la tienda oficial de RPHispano',
  type: Discord.ApplicationCommandType.ChatInput,
  options: [],
  run: async (client, interaction) => {
    const tienda = await Economia.findOne({ userId: 'tienda' });
    
    const embed = new Discord.EmbedBuilder()
      .setAuthor({ 
        name: interaction.guild.name, 
        iconURL: interaction.guild.iconURL() 
      })
      .setTitle('Tienda oficial de RPHispano')
      .setColor(5814783)
      .setFooter({ text: new Date().toLocaleDateString() });

    let description = '';
    if (tienda && tienda.shopItems.length > 0) {
      tienda.shopItems.forEach(item => {
        description += `**${item.name}** - <:moneda:1272983068675801123>${item.price}\n${item.description}\n\n`;
      });
    } else {
      description = 'No hay items en la tienda en este momento.';
    }

    embed.setDescription(description);

    await interaction.reply({ embeds: [embed] });
  }
};
