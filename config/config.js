const fs = require('fs');
const path = require('path');
const CONSTANTS = require("./constants");
require('dotenv').config();
var MongoClient = require("mongodb").MongoClient;

exports.SystemConfig = { servers: {} };

function getConfig() {
  MongoClient.connect(process.env.DBURL,  {useUnifiedTopology: true, useNewUrlParser: true}, async function(err, db) {
    if (err) throw (err);
    var dbo = db.db("GalaxyRaiderDB");
    await dbo.collection("ServerConfigs").find().forEach(function(entry) {
      exports.SystemConfig.servers[entry._id] = entry;
    })
    db.close();
  })  // exports.SystemConfig = JSON.parse(fs.readFileSync(path.resolve(__dirname, "./config.json")));
}

function updateConfig(guildID) {
  try {
    MongoClient.connect(process.env.DBURL, {useUnifiedTopology: true, useNewUrlParser: true}, async function(err, db) {
      if (err) throw (err);
      var dbo = db.db("GalaxyRaiderDB");
      var serverObject = {_id: guildID};
      let hasFoundEntry = (await dbo.collection("ServerConfigs").findOne(serverObject));
      if (!hasFoundEntry) {
        await dbo.collection("ServerConfigs").insertOne(exports.SystemConfig.servers[guildID]);
        db.close();
      }
      else {
        updateObject = {$set: exports.SystemConfig.servers[guildID]} // the object i'd like to update
        await dbo.collection("ServerConfigs").updateOne(serverObject, updateObject)
        db.close();
      }
    })


    // const jsonString = JSON.stringify(exports.SystemConfig, null, "\t");

    // fs.writeFile(path.resolve(__dirname, "./config.json"), jsonString, err => {
    //     if (err) console.log("Error writing to config.json: ", err);
    //     else console.log("Successfully wrote to config.json");
    // })
  } catch(e) {
    throw e;
  }
}

exports.addGuildConfigEntry = function(guildID, guildName, suspendrole, staffroles, afkaccess, channels, logchannel) {
  if (!exports.SystemConfig.servers[guildID]) {
    let newEntry = {
          "_id": guildID,
          "guildName": guildName,
          "suspendrole": suspendrole,
          "staffroles": staffroles,
          "modroles": [],
          "securityroles": [],
          "helperroles": [],
          "afkaccess": afkaccess,
          "postraidpanelenabled": false,
          "channels": channels,
          "logchannel": logchannel,
          "nonstaff": {
            "memberaccess": [],
            "vetaccess": [],
            "boosteraccess": [],
          },
          "streamingperms": [],
          "logItemPointValues": {
            "keys": 10,
            "vials": 10,
            "runes": 10,
          },
          "runpoints": {
            "void" : 8,
            "cult" : 8,
            "fullskip" : 8,
            "shatters" : 5,
            "nest" : 3,
            "fungal" : 5,
            "o3" : 20,
            "misc" : 2
          },
          "verification" : {
            "enabled" : false,
            "minrank" : 0,
            "hiddenloc" : true
          },
          "quotaEnabled": false,
          "quotaValue": 40,
          "quotaEnabledRoles": [],
          "quotaOverrideRoles": [],
          "pings": {
            "void": [],
            "cult": [],
            "shatters": [],
            "nest": [],
            "fungal": [],
            "oryx3": [],
            "misc": [],
          },     
          "defaultreqsheets": [
            `https://cdn.discordapp.com/attachments/826194483992461383/826194537847193715/Useful_Swapouts.png`, 
            `https://cdn.discordapp.com/attachments/826194483992461383/826194516922073118/CultVoid.png`, // high-reqs void
            `https://cdn.discordapp.com/attachments/826194483992461383/826194540309905408/Fullskip_Void.png`, //fullskip
            `https://cdn.discordapp.com/attachments/826194483992461383/826194537847193715/Useful_Swapouts.png`, 
            `https://cdn.discordapp.com/attachments/826194483992461383/826194516922073118/CultVoid.png`,//fullclear highreqs
            `https://cdn.discordapp.com/attachments/826194483992461383/826194537847193715/Useful_Swapouts.png`, 
            `https://cdn.discordapp.com/attachments/826194483992461383/826194516922073118/CultVoid.png`, //cult highreqs
            `https://cdn.discordapp.com/attachments/826194483992461383/826194537847193715/Useful_Swapouts.png`, 
            `https://cdn.discordapp.com/attachments/826194483992461383/826194535188135936/Exaltations.png`, //shats highreqs
            `https://cdn.discordapp.com/attachments/826194483992461383/826194537847193715/Useful_Swapouts.png`, 
            `https://cdn.discordapp.com/attachments/826194483992461383/826194535188135936/Exaltations.png`, //nest highreqs
            `https://cdn.discordapp.com/attachments/826194483992461383/826194537847193715/Useful_Swapouts.png`,
            `https://cdn.discordapp.com/attachments/826194483992461383/826194535188135936/Exaltations.png`, //fungal highreqs 
            `https://cdn.discordapp.com/attachments/826194483992461383/826194539169579038/O3.png`, 
            `https://cdn.discordapp.com/attachments/826194483992461383/826194539169579038/O3.png`,  // o3 highreqs
            `https://cdn.discordapp.com/attachments/826194483992461383/826194537847193715/Useful_Swapouts.png`,
            `https://cdn.discordapp.com/attachments/826194483992461383/826194535188135936/Exaltations.png` // misc highreqs
          ],
          "keypoproles" : {
                "novice" : {
                        "enabled" : false,
                        "id" : "",
                        "points" : 0,
                        "prefix": "",
                },
                "apprentice" : {
                        "enabled" : false,
                        "id" : "",
                        "points" : 0,
                        "prefix": ""
                },
                "adept" : {
                        "enabled" : false,
                        "id" : "",
                        "points" : 0,
                        "prefix": ""
                },
                "master" : {
                        "enabled" : false,
                        "id" : "",
                        "points" : 0,
                        "prefix": ""
                }
          }, 
          "keyqueue": {
            "enabled": false,
            "messageid": "",
            "channelid": ""
          }
      }
    exports.SystemConfig.servers[guildID] = newEntry;
    updateConfig(guildID);
  }
  else {
    console.log("No entry added, guild ID already exists in config database.")
  }
}

