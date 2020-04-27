const Discord = require("discord.js"),
      bot = new Discord.Client({disableEveryone: true}),
      config = require("./config.json"),
      Enmap = require("enmap"),
      fs = require("fs"),
      path = require("path");

bot.commands = new Discord.Collection();

fs.readdir(path.join(__dirname, "modules"), (err, files) => {
  if (err) console.log(err);
  
  files.forEach(file => {
    const event = require(path.join(__dirname, "modules", file));
    event.run(bot);
  });
});

fs.readdir(path.join(__dirname, "commands"), (err, files) => {
  if (err) console.log(err);
  
  let jsFile = files.filter(f => f.split(".").pop() === "js")
  if (jsFile.length <= 0) {
    console.log("[-] Couldn't find any commands.");
    return;
  }
  
  jsFile.forEach((f, i) => {
      let properties = require(`./commands/${f}`);
      console.log(`[i] ${f} loaded sucessfully.`);
      bot.commands.set(properties.help.nombre, propiedades);
  });
});

bot.on("error", (e) => console.error(e));
bot.on("warn", (e) => console.warn(e));
bot.on("debug", (e) => console.info(e));
