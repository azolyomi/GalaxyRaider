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
        MongoClient.connect(process.env.DBURL, {useUnifiedTopology: true, useNewUrlParser: true}, async function(err, db) {
            if (err) throw (err);
            var dbo = db.db("GalaxyRaiderDB");
            await dbo.collection("ServerConfigs").deleteOne({_id: guildID});
            await dbo.collection("GalaxySuspensions").deleteMany({guildID: guildID});
            await dbo.collection("GalaxyItemLogs").deleteMany({guildID: guildID});
            await dbo.collection("GalaxyRunLogs").deleteMany({guildID: guildid});
            CONFIG.getConfig();
            db.close();
        })
    }
}



exports.deleteGuildConfig = deleteGuildConfig;
exports.deleteGuildConfigFromDiscord = deleteGuildConfigFromDiscord;