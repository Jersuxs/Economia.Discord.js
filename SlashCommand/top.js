const Discord = require("discord.js")
const Economia = require("../../Schemas/EconomiaSchema.js");
const client = require('../../index.js')

module.exports = {
  name: 'top', 
  description: 'Muestra el top 10 de usuarios con más dinero', 
  type: Discord.ApplicationCommandType.ChatInput,

  run: async (client, interaction) => {
    const top10 = await Economia.aggregate([
      {
        $addFields: {
          total: { $add: ["$dinero", "$banco"] }
        }
      },
      { $sort: { total: -1 } },
      { $limit: 10 }
    ]);

    let descripcion = "";
    for (let i = 0; i < top10.length; i++) {
      const user = await client.users.fetch(top10[i].userId);
      descripcion += `${i + 1}. ${user} • <:moneda:1272983068675801123>${top10[i].total}\n`;
    }

    const embed = new Discord.EmbedBuilder()
      .setTitle("Top 10 - Usuarios más ricos")
      .setDescription(descripcion)
      .setColor(5814783);

    await interaction.reply({ embeds: [embed] });
  }
}