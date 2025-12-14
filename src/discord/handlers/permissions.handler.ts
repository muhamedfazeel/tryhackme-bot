import {
    GuildMember,
    Interaction,
    InteractionEditReplyOptions,
    InteractionReplyOptions,
    MessageFlags,
    RepliableInteraction,
} from "discord.js";
import { THMClient } from "../../types/discord-client.type";
import config from "../../config/configuration";
import { CustomLogger } from "../../shared/custom-logger";

const logger = new CustomLogger(__filename);

type RoleName = "Verified" | "Moderator" | "Administrator" | "Owner";

export default (client: THMClient): void => {

    /** Helper: send ephemeral message safely */
    const safeReply = async (interaction: RepliableInteraction, content: string) => {
        const reply: InteractionReplyOptions | InteractionEditReplyOptions = { content };

        if (!interaction.replied && !interaction.deferred) {
            return interaction.reply({ ...reply as InteractionReplyOptions, flags: MessageFlags.Ephemeral });
        }

        try {
            return interaction.editReply({ ...reply as InteractionEditReplyOptions });
        } catch {
            return interaction.followUp({ ...reply as InteractionReplyOptions });
        }
    };

    client.checkPermissions = async (
        interaction: Interaction,
        requiredRole: RoleName
    ): Promise<boolean> => {

        // Must be in guild
        if (!interaction.inGuild()) {
            if (interaction.isRepliable()) {
                await safeReply(interaction, "This command can only be used in a server (guild).");
            }
            return false;
        }

        // Ensure repliable
        if (!interaction.isRepliable()) {
            logger.warn("Interaction is not repliable — cannot send permission message.");
            return false;
        }

        const member = interaction.member as GuildMember | null;

        if (!member) {
            await safeReply(interaction, "Unable to get your member data. Please try again.");
            return false;
        }

        // Developer bypass
        if (member.id === config.users.developerId) return true;

        // Role checks
        const roles = config.roles;

        const has = (roleId?: string) => !!roleId && member.roles.cache.has(roleId);

        const level = {
            Owner: has(roles.owner),
            Administrator: has(roles.admin),
            Moderator: has(roles.moderator),
            Verified: has(roles.verified),
        };

        // Build hierarchical structure (Owner > Admin > Mod > Verified)
        const hierarchy = {
            Owner: level.Owner,
            Administrator: level.Owner || level.Administrator,
            Moderator: level.Owner || level.Administrator || level.Moderator,
            Verified: level.Owner || level.Administrator || level.Moderator || level.Verified,
        };

        // Check permission
        const allowed = hierarchy[requiredRole];

        if (allowed) return true;

        await safeReply(interaction, `You do not have the required permission: **${requiredRole}**.`);
        return false;
    };
};
