import {
    RepliableInteraction,
    InteractionReplyOptions,
    MessageFlags,
    InteractionEditReplyOptions
} from "discord.js";

export async function safeReply(
    interaction: RepliableInteraction,
    content: string | InteractionReplyOptions
) {
    const payload: InteractionReplyOptions | InteractionEditReplyOptions =
        typeof content === "string"
            ? { content, flags: MessageFlags.Ephemeral }
            : { ...content, flags: content.flags ?? MessageFlags.Ephemeral };

    try {
        if (!interaction.deferred && !interaction.replied) {
            return interaction.reply(payload);
        } else {
            return interaction.editReply(payload as InteractionEditReplyOptions);
        }
    } catch {
        // fallback
        return interaction.followUp({
            ...payload,
            flags: MessageFlags.Ephemeral,
        });
    }
}
