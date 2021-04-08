Robin Hood

[Add Robin Hood to your server!](https://discord.com/api/oauth2/authorize?client_id=784842269378609152&permissions=8&scope=bot)

 ## Setup Instructions: ##


**(1)** Run the command `.config`. This will compile all the resources that the bot needs, generate the necessary files and create your local server configuration.
This command will also generate default roles and channels.
**If you delete auto-generated channels** you must re-register the bot to different channels before usage (explained below).

Now, the bot has generated you four roles, one for each category of AFK check it performs. If you would prefer to have your own roles integrate with the bot, at this point you can register those with this command!

**(2)** Use the command `.accessrole moderator @role(s)` and give yourself whatever role you chose to designate as a moderator role. This will allow you to use the rest of the bot commands and bypass restrictions.
You can use this command to give unlimited roles the bot's moderator privileges, however be cautious -- this allows users to bypass bot permissions checks, allowing them to delete auto-generated raiding vcs.

**(3)**Use the commands `.accessrole member @role(s)` and `.accessrole veteran @role(s)` to assign a "member" role and a "veteran" role. Once again, you can assign as many of these as you'd like.

Tip: You can assign **batches** of permissions to multiple roles. For example, `.accessrole member @role1 @role2 @role3 @role4...` will give all of those roles Member privileges in your server.

**(4)** If you have a role for nitro boosters, use the command `.accessrole booster @role(s)` to give them early location on your AFK checks (capped at 5 boosters). You can skip this step if you do not want it.

**(5)** Configure the roles you want to have **raid leader** access to the bot. 
What does this mean? You must designate which roles will have access to the `.afk` and `.hc` functionality, and which types of runs they can start.
To give a role permission to start afk's for certain runtypes, use the command `.accessrole <runtypes> @roles`. For example, `.accessrole halls @Void Leader` will give the `@Void Leader` role permission to start halls AFK checks.
There are ten runtypes you can use in the above command: `halls, oryx, exaltation, misc, vethalls, vetoryx, vetexaltation, vetmisc, allreg, allvet`. The 'vet' types will give that role access to the bot's veteran AFK check system.

You can also assign multiple of these at one time! For example, `.accessrole halls vethalls vetoryx @role1 @role2 @role3` will give those three roles access to start halls, vet halls, and vet oryx AFK checks.
To view the current afk access configuration, type `.showconfig afkaccess`

**(6)** Configure the roles you want to have **security** access to the bot.
What does this mean? You must designate which roles will have access to the `.suspend` and `.mv` functionality.
Use the command `.accessrole security @roles` to do this.

### Extra ###

Guess what? You're finished with the basic setup!

If you want to setup the bot's **auto-verification**, follow the following steps:
- Open a "verify" channel where all users can type. (I advise you to use slowmode on this channel and moderate it well)
- Type `.say -verifyembed` in that channel to print out the verification instructions message
- Ensure that you have at least **one** member role configured with the bot
- Type `.verification enable` –> Allows users to run the `.verify` command and be automatically verified by bot.
- Type `.verification enablehiddenloc` -> Requires users to have their location private on the RealmEye API before verifying.
- Type `.verification requirement <#>` -> Requires users to meet the minimum star requirement specified (must be <85)
- To view current verification settings, type `.verification`. All set!

If you want to **unregister** the default bot-created roles (or any other roles, from any category) simply type `.removeAccessRole <types> @roles`.
For example, unregistering the role "abc" from all permissions would look like this: `.removeAccessRole all @abc` (assuming you properly ping the role).
*Note: Deleting roles will automatically unregister them from the bot*.

If you want to **register different channels** from the default bot-created channels simply type `.help changechannel` for more information.

How do I reconfigurate the server?
There is a command! The `.reconfig` command will **wipe the bot's database entry** for your guild and **delete all bot-generated channels** within your guild. 
*Note: This will not delete auto-generated roles to avoid messing up your role system, so make sure you do that to avoid role clutter!*

If you ever accidentally delete one of the auto-generated text channels, you must re-register it with the command `.changechannel`.

Lastly, if you want to see the server's current configuration, type `.showconfig`!

To get started, go through the above bullet points, assign the roles, and type `.help` to see a comprehensive list of available commands!

Have fun, and Happy Raiding!
-Theurul
