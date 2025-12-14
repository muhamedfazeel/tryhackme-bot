import { VoiceChannel, GuildBasedChannel } from "discord.js";
import config from "../../config/configuration";
import { CustomLogger } from "../../shared/custom-logger";
import { THMClient } from "../../types/discord-client.type";
import { handleAPI } from "./api.handler";

const logger = new CustomLogger(__filename);

export default (client: THMClient): void => {
    client.updateStats = async () => {
        try {
            const guild = client.guilds.cache.get(config.guildId);
            if (!guild) {
                logger.error(`Guild not found: ${config.guildId}`);
                return;
            }

            const stats = await handleAPI.get_site_statistics();
            if (!stats) {
                logger.error("Failed to fetch site statistics.");
                return;
            }

            // Helper: Safely rename channel
            const renameVoice = (channelId: string, newName: string) => {
                const channel = client.channels.cache.get(channelId);

                if (!channel) {
                    logger.warn(`Channel not found: ${channelId}`);
                    return;
                }

                if (!channel.isVoiceBased()) {
                    logger.warn(`Channel is not a voice channel: ${channelId}`);
                    return;
                }

                (channel as VoiceChannel)
                    .setName(newName)
                    .catch((err) => logger.error(`Failed to rename ${channelId}:`, err));
            };

            // -----------------------------
            // Update channels safely
            // -----------------------------

            if (typeof stats.totalUsers === "number") {
                renameVoice(config.channels.thmUsers, `THM Users: ${stats.totalUsers}`);
            }

            if (typeof stats.publicRooms === "number") {
                renameVoice(config.channels.thmRooms, `Total Rooms: ${stats.publicRooms}`);
            }

            renameVoice(
                config.channels.discordUsers,
                `Discord Users: ${guild.memberCount}`
            );

        } catch (error) {
            logger.error("updateStats failed:", error);
        }
    };
};
