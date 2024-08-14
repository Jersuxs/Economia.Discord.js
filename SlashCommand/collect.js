const Discord = require("discord.js");
const Economia = require("../../Schemas/EconomiaSchema.js");
const client = require('../../index.js');

module.exports = {
  name: 'collect', 
  description: 'Recoge tu sueldo basado en tus roles', 
  type: Discord.ApplicationCommandType.ChatInput,

  run: async (client, interaction) => {
    const sueldos = {
      "1255939586857763018": 1000,
      "1258774859782029374": 6000,
      "1266063375167787142": 8000,
      "1266063395715551294": 8000,
      "1258775241589526558": 6000,
      "1269243741047226450": 20000
    };

    const weeklyRoleId = "1269243741047226450";
    const weeklyInterval = 7 * 24 * 60 * 60 * 1000; // 1 week in milliseconds
    const dailyInterval = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

    let usuario = await Economia.findOne({ userId: interaction.user.id });
    if (!usuario) {
      usuario = await Economia.create({ userId: interaction.user.id, lastCollect: new Map() });
    }

    const now = Date.now();
    let totalSueldo = 0;
    let descripcion = "";

    for (const [rolId, sueldo] of Object.entries(sueldos)) {
      if (interaction.member.roles.cache.has(rolId)) {
        const lastCollectTime = usuario.lastCollect.get(rolId) || 0;
        const interval = rolId === weeklyRoleId ? weeklyInterval : dailyInterval;

        if (now - lastCollectTime >= interval) {
          totalSueldo += sueldo;
          usuario.lastCollect.set(rolId, now);
          const rol = interaction.guild.roles.cache.get(rolId);
          descripcion += `${rol.name} | <:moneda:1272983068675801123>${sueldo}\n`;
        }
      }
    }

    if (totalSueldo === 0) {
      return interaction.reply("No tienes roles que puedas cobrar en este momento.");
    }

    await Economia.findOneAndUpdate(
      { userId: interaction.user.id },
      { $inc: { dinero: totalSueldo }, $set: { lastCollect: usuario.lastCollect } },
      { upsert: true }
    );

    const embed = new Discord.EmbedBuilder()
      .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
      .setDescription(descripcion)
      .setFooter({ text: `Total recibido: <:moneda:1272983068675801123>${totalSueldo}` })
      .setColor(5814783);

    await interaction.reply({ embeds: [embed] });
  }
};