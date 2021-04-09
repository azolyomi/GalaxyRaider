# Robin Hood #
[Add Robin Hood to your Discord Server!](https://discord.com/api/oauth2/authorize?client_id=784842269378609152&permissions=8&scope=bot)

[Support my Patreon!](https://patreon.com/Theurul)
  
# Setup Instructions: #
 
 > Pre-Tip: At any point, you can view the current server configuration with `.showconfig`

## 1. Run the command `.config`. ##
This will compile all the resources that the bot needs, generate the necessary files and create your local server configuration.
This command will also generate default roles and channels.

> Tip: If you delete auto-generated channels you must re-register the bot to different channels before usage (`.help changechannel`). You can delete auto-generated roles **only after** you have registered new roles with the bot.

Now, the bot has generated you four roles, one for each category of AFK check it performs. If you would prefer to have your own roles integrate with the bot, at this point you can register those with this command!

## 2. Use the command `.accessrole moderator @role(s)` and give yourself whatever role you chose to designate as a moderator role. ##
This will allow you to use the rest of the bot commands and bypass restrictions.
> Tip: You can use this command to give unlimited roles the bot's moderator privileges! However be cautious -- users with these roles can bypass bot permissions checks, allowing them to delete auto-generated raiding vcs.

## 3. Use the commands `.accessrole member @role(s)` and `.accessrole veteran @role(s)` to assign a "member" role and a "veteran" role. ## 
Once again, you can assign as many of these as you'd like.

> Tip: You can assign **batches** of permissions to multiple roles. For example, `.accessrole member @role1 @role2 @role3 @role4...` will give all of those roles Member privileges in your server.

## 4. If you have a role for nitro boosters, use the command `.accessrole booster @role(s)` to give them early location on your AFK checks (capped at 5 boosters). ##
You can give as many roles access to the early location reaction as you wish.

## 5. Configure the roles you want to have `raid leader` access to the bot. ##

What does this mean? You must designate which roles will have access to the `.afk` and `.hc` functionality, and which types of runs they can start.
To give a role permission to start afk's for certain runtypes, use the command `.accessrole <runtypes> @roles`. For example, `.accessrole halls @Void Leader` will give the `@Void Leader` role permission to start halls AFK checks.

> Tip: If you have one role that should have access to start all AFK checks, just do `.accessrole allvet allreg @role`!

There are ten runtypes you can use in the above command: `halls, oryx, exaltation, misc, vethalls, vetoryx, vetexaltation, vetmisc, allreg, allvet`. The 'vet' types will give that role access to the bot's veteran AFK check system.

> Tip: You can also assign multiple of these at one time! For example, `.accessrole halls vethalls vetoryx @role1 @role2 @role3` will give those three roles access to start halls, vet halls, and vet oryx AFK checks.

> Tip: To view the current afk access configuration, type `.showconfig afkaccess`.

## 6. Configure the roles you want to have `security` access to the bot. ##
What does this mean? You must designate which roles will have access to the `.suspend` and `.mv` functionality.
Use the command `.accessrole security @roles` to do this.

# Extra #

Guess what? You're finished with the basic setup!

If you want to set up auto-verification with the bot:
- Ensure that you have registered at least one `Member` role with the bot.
- Type `.verification enable`
- Type `.verification enablehiddenloc`
- Use `.verification requirement <#>` to set the star requirement that users must meet to be verified (Max 85 stars, default 0 stars)
- Create a channel where non-member users can type named `#verify` or something similar. 
- In this channel, run the command `.say -verifyembed`
- All done! Users can now verify in your server with the command `.verify`. All verifications will be logged in the bot's log channel.

# FAQ #

_Can I delete the automatic bot-generated roles?_
> Yes, you can! However, only do this once you have configured another role with the bot. If you don't do this, you will have no way to access the bot, and you'll have to run the command `.reconfig` to restart the configuration process.

_How can I unregister a role from the bot?_
> If you want to **unregister** the default bot-created roles (or any other roles, from any category) simply type `.removeAccessRole <types> @roles`. 
> For example, unregistering the role "abc" from all permissions would look like this: `.removeAccessRole all @abc` (assuming you properly ping the role). 
> *Note: Deleting roles will automatically unregister them from the bot*.

_Help! I accidentally deleted a channel from the bot and now AFK checks wont start. How can I fix this?_
> If you ever want to **register different channels** from the default bot-created channels simply type `.help changechannel` for more information.
> This will enable you to correct this mistake.

_Help! I broke something and nothing I've tried has fixed it! What do I do?_
> The `.reconfig` command will **wipe the bot's database entry** for your guild and **delete all bot-generated channels** within your guild. 
*Note: This will not delete auto-generated roles, so make sure you do that yourself to avoid role clutter!*

_I keep suspending people, but it's not working! What's going on?_
> Most likely, the suspend role in your server is not configured. Run the command `.setsuspendrole @role` to fix this issue.

To get started, go through the above bullet points, assign the roles, and type `.help` to see a comprehensive list of available commands!

Have fun, and Happy Raiding!

Your Friendly Bot Developer, [Theurul](https://patreon.com/Theurul)

## Notices: ##
- I reserve the right to withdraw my bot from your server if you at any point break the [ROTMG Terms of Service](https://decagames.com/tos.html) or ingame rules.
- I reserve the right to withdraw my bot if I decide that your server is impacting the ROTMG Community in a negative way.
- I am not liable for any changes made to the bot that disrupt the `'normal'` workchain of your server.
