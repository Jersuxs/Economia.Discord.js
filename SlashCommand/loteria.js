const Discord = require("discord.js");
const Economia = require("../../Schemas/EconomiaSchema.js");

module.exports = {
  name: 'loteria', 
  description: 'Inicia una nueva lotería', 
  type: Discord.ApplicationCommandType.ChatInput,
  options: [
    {
      name: 'premio',
      description: 'Cantidad de dinero para el premio',
      type: Discord.ApplicationCommandOptionType.Integer,
      required: true,
    },
    {
      name: 'canal',
      description: 'Canal donde se anunciará la lotería',
      type: Discord.ApplicationCommandOptionType.Channel,
      required: true,
    }
  ],

  run: async (client, interaction) => {

    const premio = interaction.options.getInteger('premio');
    const canal = interaction.options.getChannel('canal');

    // Verificar que el premio sea al menos 1000 euros
    if (premio < 1000) {
      return interaction.reply({ content: '¡Tienes que poner mínimo 1.000 o más euros!', ephemeral: true });
    }

    const embed = new Discord.EmbedBuilder()
      .setTitle('¡Nueva Lotería!')
      .setDescription(`Participa en la lotería comprando un décimo por 100€. ¡El premio actual es de ${premio}€ en efectivo! Reacciona al 💰 para participar en la lotería.`)
      .setColor(0x00ff00);

    const message = await canal.send({ embeds: [embed] });
    await message.react('💰');

    const filter = (reaction, user) => {
      return reaction.emoji.name === '💰' && !user.bot;
    };

    const collector = message.createReactionCollector({ filter, time: 86400000 }); // 24 horas

    const participantes = new Set();

    collector.on('collect', async (reaction, user) => {
      const economiaUsuario = await Economia.findOne({ userId: user.id });
      if (!economiaUsuario || economiaUsuario.dinero < 100) {
        user.send('No tienes suficiente dinero para participar en la lotería.');
        reaction.users.remove(user);
        return;
      }

      economiaUsuario.dinero -= 100;
      await economiaUsuario.save();
      participantes.add(user.id);
    });

    collector.on('remove', async (reaction, user) => {
      if (participantes.has(user.id)) {
        const economiaUsuario = await Economia.findOne({ userId: user.id });
        economiaUsuario.dinero += 100;
        await economiaUsuario.save();
        participantes.delete(user.id);
      }
    });

    collector.on('end', async () => {
      if (participantes.size === 0) {
        canal.send('La lotería ha terminado sin participantes.');
        return;
      }

      const ganadorId = Array.from(participantes)[Math.floor(Math.random() * participantes.size)];
      const ganador = await interaction.client.users.fetch(ganadorId);

      const economiaGanador = await Economia.findOne({ userId: ganadorId });
      economiaGanador.dinero += premio;
      await economiaGanador.save();

      canal.send(`¡Enhorabuena ${ganador}! Has ganado la lotería de ${premio} euros.`);
    });

    interaction.reply({ content: 'Lotería iniciada con éxito.', ephemeral: true });
  },
};
