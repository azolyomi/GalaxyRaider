const CONSTANTS = require("../config/constants");
const CONFIG = require("../config/config");
const find = require("./find");
const fs = require('fs');
const path = require('path');
require('dotenv').config();
var MongoClient = require("mongodb").MongoClient;

async function fetchStaffStats(msg, args) {
    if (!CONFIG.SystemConfig.servers[msg.guildID]) return "Server is not configurated yet. Type \`.config\` to configurate it.";
    let user;
    if (msg.mentions.length > 0) user = msg.mentions[0];
    else user = msg.author;

    MongoClient.connect(process.env.DBURL, {useUnifiedTopology: true, useNewUrlParser: true}, async function(err, db) {
        if (err) throw (err);
        var dbo = db.db("GalaxyRaiderDB");
        let foundEntry = await dbo.collection("GalaxyRunLogs").findOne({UID: user.id, guildID: msg.guildID});
        if (!foundEntry) CONSTANTS.bot.createMessage(msg.channel.id, `No entry found in the database. Make sure you've logged a run before you check your stats!`);
        else {
            CONSTANTS.bot.createMessage(msg.channel.id, {
                embed: {
                    title: "Staff Stats",
                    description: 
                    `**Stats for ${user.mention}**
                    UID: ${user.id}
                    
                    Voids Led: \`${foundEntry.void}\`
                    Cults Led: \`${foundEntry.cult}\`
                    Fullskips Led: \`${foundEntry.fullskip}\`
                    Shatters Led: \`${foundEntry.shatters}\`
                    Nests Led: \`${foundEntry.nest}\`
                    Fungals Led: \`${foundEntry.fungal}\`
                    O3s Led: \`${foundEntry.o3}\`
                    Miscellaneous Led: \`${foundEntry.misc}\`

                    **Total Points:** \`${foundEntry.runpoints}\`
                    **This Week's Points:** \`${foundEntry.currentCycle}\`
                    **Last Week's Points:** \`${foundEntry.previousCycle}\`

                    ${CONFIG.SystemConfig.servers[msg.guildID].quotaEnabled?`**Weekly Quota Value:** \`${CONFIG.SystemConfig.servers[msg.guildID].quotaValue}\``:""}
                    `,
                    color: 3145463
            }
        })
        }
        db.close();
    })
}

exports.fetchStaffStats = fetchStaffStats;