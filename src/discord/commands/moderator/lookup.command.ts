import {
    ChatInputCommandInteraction,
    PermissionFlagsBits,
    SlashCommandBuilder,
    EmbedBuilder,
    MessageFlags
} from "discord.js";

import { ICommand } from "../../../interfaces/command.interface";
import { COMMAND_CATEGORY, COMMAND_SCOPE } from "../../../shared/constants";
import { Profile } from "../../../schemas";
import axios from "axios";
import { CustomLogger } from "../../../shared/custom-logger";
import { handleCommandError } from "../../../shared/utils/error.utils";

const logger = new CustomLogger(__filename);

/**
 * THM User Status Fetcher
 * Returns: "Active" | "Deleted" | "Unknown"
 */
async function fetchTHMAccountStatus(username: string): Promise<string> {
    try {
        const res = await axios.get(`https://tryhackme.com/p/${username}`);
        return res.request.path === "/r/not-found" ? "Deleted" : "Active";
    } catch (err) {
        logger.error("THM Status Check Error:", err);
        return "Unknown";
    }
}

/**
 * Sanitizes strings for safe markdown rendering (fixes Unknown Integration)
 */
function sanitizeMarkdown(input: string): string {
    if (!input) return "Unknown";
    return input.replace(/[[\]()<>{}`]/g, "");
}

/**
 * Safely formats embed values
 */
function safeValue(val: any): string {
    if (val === null || val === undefined || val === "") return "N/A";
    return String(val);
}

const LookupCommand: ICommand = {
    category: COMMAND_CATEGORY.MOD,
    command: true,
    scope: COMMAND_SCOPE.APPLICATION,

    data: new SlashCommandBuilder()
        .setName("lookup")
        .setDescription("Looks up a linked account by token or user.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addSubcommand((sub) =>
            sub
                .setName("token")
                .setDescription("Look up by TryHackMe token.")
                .addStringOption((opt) =>
                    opt.setName("token")
                        .setDescription("TryHackMe token")
                        .setRequired(true)
                )
        )
        .addSubcommand((sub) =>
            sub
                .setName("user")
                .setDescription("Look up by Discord user.")
                .addUserOption((opt) =>
                    opt.setName("user")
                        .setDescription("Discord user")
                        .setRequired(true)
                )
        ),

    async execute(interaction: ChatInputCommandInteraction, client) {
        try {
            // Permission check
            const allowed = await client.checkPermissions(interaction, "Moderator");
            if (!allowed) {
                await interaction.reply({ content: 'You are not allowed to use this command', flags: [MessageFlags.Ephemeral] })
                return;
            };

            // Acknowledge
            await interaction.deferReply({ ephemeral: true });

            // INPUT HANDLING
            const sub = interaction.options.getSubcommand();
            let profile = null;

            if (sub === "token") {
                const token = interaction.options.getString("token", true);
                profile = await Profile.findOne({ token });
            } else {
                const user = interaction.options.getUser("user", true);
                profile = await Profile.findOne({ discordId: user.id });
            }

            // 🔍 PROFILE VALIDATION
            if (!profile) {
                await interaction.editReply({
                    content: "No linked TryHackMe account found for this input."
                });

                return;
            }

            if (!profile.username || !profile.token) {
                await interaction.editReply({
                    content: "Profile exists but is missing required fields. (Corrupted / Incomplete)"
                });
                return;
            }

            // ACCOUNT STATUS CHECK
            const accountStatus = await fetchTHMAccountStatus(profile.username);

            // Sanitize username for markdown
            const safeUsername = sanitizeMarkdown(profile.username);

            // FALLBACK AVATAR
            const avatar = profile.avatar ||
                "https://tryhackme.com/img/favicon.png";

            // BUILD EMBED
            const embed = new EmbedBuilder()
                .setColor(0x5865F2)
                .setAuthor({
                    name: "TryHackMe",
                    iconURL: "https://tryhackme.com/img/favicon.png",
                })
                .setThumbnail(avatar)
                .setTimestamp()
                .addFields(
                    {
                        name: "Discord",
                        value: `<@${profile.discordId}>`,
                        inline: true,
                    },
                    {
                        name: "Discord ID",
                        value: safeValue(profile.discordId),
                        inline: true,
                    },
                    {
                        name: "THM Token",
                        value: safeValue(profile.token),
                        inline: true,
                    },
                    {
                        name: "THM Username",
                        value: `[${safeUsername}](https://tryhackme.com/p/${safeUsername})`,
                        inline: true,
                    },
                    {
                        name: "THM Level",
                        value: safeValue(profile.level),
                        inline: true,
                    },
                    {
                        name: "Subscribed",
                        value: safeValue(profile.subscribed),
                        inline: true,
                    },
                    {
                        name: "Account Status",
                        value: accountStatus,
                        inline: true,
                    }
                );

            await interaction.editReply({ embeds: [embed] });
            return;

        } catch (err) {
            await handleCommandError(interaction, err, "LookupCommand");
            return;
        }
    },
};

export default LookupCommand;