exports.deleteGuildRole = function(guild, role) {
  if (!exports.SystemConfig.servers[guild.id]) return;
  else {
    exports.SystemConfig.servers[guild.id].staffroles = exports.SystemConfig.servers[guild.id].staffroles.filter(roleID => roleID != role.id);
    exports.SystemConfig.servers[guild.id].modroles = exports.SystemConfig.servers[guild.id].modroles.filter(roleID => roleID != role.id);
    exports.SystemConfig.servers[guild.id].afkaccess.halls = exports.SystemConfig.servers[guild.id].afkaccess.halls.filter(roleID => roleID != role.id);
    exports.SystemConfig.servers[guild.id].afkaccess.oryx = exports.SystemConfig.servers[guild.id].afkaccess.oryx.filter(roleID => roleID != role.id);
    exports.SystemConfig.servers[guild.id].afkaccess.exaltation = exports.SystemConfig.servers[guild.id].afkaccess.exaltation.filter(roleID => roleID != role.id);
    exports.SystemConfig.servers[guild.id].afkaccess.misc = exports.SystemConfig.servers[guild.id].afkaccess.misc.filter(roleID => roleID != role.id);
    exports.SystemConfig.servers[guild.id].afkaccess.shatters = exports.SystemConfig.servers[guild.id].afkaccess.shatters.filter(roleID => roleID != role.id);
    exports.SystemConfig.servers[guild.id].afkaccess.vethalls = exports.SystemConfig.servers[guild.id].afkaccess.vethalls.filter(roleID => roleID != role.id);
    exports.SystemConfig.servers[guild.id].afkaccess.vetoryx = exports.SystemConfig.servers[guild.id].afkaccess.vetoryx.filter(roleID => roleID != role.id);
    exports.SystemConfig.servers[guild.id].afkaccess.vetexaltation = exports.SystemConfig.servers[guild.id].afkaccess.vetexaltation.filter(roleID => roleID != role.id);
    exports.SystemConfig.servers[guild.id].afkaccess.vetmisc = exports.SystemConfig.servers[guild.id].afkaccess.vetmisc.filter(roleID => roleID != role.id);
    exports.SystemConfig.servers[guild.id].afkaccess.vetshatters = exports.SystemConfig.servers[guild.id].afkaccess.vetshatters.filter(roleID => roleID != role.id);
    exports.SystemConfig.servers[guild.id].afkaccess.denyhighreqs = exports.SystemConfig.servers[guild.id].afkaccess.denyhighreqs.filter(roleID => roleID != role.id);
    exports.SystemConfig.servers[guild.id].afkaccess.exaltation = exports.SystemConfig.servers[guild.id].afkaccess.exaltation.filter(roleID => roleID != role.id);
    exports.SystemConfig.servers[guild.id].nonstaff.memberaccess = exports.SystemConfig.servers[guild.id].nonstaff.memberaccess.filter(roleID => roleID != role.id);
    exports.SystemConfig.servers[guild.id].nonstaff.vetaccess = exports.SystemConfig.servers[guild.id].nonstaff.vetaccess.filter(roleID => roleID != role.id);
    exports.SystemConfig.servers[guild.id].nonstaff.boosteraccess = exports.SystemConfig.servers[guild.id].nonstaff.boosteraccess.filter(roleID => roleID != role.id);
    if (exports.SystemConfig.servers[guild.id].suspendrole == role.id) exports.SystemConfig.servers[guild.id].suspendrole = undefined;
    exports.SystemConfig.servers[guild.id].streamingperms = exports.SystemConfig.servers[guild.id].streamingperms.filter(roleID => roleID != role.id);

    exports.SystemConfig.servers[guild.id].quotaEnabledRoles = exports.SystemConfig.servers[guild.id].quotaEnabledRoles.filter(roleID => roleID != role.id);
    exports.SystemConfig.servers[guild.id].quotaOverrideRoles = exports.SystemConfig.servers[guild.id].quotaOverrideRoles.filter(roleID => roleID != role.id);

    if (exports.SystemConfig.servers[guild.id].keyqueue.pingrole == role.id) {
      // Disable the key pinging message if the key ping role has been deleted
      
      exports.SystemConfig.servers[guild.id].keyqueue.pingrole = undefined;
      exports.SystemConfig.servers[guild.id].keyqueue.keyping = false;

      CONSTANTS.bot.createMessage(exports.SystemConfig.servers[guild.id].logchannel, "The key queue pinging feature has been automatically disabled as the role has been deleted.").catch({});
    }

    CONSTANTS.bot.createMessage(exports.SystemConfig.servers[guild.id].logchannel, `The ${role.name} role was deleted, and as such it has been removed from all configurations.`).catch({});
    updateConfig(guild.id);
    return;
  }
}

