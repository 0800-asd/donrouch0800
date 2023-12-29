const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');
const { decode } = require('jsonwebtoken'); // Esta línea puede ser eliminada si no vas a decodificar JWTs
const path = require('path'); // Esta línea importa el módulo path
const fs = require('fs');
const { AttachmentBuilder } = require('discord.js');

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

const commands = [
  new SlashCommandBuilder()
    .setName('teleconsulta')
    .setDescription('Consulta los datos de un pj.')
    // .addNumberOption(option =>
    //   option.setName('documento_id')
    //     .setDescription('ID del tipo de documento.')
    //     .setRequired(true))
    .addStringOption(option =>
      option.setName('sexo')
        .setDescription('M o F.')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('nro_documento')
        .setDescription('El número de documento de la persona.')
        .setRequired(true)),
].map(command => command.toJSON());

// Asegúrate de reemplazar esto con tu token real de bot
// const rest = new REST({ version: '10' }).setToken('MTE4Njg5MTE0NDcyNzEwOTcyMg.GTlkhX.n-HX5qZKyD-jcLxjWihNXzgpJtDaCo-5OBvMZw');
const rest = new REST({ version: '10' }).setToken('MTE5MDM0OTgyMDUwMjc0NTI5MA.G7ZoPk.CbpoACPRX_IhpwoMwxak7mT0tOJeTBpGnX3D1k');

client.once('ready', async () => {
  console.log('¡El bot está listo!');

  const guildIds = ['1190348545082011758']; // Agrega el ID del segundo servidor aquí

  try {
    console.log('Comenzando la actualización de comandos (/) de la aplicación.');

    for (const guildId of guildIds) {
      await rest.put(
        Routes.applicationGuildCommands(client.user.id, guildId),
        { body: commands },
      );
      console.log(`Comandos de aplicación (/) recargados exitosamente para el servidor ${guildId}.`);
    }

    // await rest.put(
    //   Routes.applicationGuildCommands(client.user.id, '1182027739088302090'),
    //   { body: commands },
    // );

    // console.log('Comandos de aplicación (/) recargados exitosamente.');
  } catch (error) {
    console.error(error);
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  // IDs de los canales donde quieres que el comando esté activo
  const allowedChannelIds = ['1190351614138142811', '', ''];

  // IDs de los roles que pueden usar el comando
  const allowedRoleIds = ['1190351571222003752', '', ''];

  // Verificar si el comando se ejecuta en uno de los canales permitidos
  if (!allowedChannelIds.includes(interaction.channelId)) {
    await interaction.reply({ content: 'Este comando no se puede usar en este canal, proba en <#1182029014316093490>.', ephemeral: true });
    return;
  }

  // Verificar si el miembro tiene alguno de los roles permitidos
  const memberRoles = interaction.member.roles.cache;
  const hasPermission = allowedRoleIds.some(roleId => memberRoles.has(roleId));

  if (!hasPermission) {
    await interaction.reply({ content: 'No tienes permiso para usar este comando, compra el acceso en <#1172141233024552970>.', ephemeral: true });
    return;
  }

  if (interaction.commandName === 'teleconsulta') {

    await interaction.deferReply();

    const apiEmail = "arceguido@hotmail.com";
    const apiPassword = "25Iry60330";

    try {

      const authResponse = await fetch('https://teleconsulta.msal.gov.ar/api/getToken', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: apiEmail, password: apiPassword })
      });

      if (!authResponse.ok) {
        throw new Error(`Error de autenticación: ${authResponse.statusText}`);
      }

      const { token } = await authResponse.json();

      // Consulta a la API con el token
      //const documentoId = interaction.options.getNumber('documento_id');
      const documentoId = 107; // Id para TELECONSULTAS
      //const sexoId = interaction.options.getNumber('sexo_id');
      //const sexoId = interaction.options.getString('sexo_id') = "M" ? 110 : 111
      var sexoId = 110;
      if (interaction.options.getString('sexo') == "F" || interaction.options.getString('sexo') == "f" ){
        sexoId = 111;
      }

      const nroDocumento = interaction.options.getString('nro_documento');

      const consultaResponse = await fetch(`https://teleconsulta.msal.gov.ar/api/pacientes/exists?documento_id=${documentoId}&sexo_id=${sexoId}&nro_documento=${nroDocumento}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!consultaResponse.ok) {
        throw new Error(`Error en la consulta: ${consultaResponse.statusText}`);
      }

      const data = await consultaResponse.json();

      if (!data || !data.data || !data.data.sisa) {
        await interaction.reply('No se encontraron datos para el documento proporcionado, Fijate haber puesto todo bien.');
        return;
      }

      // Crear el archivo .txt con los datos de la respuesta
      const filePath = path.join(__dirname, 'informe.txt');
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));

      // Crear el attachment con el archivo
      const fileAttachment = new AttachmentBuilder(filePath);

      // Responder a la interacción con el archivo adjunto
      await interaction.followUp({ content: 'Aquí están los datos de la consulta, puedes descargarlos de manera rapida si asi lo deseas.:', files: [fileAttachment] });

      // Borrar el archivo después de enviarlo
      fs.unlinkSync(filePath);

    } catch (error) {
      console.error('Error al realizar la solicitud: ', error);
      await interaction.followUp({ content: 'Hubo un error al procesar tu solicitud.', ephemeral: true });
    }
  }
});

// Asegúrate de usar un token válido en la siguiente línea
//client.login('MTE4Njg5MTE0NDcyNzEwOTcyMg.GTlkhX.n-HX5qZKyD-jcLxjWihNXzgpJtDaCo-5OBvMZw');
client.login('MTE5MDM0OTgyMDUwMjc0NTI5MA.G7ZoPk.CbpoACPRX_IhpwoMwxak7mT0tOJeTBpGnX3D1k');
