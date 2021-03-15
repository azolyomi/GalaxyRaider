const CONSTANTS = require("../config/constants");
const CONFIG = require("../config/config");
const find = require("../staff_commands/find");
const fs = require('fs');
const path = require('path');
require('dotenv').config();
var MongoClient = require("mongodb").MongoClient;

function leaderboard(msg, args) {
    if (!CONFIG.SystemConfig.servers[msg.guildID]) return "You first have to configurate the server. Type \`.instructions\` for help.";

    let type = "points";
    let acceptableTypes = ["keys", "vials", "runes"];
    if (args[0] && acceptableTypes.includes(args[0])) type = args[0];

    MongoClient.connect(process.env.DBURL, async function(err, db) {
        if (err) throw (err);
        var dbo = db.db("GalaxyRaiderDB");
        let array = dbo.collection("GalaxyItemLogs").find({guildID: msg.guildID}).sort({[type]: -1}).toArray();
        array = (await array).slice(0, 10);
        
        CONSTANTS.bot.createMessage(msg.channel.id, {
            embed: {
                title: `Item Logs Leaderboard`,
                description:
                `Top 10, organized by: \`${type}\`
                #1: ${array[0]?`<@${array[0].UID}> (\`${array[0][type]}\` ${type})`:"-"}
                #2: ${array[1]?`<@${array[1].UID}> (\`${array[1][type]}\` ${type})`:"-"}
                #3: ${array[2]?`<@${array[2].UID}> (\`${array[2][type]}\` ${type})`:"-"}
                #4: ${array[3]?`<@${array[3].UID}> (\`${array[3][type]}\` ${type})`:"-"}
                #5: ${array[4]?`<@${array[4].UID}> (\`${array[4][type]}\` ${type})`:"-"}
                #6: ${array[5]?`<@${array[5].UID}> (\`${array[5][type]}\` ${type})`:"-"}
                #7: ${array[6]?`<@${array[6].UID}> (\`${array[6][type]}\` ${type})`:"-"}
                #8: ${array[7]?`<@${array[7].UID}> (\`${array[7][type]}\` ${type})`:"-"}
                #9: ${array[8]?`<@${array[8].UID}> (\`${array[8][type]}\` ${type})`:"-"}
                #10: ${array[9]?`<@${array[9].UID}> (\`${array[9][type]}\` ${type})`:"-"}`,
                color: 3145463
            }
        })

        db.close();
    })
}

exports.leaderboard = leaderboard;