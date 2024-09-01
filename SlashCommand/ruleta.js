const Discord = require("discord.js");
const Economia = require("../../Schemas/EconomiaSchema.js");
const schedule = require('node-schedule');

module.exports = {
  name: 'ruleta',
  description: 'Juega a la ruleta apostando dinero',
  type: Discord.ApplicationCommandType.ChatInput,
  options: [
    {
      name: 'color',
      description: 'Elige entre Rojo o Negro',
      type: Discord.ApplicationCommandOptionType.String,
      required: true,
      choices: [
        { name: 'Rojo', value: 'rojo' },
        { name: 'Negro', value: 'negro' }
      ]
    },
    {
      name: 'apuesta',
      description: 'Cantidad de dinero a apostar (mínimo 50€)',
      type: Discord.ApplicationCommandOptionType.Integer,
      required: true,
      min_value: 50
    }
  ],
  run: async (client, interaction) => {
    const colorElegido = interaction.options.getString('color');
    const apuesta = interaction.options.getInteger('apuesta');

    // Verificar si el usuario tiene suficiente dinero
    const usuario = await Economia.findOne({ userId: interaction.user.id });
    if (!usuario || usuario.dinero < apuesta) {
      return interaction.reply({ content: "No tienes suficiente dinero para hacer esta apuesta.", ephemeral: true });
    }

    // Crear y enviar el embed inicial
    const embedInicial = new Discord.EmbedBuilder()
      .setTitle("La ruleta está girando...")
      .setDescription("Los resultados serán revelados en 25 segundos. ¡Mucha suerte!")
      .setFooter({ text: new Date().toLocaleString() })
      .setImage("https://c.tenor.com/X6hWPXlAYGkAAAAC/tenor.gif");

    await interaction.reply({ embeds: [embedInicial] });

    // Programar la revelación del resultado
    schedule.scheduleJob(new Date(Date.now() + 25000), async () => {
      const resultado = Math.floor(Math.random() * 37); // 0-36
      const colorResultado = resultado === 0 ? 'verde' : (resultado % 2 === 0 ? 'rojo' : 'negro');
      const haGanado = colorResultado === colorElegido;

      let dineroGanado = 0;
      if (haGanado) {
        dineroGanado = apuesta;
        await Economia.updateOne({ userId: interaction.user.id }, { $inc: { dinero: dineroGanado } });
      } else {
        await Economia.updateOne({ userId: interaction.user.id }, { $inc: { dinero: -apuesta } });
      }

      const embedResultado = new Discord.EmbedBuilder()
        .setTitle("¡Resultado de la Ruleta!")
        .setDescription(haGanado 
          ? `¡La bola cayó en el color ${colorResultado} y el número ${resultado}! ¡Has ganado ${dineroGanado}€!`
          : `La bola cayó en el color ${colorResultado} y el número ${resultado}. Has perdido ${apuesta}€`)
        .setFooter({ text: new Date().toLocaleString() })
        .setColor(haGanado ? 'Green' : 'Red');

      await interaction.followUp({ embeds: [embedResultado] });
    });
  }
};