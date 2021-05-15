const CONSTANTS = require("./constants");
const CONFIG = require("./config");
var MongoClient = require("mongodb").MongoClient;
require('dotenv').config();

function leaveGuild(msg, args) {
    let guildid = args[0];
    if (!CONSTANTS.bot.guilds.map(guild => {return guild.id}).includes(guildid)) return "That's not a guild the bot is in.";
    else if (!CONFIG.SystemConfig.servers[guildid]) return "That guild ID does not exist in the database.";
    else {
        MongoClient.connect(process.env.DBURL, {useUnifiedTopology: true, useNewUrlParser: true}, async function(err, db) {
            if (err) throw (err);
            var dbo = db.db("GalaxyRaiderDB");
            await dbo.collection("ServerConfigs").deleteOne({_id: guildid});
            await dbo.collection("GalaxySuspensions").deleteMany({guildID: guildid});
            await dbo.collection("GalaxyItemLogs").deleteMany({guildID: guildid});
            await dbo.collection("GalaxyRunLogs").deleteMany({guildID: guildid});
            CONSTANTS.bot.leaveGuild(guildid);
            CONFIG.getConfig();
            db.close();
        })
    }
}

exports.leaveGuild = leaveGuild;