exports.deleteChannel = function(channel) {
  if (!exports.SystemConfig.servers[channel.guild.id]) return;
  else {
    let channelWasInConfig = false;
    if (channel.id == exports.SystemConfig.servers[channel.guild.id].logchannel) {
      exports.SystemConfig.servers[channel.guild.id].logchannel = undefined;
      channelWasInConfig = true;
    }
    if (Object.values(exports.SystemConfig.servers[channel.guild.id].channels.Main).includes(channel.id)) {
      if (exports.SystemConfig.servers[channel.guild.id].channels.Main.RaidCategoryID == channel.id) exports.SystemConfig.servers[channel.guild.id].channels.Main.RaidCategoryID = undefined;
      if (exports.SystemConfig.servers[channel.guild.id].channels.Main.RaidCommandsChannelID == channel.id) exports.SystemConfig.servers[channel.guild.id].channels.Main.RaidCommandsChannelID = undefined;
      if (exports.SystemConfig.servers[channel.guild.id].channels.Main.RaidStatusChannelID == channel.id) exports.SystemConfig.servers[channel.guild.id].channels.Main.RaidStatusChannelID = undefined;
      if (exports.SystemConfig.servers[channel.guild.id].channels.Main.ActiveRaidsChannelID == channel.id) exports.SystemConfig.servers[channel.guild.id].channels.Main.ActiveRaidsChannelID = undefined;
      if (exports.SystemConfig.servers[channel.guild.id].channels.Main.LocationChannelID == channel.id) exports.SystemConfig.servers[channel.guild.id].channels.Main.LocationChannelID = undefined;
      if (exports.SystemConfig.servers[channel.guild.id].channels.Main.EarlyReactionsLogChannelID == channel.id) exports.SystemConfig.servers[channel.guild.id].channels.Main.EarlyReactionsLogChannelID = undefined;
      channelWasInConfig = true;
    }
    if (Object.values(exports.SystemConfig.servers[channel.guild.id].channels.Veteran).includes(channel.id)) {
      if (exports.SystemConfig.servers[channel.guild.id].channels.Veteran.RaidCategoryID == channel.id) exports.SystemConfig.servers[channel.guild.id].channels.Veteran.RaidCategoryID = undefined;
      if (exports.SystemConfig.servers[channel.guild.id].channels.Veteran.RaidCommandsChannelID == channel.id) exports.SystemConfig.servers[channel.guild.id].channels.Veteran.RaidCommandsChannelID = undefined;
      if (exports.SystemConfig.servers[channel.guild.id].channels.Veteran.RaidStatusChannelID == channel.id) exports.SystemConfig.servers[channel.guild.id].channels.Veteran.RaidStatusChannelID = undefined;
      if (exports.SystemConfig.servers[channel.guild.id].channels.Veteran.ActiveRaidsChannelID == channel.id) exports.SystemConfig.servers[channel.guild.id].channels.Veteran.ActiveRaidsChannelID = undefined;
      if (exports.SystemConfig.servers[channel.guild.id].channels.Veteran.LocationChannelID == channel.id) exports.SystemConfig.servers[channel.guild.id].channels.Veteran.LocationChannelID = undefined;
      if (exports.SystemConfig.servers[channel.guild.id].channels.Veteran.EarlyReactionsLogChannelID == channel.id) exports.SystemConfig.servers[channel.guild.id].channels.Veteran.EarlyReactionsLogChannelID = undefined;
      channelWasInConfig = true;
    }
    if (exports.SystemConfig.servers[channel.guild.id].keyqueue.pingchannel == channel.id) {
      // Disable the key pinging message if the key ping channel has been deleted

      exports.SystemConfig.servers[channel.guild.id].keyqueue.pingchannel = undefined;
      exports.SystemConfig.servers[channel.guild.id].keyqueue.keyping = false;

      CONSTANTS.bot.createMessage(exports.SystemConfig.servers[channel.guild.id].logchannel, "The key queue pinging feature has been automatically disabled as the channel has been deleted.").catch({});

      channelWasInConfig = true;
    }
    if (channelWasInConfig) {
      CONSTANTS.bot.createMessage(exports.SystemConfig.servers[channel.guild.id].logchannel, `The ${channel.name} channel was deleted, and as such it has been removed from all configurations.`).catch({});
      updateConfig(channel.guild.id);
    }
    return;
  }
}

