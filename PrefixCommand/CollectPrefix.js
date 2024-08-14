const Discord = require("discord.js");
const Economia = require("../Schemas/EconomiaSchema.js");

module.exports = {
  name: 'collect',
  description: 'Recoge tu sueldo basado en tus roles',
  
  async execute(message, args) {
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

    let usuario = await Economia.findOne({ userId: message.author.id });
    if (!usuario) {
      usuario = await Economia.create({ userId: message.author.id, lastCollect: new Map() });
    }

    const now = Date.now();
    let totalSueldo = 0;
    let descripcion = "";

    for (const [rolId, sueldo] of Object.entries(sueldos)) {
      if (message.member.roles.cache.has(rolId)) {
        const lastCollectTime = usuario.lastCollect.get(rolId) || 0;
        const interval = rolId === weeklyRoleId ? weeklyInterval : dailyInterval;

        if (now - lastCollectTime >= interval) {
          totalSueldo += sueldo;
          usuario.lastCollect.set(rolId, now);
          const rol = message.guild.roles.cache.get(rolId);
          descripcion += `${rol.name} | <:moneda:1272983068675801123>${sueldo}\n`;
        }
      }
    }

    if (totalSueldo === 0) {
      return message.reply("No tienes roles que puedas cobrar en este momento.");
    }

    await Economia.findOneAndUpdate(
      { userId: message.author.id },
      { $inc: { dinero: totalSueldo }, $set: { lastCollect: usuario.lastCollect } },
      { upsert: true }
    );

    const embed = new Discord.MessageEmbed()
      .setAuthor(message.author.username, message.author.displayAvatarURL())
      .setDescription(descripcion)
      .setFooter(`Total recibido: <:moneda:1272983068675801123>${totalSueldo}`)
      .setColor(5814783);

    await message.channel.send({ embeds: [embed] });
  }
};
