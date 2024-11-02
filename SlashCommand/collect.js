const Discord = require("discord.js");
const Economia = require("../../Schemas/EconomiaSchema.js");
const schedule = require('node-schedule');

module.exports = {
  name: 'collect',
  description: 'Recolecta tu salario basado en tus roles',
  type: Discord.ApplicationCommandType.ChatInput,
  run: async (client, interaction) => {
    const member = interaction.member;
    let usuario = await Economia.findOne({ guildId: interaction.guild.id, userId: member.id });
    if (!usuario) {
      usuario = await Economia.create({ guildId: interaction.guild.id, userId: member.id, dinero: 0, banco: 0 });
    }

    const rolesSalarios = [
      { id: "ID DEL ROL", salario: 0 },
      { id: "ID DEL ROL", salario: 0 },
      { id: "ID DEL ROL", salario: 0 },
      { id: "ID DEL ROL", salario: 0 },
      { id: "ID DEL ROL", salario: 0 },
      { id: "ID DEL ROL", salario: 0 } // Rol semanal
    ];

    let totalGanado = 0;
    const rolesActivos = [];

    for (const roleSalario of rolesSalarios) {
      if (member.roles.cache.has(roleSalario.id)) {
        const lastCollect = usuario.lastCollect.get(roleSalario.id) || new Date(0);
        const tiempoTranscurrido = new Date() - lastCollect;

        let puedeColectar = false;
        if (roleSalario.id === "ID ROL SEMANAL") { // Rol semanal
          puedeColectar = tiempoTranscurrido >= 7 * 24 * 60 * 60 * 1000;
        } else { // Roles de 24 horas
          puedeColectar = tiempoTranscurrido >= 24 * 60 * 60 * 1000;
        }

        if (puedeColectar) {
          totalGanado += roleSalario.salario;
          rolesActivos.push({ nombre: member.guild.roles.cache.get(roleSalario.id).name, salario: roleSalario.salario });
          usuario.lastCollect.set(roleSalario.id, new Date());
        }
      }
    }

    if (totalGanado > 0) {
      usuario.dinero += totalGanado;
      await usuario.save();

      const embed = new Discord.EmbedBuilder()
        .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
        .setDescription(rolesActivos.map(rol => `${rol.nombre} | ${rol.salario} monedas`).join('\n'))
        .setColor(5814783);

      await interaction.reply({ embeds: [embed] });
    } else {
      await interaction.reply({ content: "No tienes roles que te permitan recolectar en este momento o ya has recolectado recientemente.", ephemeral: true });
    }
  }
};

// Programar la tarea para resetear los tiempos de recolección cada 24 horas
schedule.scheduleJob('0 0 * * *', async () => {
  const usuarios = await Economia.find();
  for (const usuario of usuarios) {
    for (const [rolId, _] of usuario.lastCollect) {
      if (rolId !== "ID DEL ROL SEMANAL") { // No resetear el rol semanal
        usuario.lastCollect.set(rolId, new Date(0));
      }
    }
    await usuario.save();
  }
});