const CONSTANTS = require("./constants");
const CONFIG = require("./config");
var MongoClient = require("mongodb").MongoClient;
require('dotenv').config();

function leaveGuild(msg, args) {
    let guildid = args[0];
    if (!CONSTANTS.bot.guilds.map(guild => {return guild.id}).includes(guildid)) return "That's not a guild the bot is in.";
    else {
        MongoClient.connect(process.env.DBURL, function(err, db) {
            if (err) throw (err);
            var dbo = db.db("GalaxyRaiderDB");
            dbo.collection("ServerConfigs").deleteOne({_id: guildid});
            dbo.collection("GalaxySuspensions").deleteMany({guildID: guildid});
            dbo.collection("GalaxyItemLogs").deleteMany({guildID: guildid});
            CONSTANTS.bot.leaveGuild(guildid);
        })
    }
}

exports.leaveGuild = leaveGuild;