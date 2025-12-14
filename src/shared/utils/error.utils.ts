import { EmbedBuilder, Interaction, RepliableInteraction } from "discord.js";
import { CustomLogger } from "../custom-logger";
import { safeReply } from "./reply.utils";

const logger = new CustomLogger("ErrorHandler");

export async function handleCommandError(
    interaction: Interaction,
    error: any,
    tag: string
) {
    logger.error(`❌ Error in ${tag}:`, error);

    const embed = new EmbedBuilder()
        .setColor("#FF0000")
        .setTitle("❌ An error occurred")
        .setDescription("Something went wrong while processing this interaction.")
        .setTimestamp();

    // Only repliable interactions can receive a message
    if (interaction.isRepliable()) {
        return safeReply(interaction as RepliableInteraction, {
            embeds: [embed],
            flags: 64,
        });
    }

    // Non-repliable interactions (Autocomplete, Ping, etc.)
    logger.warn(`Interaction (${interaction.type}) is not repliable → cannot send error embed.`);
}
