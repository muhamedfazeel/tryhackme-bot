import { Events, GuildBan } from "discord.js";
import { CustomLogger } from "../../shared/custom-logger";
import { Ban, Profile } from "../../schemas";

const logger = new CustomLogger(__filename);

const GuildBanAddEvent = {
    name: Events.GuildBanAdd,
    label: 'On Guild Ban Add',
    once: false,
    async execute(ban: GuildBan) {
        logger.info(`${ban.user.tag} was banned from ${ban.guild.name}`);

        try {
            const profile = await Profile.findOne({ discordId: ban.user.id });

            if (profile) {
                const banData = new Ban({
                    discordId: profile.discordId,
                    username: profile.username,
                    token: profile.token,
                    subscribed: profile.subscribed,
                    level: profile.level,
                    avatar: profile.avatar,
                });

                await banData.save();

                logger.info(
                    `User data transferred to Ban collection for ${ban.user.tag}`
                );
            } else {
                logger.info(`User not found in Profile collection for ${ban.user.tag}`);
            }
        } catch (error) {
            logger.error(`Error transferring user data for ${ban.user.tag}:`, error);
        }
    },
}

export default GuildBanAddEvent;