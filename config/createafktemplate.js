// const CONFIG = require("./config");
// const CONSTANTS = require("./constants");

// const DefaultCFGStructure = {
//     cfg: {
//         allowedRoles: [],
//         pings: [],
//         runpoints: 0,
//     },
//     description: "",
//     reactions: [],
//     thumbnail: "",
//     image: "",
// }

// const DefaultReactionStructure = {
//     emoji: "<:abc:123>",
//     reaction: "abc:123",
//     earlyLocation: false,
//     limitedTo: [],              // roles that can react with it
//     max: -1,
// }

// class AfkTemplateCreator {
//     async constructor(keyword, channel) {
//         this.keyword = keyword;
//         this.channel = channel;
//         this.modelMessage = await channel.createMessage({embed: {title: "Model"}});
//         this.builderMessage = await channel.createMessage({embed: {title: "Builder"}});

//         configure(keyword);
//     }

//     configure(keyword) {
//         if (CONFIG.SystemConfig.servers[channel.guildID].afk_templates[keyword]) {
//             updateModel();
//             updateBuilder();
//         }
//         else CONFIG.SystemConfig.servers[channel.guildID].afk_templates[keyword] = DefaultCFGStructure;
//     }

//     async updateModel() {
//         template = CONFIG.SystemConfig.servers[this.channel.guildID].afk_templates[keyword];
//         this.modelMessage.edit({
//             embed: {
//                 title: "Model",
//                 description: template.description,
//                 thumbnail: {
//                     url: template.thumbnail
//                 },
//                 image: {
//                     url: template.image
//                 },
//             }
//         })
//         await this.modelMessage.removeReactions();
//         template.reactions.forEach(reactionObject => {
//             try {
//                 this.modelMessage.addReaction(reactionObject.reaction);
//             }
//             catch(e) {
//                 this.channel.createMessage("Couldn't add that reaction to the list.");
//             }
//         })
//     }

//     updateBuilder() {
//         //pass
//     }
// }


/**
 * THIS IS A COMPLETELY HYPOTHETICAL COMMAND STRUCTURE
 * 
 * Implementation will require overhaul of the following configuration systems:
 * The entire AFK check system
 * Logging Runs (dynamic point values)
 * Creating Pings 
 * Req Sheets
 * Most of the Server Configuration database 


Template for the CONFIG file's new structure

afk_templates: {
    shatters: {
        cfg: {
            allowedRoles: [],
            pings: [],
            runpoints: 0,
        },
        description: "",
        reactions: [
            {
                emoji: "<:abc:123>",
                reaction: "abc:123",
                earlyLocation: false,
                limitedTo: [],              // roles that can react with it
                max: -1,
            },
            ...
        ],
        thumbnail: "defaultimage.png",
        image: "defaultreqsheet.png",
    }
}



 USE OF THE NEW SYSTEM

.createafk <keyword=shatters>
--> "Would you like to base this template off of another pre-existing template?"
    --> if yes, copy data from that template over to the keyword and continue
    --> if no, create template entry in SYSTEMCONFIG.SERVERS[guildID].afk_templates[keyword]
 --> creates two new embed messages.
    --> first is the AFK check representation
        --> this will dynamically update as one builds the afk check. It is the 'example' of what the AFK looks like. 
    --> second is the AFK check builder
        --> this will be how you build the afk check dynamically. 
        --> add every single reaction possible to add. 
        --> Does a CFG entry for this afk_template exist already?
            --> If yes: 
                --> add all pre-existing reactions in your name to configuration message
                --> update template message
            
            --> FUNCTIONALITY: {
                --> ON REACTION ADD:
                    --> does the reaction emoji exist in CFG?
                        --> if yes:
                            --> if early reaction 
                                --> remove line "React with {emoji} if you can bring it for early location." from description
                            --> delete CFG entry
                            --> continue
                    --> add the reaction to the CFG entry
                    --> "Is this reaction an early reaction?"
                        --> if yes:
                            --> mark as early
                            --> update description with: "React with {emoji} if you can bring it for early location."
                            --> "What is the maximum number of reactions allowed? For unlimited, type 0."
                                --> update CFG.max with value
                            --> "Is this reaction limited to any specific roles?"
                                --> if yes: update CFG.limitedTo with mentioned roles
                                --> continue
                        --> if no: continue
                    --> delete message and responses

                    ...
                    --> update template message

                --> ON REACTION REMOVE:
                    --> does the reaction emoji exist in CFG?
                        --> if no, return;
                        --> else:
                            --> if early reaction 
                                --> remove line "React with {emoji} if you can bring it for early location." from description
                            --> delete CFG entry
                            --> continue



                --> WHEN RED X IS CLICKED (finishing reactions + message)
                    --> "Would you like to create a custom description, or use the auto-generated one?"
                    --> "Would you like to include a small image? (best for design)"
                    --> "Would you like to include a large image? (best for requirement sheets)"
                    --> "Would you like this AFK check to ping any roles?"
            }


Necessary functions: 

- createAfkMessage(guildID, template_name)
    - returns false if no template name is found
    - else creates message based on:
            - title: template_name
            - description: CFG.afk_template.description
            - image: CFG.afk_template.image
            - req sheet: CFG.afk_template.reqsheet

 */


