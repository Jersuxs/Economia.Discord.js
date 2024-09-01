const Discord = require("discord.js");
const schedule = require('node-schedule');
const Prestamo = require("../../Schemas/PrestamoSchema.js");

module.exports = {
  name: 'prestamo', 
  description: 'Solicitar un préstamo', 
  type: Discord.ApplicationCommandType.ChatInput,
  options: [
    {
      name: 'dinero',
      description: 'Cantidad de dinero que desea solicitar',
      type: Discord.ApplicationCommandOptionType.Integer,
      required: true,
    },
    {
      name: 'razon',
      description: 'Razón del préstamo',
      type: Discord.ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: 'acepta_intereses',
      description: '¿Acepta que tendrá que pagar intereses?',
      type: Discord.ApplicationCommandOptionType.Boolean,
      required: true,
    }
  ],
  run: async (client, interaction) => {
    const dinero = interaction.options.getInteger('dinero');
    const razon = interaction.options.getString('razon');
    const aceptaIntereses = interaction.options.getBoolean('acepta_intereses');

    const canalPrestamosId = 'ID DEL CANAL DONDE SE ENVIARA LA SOLICITUD DE PRESTAMO';
    const canalPrestamos = client.channels.cache.get(canalPrestamosId);

    if (!canalPrestamos) {
      return await interaction.reply({ content: 'No se pudo encontrar el canal de préstamos.', ephemeral: true });
    }

    const embed = new Discord.EmbedBuilder()
      .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
      .setTitle('**Petición de préstamo**')
      .setDescription(`__Solicitud de ${interaction.user}__
**Dinero que pide el usuario:**
${dinero}
**Razón del préstamo:**
${razon}
**¿Está de acuerdo con los intereses?**
${aceptaIntereses ? 'Sí' : 'No'}`)
      .setFooter({ text: new Date().toLocaleString() });

    const row = new Discord.ActionRowBuilder()
      .addComponents(
        new Discord.ButtonBuilder()
          .setCustomId(`aceptar_${interaction.user.id}_${dinero}`)
          .setLabel('✔ Aceptar')
          .setStyle(Discord.ButtonStyle.Success),
        new Discord.ButtonBuilder()
          .setCustomId(`rechazar_${interaction.user.id}_${dinero}`)
          .setLabel('❌ Rechazar')
          .setStyle(Discord.ButtonStyle.Danger)
      );

    await canalPrestamos.send({ embeds: [embed], components: [row] });
    await interaction.reply({ content: 'Su solicitud de préstamo ha sido enviada.', ephemeral: true });
  }
};

// Manejador de botones
async function handleButton(interaction) {
  if (!interaction.isButton()) return;

  const [action, userId, dinero] = interaction.customId.split('_');
  if (action !== 'aceptar' && action !== 'rechazar') return;

  const requester = await interaction.client.users.fetch(userId);

  if (action === 'aceptar') {
    const dineroConIntereses = parseFloat(dinero) * 1.0755;
    const fechaVencimiento = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    
    try {
      await requester.send(`**Su petición de préstamo fue aceptada**
Usted pidió: ${dinero} euros.
Usted deberá pagar: ${dineroConIntereses.toFixed(2)} euros.
Tiene un plazo para pagar hasta: <t:${Math.floor(fechaVencimiento.getTime() / 1000)}:F>`);
    } catch (error) {
      console.error('No se pudo enviar DM al usuario:', error);
      await interaction.reply({ content: `No se pudo enviar un mensaje directo a ${requester}. Por favor, asegúrese de tener los mensajes directos habilitados.`, ephemeral: true });
    }

    const nuevoPrestamo = new Prestamo({
      userId: requester.id,
      dinero: parseFloat(dinero),
      dineroConIntereses: dineroConIntereses,
      fechaVencimiento: fechaVencimiento
    });
    await nuevoPrestamo.save();

    scheduleReminderMessages(interaction.client, requester.id, dineroConIntereses, fechaVencimiento);

  } else if (action === 'rechazar') {
    try {
      await requester.send(`Lo siento mucho, su petición de préstamo fue denegada.`);
    } catch (error) {
      console.error('No se pudo enviar DM al usuario:', error);
      await interaction.reply({ content: `No se pudo enviar un mensaje directo a ${requester}. Por favor, asegúrese de tener los mensajes directos habilitados.`, ephemeral: true });
    }
  }

  await interaction.update({ content: `Préstamo ${action === 'aceptar' ? 'aceptado' : 'rechazado'} exitosamente.`, components: [] });
}

function scheduleReminderMessages(client, userId, dineroConIntereses, fechaVencimiento) {
  const reminders = [
    { days: 25, message: 'Le faltan 25 días para pagar su préstamo, por favor, si lo paga abra un ticket e infórmelo.' },
    { days: 15, message: 'Le faltan 15 días para pagar su préstamo, por favor, si lo paga abra un ticket e infórmelo.' },
    { days: 5, message: 'Le faltan 5 días para pagar su préstamo, por favor, si lo paga abra un ticket e infórmelo.' },
    { days: 1, message: ':red_circle: Queda un día para que expire su préstamo, por favor páguelo, si lo paga abra un ticket e infórmelo.' },
  ];

  reminders.forEach(reminder => {
    const reminderDate = new Date(fechaVencimiento.getTime() - reminder.days * 24 * 60 * 60 * 1000);
    schedule.scheduleJob(reminderDate, async function() {
      try {
        const user = await client.users.fetch(userId);
        await user.send(reminder.message);
      } catch (error) {
        console.error(`No se pudo enviar recordatorio a ${userId}:`, error);
      }
    });
  });

  // Programar avisos en el canal de préstamos
  for (let i = 3; i > 0; i--) {
    const avisoDate = new Date(fechaVencimiento.getTime() - i * 24 * 60 * 60 * 1000);
    schedule.scheduleJob(avisoDate, async function() {
      const canalPrestamos = await client.channels.fetch('ID DEL CANAL DONDE SE ENVIARA CUANDO FALTA POCO PARA QUE EXPIRE EL PRESTAMO');
      const user = await client.users.fetch(userId);
      await canalPrestamos.send(`El usuario ${user} le faltan ${i} días para que expire su préstamo.`);
    });
  }

  // Programar aviso de caducidad
  schedule.scheduleJob(fechaVencimiento, async function() {
    const canalPrestamos = await client.channels.fetch('ID DEL CANAL DONDE SE ENVIARA CUANDO UN PRESTAMO NO SE A PAGADO EN EL MES');
    const user = await client.users.fetch(userId);
    await canalPrestamos.send(`<@1269244893855748211>, el préstamo de ${user} ha caducado.`);
  });
}

module.exports.handleButton = handleButton;
