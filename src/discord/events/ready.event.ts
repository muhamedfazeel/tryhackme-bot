import { Events, Routes } from "discord.js";
import { CustomLogger } from "../../shared/custom-logger";
import { THMClient } from "../../types/discord-client.type";
import { Giveaway } from "../../schemas";
import { endGiveaway } from "../../shared/utils/giveway.utils";
import config from "../../config/configuration";

const logger = new CustomLogger(__filename);

const ReadyEvent = {
    name: Events.ClientReady,
    label: 'On Ready',
    once: true,
    async execute(client: THMClient) {
        logger.info(`Ready! Logged in as ${client?.user?.tag}`);

        // Set bot's activity
        client.user?.setActivity(`https://tryhackme.com/`);

        // Register Slash Commands
        try {
            if (!client.commandArray?.length) {
                logger.warn("⚠ No slash commands found in client.commandArray.");
            } else {
                logger.info("🚀 Registering Application (/) Commands...");

                const result = await client.rest.put(
                    Routes.applicationCommands(config.bot.clientId),
                    { body: client.commandArray }
                );

                if (Array.isArray(result)) {
                    logger.info(`✅ Registered ${Array.isArray(result) ? result.length : 0} slash commands.`);
                } else {
                    logger.warn("⚠ Unexpected response from Discord while registering commands.");
                }
            }
        } catch (error) {
            logger.error("❌ Failed to register slash commands:", error);
        }

        // Initial check for giveaways that might have ended while the bot was offline
        logger.info("🎁 Checking for giveaways that ended while offline...");
        const now = new Date();
        const expired = await Giveaway.find({
            endDate: { $lt: now },
            concluded: { $ne: true }
        });

        for (const giveaway of expired) {
            await endGiveaway(client, giveaway._id, true);
        }

        logger.info("Giveaway cleanup complete.");
    }
};

export default ReadyEvent;