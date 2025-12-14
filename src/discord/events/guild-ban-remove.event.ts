import { Events, GuildBan } from "discord.js";
import { CustomLogger } from "../../shared/custom-logger";
import { Ban } from "../../schemas";

const logger = new CustomLogger(__filename);

const GuildBanRemoveEvent = {
    name: Events.GuildBanRemove,
    label: 'On Guild Ban Remove',
    once: false,
    async execute(ban: GuildBan) {
        logger.info(`${ban.user.tag} was unbanned from ${ban.guild.name}`);

        try {
            const bannedUser = await Ban.findOne({ discordId: ban.user.id });

            if (bannedUser) {
                await Ban.deleteOne({ discordId: ban.user.id });

                logger.info(`User removed from Ban collection: ${ban.user.tag}`);
            } else {
                logger.info(`User not found in Ban collection: ${ban.user.tag}`);
            }
        } catch (error) {
            logger.error(
                `Error removing user from Ban collection: ${ban.user.tag}`,
                error
            );
        }
    },
}

export default GuildBanRemoveEvent;