getConfig();


exports.getConfig = getConfig;
exports.updateConfig = updateConfig;

/**
 "defaultreqsheets": [
            `https://cdn.discordapp.com/attachments/826194483992461383/826194537847193715/Useful_Swapouts.png`, 
            `https://cdn.discordapp.com/attachments/826194483992461383/826194516922073118/CultVoid.png`, // high-reqs void
            `https://cdn.discordapp.com/attachments/762679138346860585/815661757754245190/Fullskip_Void.png`, //fullskip
            `https://cdn.discordapp.com/attachments/826194483992461383/826194537847193715/Useful_Swapouts.png`, 
            `https://cdn.discordapp.com/attachments/826194483992461383/826194516922073118/CultVoid.png`,//fullclear highreqs
            `https://cdn.discordapp.com/attachments/826194483992461383/826194537847193715/Useful_Swapouts.png`, 
            `https://cdn.discordapp.com/attachments/826194483992461383/826194516922073118/CultVoid.png`, //cult highreqs
            `https://cdn.discordapp.com/attachments/826194483992461383/826194537847193715/Useful_Swapouts.png`, 
            `https://cdn.discordapp.com/attachments/826194483992461383/826194535188135936/Exaltations.png`, //shats highreqs
            `https://cdn.discordapp.com/attachments/826194483992461383/826194537847193715/Useful_Swapouts.png`, 
            `https://cdn.discordapp.com/attachments/826194483992461383/826194535188135936/Exaltations.png`, //nest highreqs
            `https://cdn.discordapp.com/attachments/826194483992461383/826194537847193715/Useful_Swapouts.png`,
            `https://cdn.discordapp.com/attachments/826194483992461383/826194535188135936/Exaltations.png`, //fungal highreqs 
            `https://cdn.discordapp.com/attachments/762062029107625987/778496626695733268/O3_Reqs.png`, 
            `https://cdn.discordapp.com/attachments/762679138346860585/815661758680137728/O3.png`,  // o3 highreqs
            `https://cdn.discordapp.com/attachments/826194483992461383/826194537847193715/Useful_Swapouts.png`,
            `https://cdn.discordapp.com/attachments/826194483992461383/826194535188135936/Exaltations.png` // misc highreqs
          ]
 */
