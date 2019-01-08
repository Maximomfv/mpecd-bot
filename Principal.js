const Discord = require("discord.js");
const bot = new Discord.Client({disableEveryone: true});
const config = require("./config.json"); // config: Recopila y usa datos del archivo config.json creado.
const guildID = "479059367384186893" // guildID: Contiene la ID única del servidor.
const errores = require("./utiles/errores.js");
const userslog = bot.channels.get('489545912578867200'); // ID del canal donde aparecerán los mensajes de unión/salida.
const fs = require("fs");
const serverStats = {
  guildID: '528767989873377290',
  memberCountID: '529739045530632200'
};
let cooldown = new Set();
let segundoscd = 45;
bot.commands = new Discord.Collection();

fs.readdir("./comandos/", (err, files) => {
  if (err) {
     console.log(err);
  }
  let archivojs = files.filter(f => f.split(".").pop() === "js")
  if (archivojs.length <= 0) {
    console.log("No se pudieron encontrar comandos.");
    return;
  }
  archivojs.forEach((f, i) => {
      let propiedades = require(`./comandos/${f}`);
      console.log(`${f} cargado.`);
      bot.commands.set(propiedades.help.nombre, propiedades);
  });
});

bot.on("error", (e) => console.error(e));

// MENSAJES ADICIONALES:
// Estos son los mensajes que aparecerán una vez sea encendido el bot.

let estados = ['wildfuryteam.com', 'Más información: +ayuda']
bot.on("ready", () => {
  console.log(`WildFury | Bot oficial | Conectado en ${bot.guilds.size} servidor(es), con ${bot.users.size} usuario(s).`);
  setInterval(function() {
    let estado = estados[Math.floor(Math.random()*estados.length)];
    bot.user.setPresence( {
      status: "online",
      game: {
          name: estado, // Mensaje que aparece abajo del nombre del bot en la lista de usuarios.
          type: "STREAMING" // Tipo de acción que está realizando el bot.
      }
    });
  }, 60000) // Tiempo en el que cambiarán los mensajes, en milisegundos.
});

// MENSAJES DE UNIÓN/SALIDA:
// Para cambiar la destinación del canal donde se enviarán los mensajes, editar la ID de client.channels.get (en la variable canal).
// Para obtener la ID de un canal, ir a Ajustes de usuario > Apariencia > Modo desarrollador. Luego, hacer clic derecho en el canal y "Copiar ID".

// Mensaje que aparecerá en el chat cada vez que alguien ENTRE al servidor.
bot.on("guildMemberAdd", (member) => {
   if (member.guild.id !== serverStats.guildID) return;
   bot.channels.get(serverStats.memberCountID).setName(`Miembros: ${member.guild.memberCount}`);
   console.log(`[+] ${member.user.username} ha entrado al servidor: ${member.guild.name}.`);
   var logUsuarios = bot.channels.get('529748625153196032'); // ID del canal donde aparecerán los mensajes de unión/salida.
   var reglas = bot.channels.get('529748867164536842'); // ID del canal #reglas.
   var totalMiembros = bot.guilds.get(serverStats.guildID).members.size; // ID del servidor de Discord, para obtener número de miembros.
   logUsuarios.send(`<:wildfury:529755695084470287> | **¡Bienvenido/a!** | ${member.user} \nAcabas de entrar al servidor oficial de Discord de WildFury. \n\nActualmente hay **` + totalMiembros + `** usuarios dentro. Es importante que antes de comenzar tu travesía por estos lugares, leas el canal ` + reglas + ` para evitar sanciones. Recuerda visitar nuestra página web: <https://wildfuryteam.com>.`);
   logUsuarios.send({embed: {
     color: 0x228B22, // Color del borde del mensaje. Para cambiarlo, escribir 0x<código del color>.
     description: ":inbox_tray: **" + member.user.tag + "** ha `entrado` al servidor.\n¡Esperamos que tu estancia acá sea duradera!",
     timestamp: new Date(),
     footer: {
       icon_url: member.user.avatarURL,
       text: "Usuarios actuales: " + totalMiembros
     }
   }});
});
// Mensaje que aparecerá en el chat cada vez que alguien SALGA del servidor.
bot.on("guildMemberRemove", (member) => {
   if (member.guild.id !== serverStats.guildID) return;
   bot.channels.get(serverStats.memberCountID).setName(`Miembros: ${member.guild.memberCount}`);
   console.log(`[-] ${member.user.username} ha salido del servidor: ${member.guild.name}.`);
   var logUsuariosDos = bot.channels.get('529748625153196032'); // ID del canal donde aparecerán los mensajes de unión/salida.
   var totalMiembros = bot.guilds.get(serverStats.guildID).members.size; // ID del servidor de Discord, para obtener número de miembros.
   logUsuariosDos.send({embed: {
     color: 0xFF0000, // Color del borde del mensaje. Para cambiarlo, escribir 0x<código del color>.
     description: ":outbox_tray: **" + member.user.tag + "** ha `salido` del servidor.\n¡Esperamos volver a verlo pronto por acá!",
     timestamp: new Date(),
     footer: {
       icon_url: member.user.avatarURL,
       text: "Usuarios actuales: " + totalMiembros
     }
   }});
});

bot.on("messageDelete", async message => {
    let canalLog = message.guild.channels.find('name', "mod-logs");
    if (!canalLog) {
      return false;
    }
    if (message.member.hasPermission("MANAGE_MESSAGES")) {
      return false;
    } else {
      let mensajeEliminado = new Discord.RichEmbed()
      .setTitle('Mensaje eliminado (' + message.id + ').')
      .setDescription(':envelope: **Información adicional:**')
      .setThumbnail(message.author.avatarURL)
      .setFooter('SparkCraft | www.sparkcraft.net', bot.user.avatarURL)
      .addField('Autor del mensaje: ', message.author + ' (' + message.author.id + ')', true)
      .addField('Canal: ', message.channel, true)
      .addField('Contenido del mensaje: ', message);
      canalLog.send(mensajeEliminado);
    }
});

bot.on("message", async message => {
  const reglas = message.guild.channels.find('name', "reglas");
  if (message.author.bot) {
    return;
  }
  if (message.channel.type === "dm") {
    return;
  }
  let prefijos = JSON.parse(fs.readFileSync("./prefijos.json", "utf8"));
  if (!prefijos[message.guild.id]) {
    prefijos[message.guild.id] = {
      prefijos: config.prefijo
    };
  }
  let prefijo = prefijos[message.guild.id].prefijos;
  if (!message.content.startsWith(prefijo)) return;
  let arrayMensaje = message.content.split(" ");
  let comando = arrayMensaje[0];
  let args = arrayMensaje.slice(1);
  let archivoComandos = bot.commands.get(comando.slice(prefijo.length));
  if (archivoComandos) {
    archivoComandos.run(bot, message, args);
  }
  setTimeout(() => {
    cooldown.delete(message.author.id)
  }, segundoscd * 1000)
});
bot.login(process.env.BOT_TOKEN);
