const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fetch = require('node-fetch');
const { decode } = require('jsonwebtoken');
const path = require('path');
const fs = require('fs');
const { AttachmentBuilder } = require('discord.js');

// Dividir el token en dos partes
const tokenPart1 = 'MTE5MDM0OTgyMDUwMjc0NTI5MA.GMFjMt.';
const tokenPart2 = 'o2iOpP4OkFjKKBPC3IYprM-bXCPBnkZI51We64';

// Concatenar las dos partes del token
const token = tokenPart1 + tokenPart2;

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

const commands = [
  new SlashCommandBuilder()
    .setName('teleconsulta')
    .setDescription('Consulta los datos de un pj.')
    .addStringOption(option =>
      option.setName('sexo')
        .setDescription('M o F.')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('nro_documento')
        .setDescription('El número de documento de la persona.')
        .setRequired(true)),
].map(command => command.toJSON());

const rest = new REST({ version: '10' }).setToken(token);

client.once('ready', async () => {
  console.log('¡El bot está listo!');

  const guildIds = ['1190348545082011758'];

  try {
    console.log('Comenzando la actualización de comandos (/) de la aplicación.');

    for (const guildId of guildIds) {
      await rest.put(
        Routes.applicationGuildCommands(client.user.id, guildId),
        { body: commands },
      );
      console.log(`Comandos de aplicación (/) recargados exitosamente para el servidor ${guildId}.`);
    }
  } catch (error) {
    console.error(error);
  }
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isCommand()) return;

  const allowedChannelIds = ['1190351614138142811'];
  const allowedRoleIds = ['1190351571222003752'];

  if (!allowedChannelIds.includes(interaction.channelId)) {
    await interaction.reply({ content: 'Este comando no se puede usar en este canal.', ephemeral: true });
    return;
  }

  const memberRoles = interaction.member.roles.cache;
  const hasPermission = allowedRoleIds.some(roleId => memberRoles.has(roleId));

  if (!hasPermission) {
    await interaction.reply({ content: 'No tienes permiso para usar este comando.', ephemeral: true });
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

client.login(token);
