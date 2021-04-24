const CONFIG = require("./config");
var MongoClient = require("mongodb").MongoClient;
require("dotenv").config();

function deleteGuildConfigFromDiscord(msg, args) {
    let guildID = args[0];
    return deleteGuildConfig(guildID);
}

function deleteGuildConfig(guildID) {
    if (!CONFIG.SystemConfig.servers[guildID]) return "That guild ID does not exist in the database.";
    else {
        MongoClient.connect(process.env.DBURL, function(err, db) {
            if (err) throw (err);
            var dbo = db.db("GalaxyRaiderDB");
            dbo.collection("ServerConfigs").deleteOne({_id: guildID});
            dbo.collection("GalaxySuspensions").deleteMany({guildID: guildID});
            dbo.collection("GalaxyItemLogs").deleteMany({guildID: guildID});
            dbo.collection("GalaxyRunLogs").deleteMany({guildID: guildid});
            CONFIG.getConfig();
            db.close();
        })
    }
}



exports.deleteGuildConfig = deleteGuildConfig;
exports.deleteGuildConfigFromDiscord = deleteGuildConfigFromDiscord;