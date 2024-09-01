const Discord = require("discord.js");
const Economia = require("../../Schemas/EconomiaSchema.js");

module.exports = {
  name: 'crear-venta',
  description: 'Crea una nueva venta en la tienda',
  type: Discord.ApplicationCommandType.ChatInput,
  options: [
    {
      name: 'nombre',
      description: 'Nombre de la venta que vas a crear',
      type: Discord.ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: 'precio',
      description: 'Precio del objeto',
      type: Discord.ApplicationCommandOptionType.Integer,
      required: true,
    },
    {
      name: 'descripcion',
      description: 'Descripción del objeto',
      type: Discord.ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: 'dar_rol',
      description: '¿Va a dar un rol?',
      type: Discord.ApplicationCommandOptionType.String,
      required: true,
      choices: [
        { name: 'Sí', value: 'si' },
        { name: 'No', value: 'no' }
      ],
    },
    {
      name: 'rol',
      description: 'Rol que se va a dar (opcional)',
      type: Discord.ApplicationCommandOptionType.Role,
      required: false,
    }
  ],
  run: async (client, interaction) => {
    if (!interaction.member.roles.cache.has('1266070200399298674')) {
      return interaction.reply({ content: 'No tienes permiso para usar este comando.', ephemeral: true });
    }

    const nombre = interaction.options.getString('nombre');
    const precio = interaction.options.getInteger('precio');
    const descripcion = interaction.options.getString('descripcion');
    const darRol = interaction.options.getString('dar_rol');
    const rol = interaction.options.getRole('rol');

    if (darRol === 'no' && rol) {
      return interaction.reply({ content: 'No puedes poner un rol si has desactivado que te de roles', ephemeral: true });
    }

    if (darRol === 'si' && !rol) {
      return interaction.reply({ content: '¡Especifique el rol que va a dar!', ephemeral: true });
    }

    try {
      const tienda = await Economia.findOne({ userId: 'tienda' });

      if (!tienda) {
        await Economia.create({
          userId: 'tienda',
          shopItems: [{
            name: nombre,
            price: precio,
            description: descripcion,
            roleId: rol ? rol.id : null
          }]
        });
      } else {
        tienda.shopItems.push({
          name: nombre,
          price: precio,
          description: descripcion,
          roleId: rol ? rol.id : null
        });
        await tienda.save();
      }

      await interaction.reply('¡Has podido crear la venta exitosamente!');
    } catch (error) {
      console.error(error);
      await interaction.reply('Hubo un error al crear la venta. Por favor, inténtalo de nuevo.');
    }
  }
};
