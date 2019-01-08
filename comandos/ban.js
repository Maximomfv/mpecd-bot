const Discord = require("discord.js");
const errores = require("../utiles/errores.js");

module.exports.run = async (bot, message, args) => {
  if (!message.member.hasPermission("BAN_MEMBERS")) {
    return errores.noPermisos(message);
  }
  let usuarioBaneado = message.guild.member(message.mentions.users.first() || message.guild.members.get(args[0]));
  if (!usuarioBaneado) {
    return message.channel.send("<:tickRojo:530127642129596417> **Error:** ¡Especifica un usuario válido!\n"+
                                "**┇ ⇒** Uso del comando: `+ban <usuario> [motivo]`");
  }
  let motivoBaneo = args.join(" ").slice(22);
  if (usuarioBaneado.hasPermission("BAN_MEMBERS")) {
    return message.channel.send("<:tickRojo:530127642129596417> **Error:** ¡Ese usuario no puede ser baneado!\n"+
                                "**┇ ⇒** Asegúrate de que el usuario al que estés sancionando sea el correcto.");
  }

  let fechaBaneo = message.createdAt.toString().split(' ');
  let mensajeBaneo = new Discord.RichEmbed()
  .setTitle("<:sparkcraft:491282213044879370> Baneo | " + usuarioBaneado.id)
  .setDescription("Expulsión")
  .setThumbnail(bot.user.avatarURL)
  .setColor("#DF0101") // 0x + el código del color.
  .addField("Usuario baneado: ", usuarioBaneado, true)
  .addField("Baneado por: ", message.author.tag, true)
  .addField("Baneado en: ", message.channel, true)
  .addField("Fecha de sanción: ", fechaBaneo[1] + ' ' + fechaBaneo[2] + ', ' + fechaBaneo[3], true)
  .addField("Motivo: ", motivoBaneo);

  let canalSancion = message.guild.channels.find('530872039750500372');
  if (!canalSancion) {
    return message.channel.send("No se pudo encontrar un canal.");
  }
  message.guild.member(usuarioBaneado).ban(motivoBaneo);
  canalSancion.send(mensajeBaneo);
  message.channel.send("<:tickVerde:530872653544685571> **Acción completada:** ¡El usuario ha sido baneado correctamente!\n"+
                       "**┇ ⇒** Los detalles de la sanción se mostrarán en " + canalSancion + ". Puedes revertir esta acción con +unban " + usuarioBaneado + ".");
  return;
}

module.exports.help = {
  nombre: "ban"
}
