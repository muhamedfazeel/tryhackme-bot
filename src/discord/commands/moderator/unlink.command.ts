import { ChatInputCommandInteraction, EmbedBuilder, Guild, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { ICommand } from "../../../interfaces/command.interface";
import { COMMAND_CATEGORY, COMMAND_SCOPE } from "../../../shared/constants";
import { THMClient } from "../../../types/discord-client.type";
import { Profile } from "../../../schemas";
import config from "../../../config/configuration";
import { fetchMember } from "../../../shared/utils/member.utils";
import { removeRoles } from "../../../shared/utils/role.utils";
import { CustomLogger } from "../../../shared/custom-logger";

const logger = new CustomLogger(__filename);

const UnlinkCommand: ICommand = {
    category: COMMAND_CATEGORY.MOD,
    command: true,
    scope: COMMAND_SCOPE.APPLICATION,
    data: new SlashCommandBuilder()
        .setName("unlink")
        .setDescription("Detaches a Discord account from a TryHackMe token.")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addSubcommand((subcommand) =>
            subcommand
                .setName("user")
                .setDescription("Unlink a user via their Discord username")
                .addUserOption((option) =>
                    option
                        .setName("user")
                        .setDescription("The user to be unlinked.")
                        .setRequired(true)
                )
        )
        .addSubcommand((subcommand) =>
            subcommand
                .setName("token")
                .setDescription("Unlink a user via their TryHackMe Discord token.")
                .addStringOption((option) =>
                    option
                        .setName("token")
                        .setDescription("Token attached to their account.")
                        .setRequired(true)
                )
        ),
    execute: async (interaction: ChatInputCommandInteraction, client: THMClient) => {
        const subcommand = interaction.options.getSubcommand();
        const user = interaction.options.getUser("user");
        const token = interaction.options.getString("token");

        const hasPermission = await client.checkPermissions(
            interaction,
            "Moderator"
        );
        if (!hasPermission) return;

        let userProfile: any;
        switch (subcommand) {
            case "token":
                userProfile = await Profile.findOne({ token });

                // Check if the user profile exists and the token matches
                if (!userProfile || userProfile.token !== token) {
                    await interaction.reply({
                        content:
                            "No linked account found with this token, or token does not match.\nEnsure that there are no spaces before or after the token.",
                        ephemeral: true,
                    });
                    return;
                }

                // Remove the user's data from the database
                await Profile.deleteOne({ token });
                break;

            case "user":
                userProfile = await Profile.findOne({ discordId: user?.id });

                // Check if the user profile exists
                if (!userProfile) {
                    await interaction.reply({
                        content: "No linked account found with this user.",
                        ephemeral: true,
                    });
                    return;
                }

                // Remove the user's data from the database
                await Profile.deleteOne({ discordId: user?.id });
                break;

            default:
                break;
        }

        // Remove roles from the user if they have them
        const guild = client.guilds.cache.get(config.guildId);
        if (userProfile?.discordId) {
            const member = await fetchMember(guild as Guild, userProfile.discordId);

            if (member) {
                removeRoles(member);
            }
        }

        // Send a confirmation message with the user mention
        await interaction.reply({
            content: `<@${userProfile?.discordId}> has been successfully unlinked.`,
            ephemeral: true,
        });

        const unlinkEmbed = new EmbedBuilder()
            .setAuthor({
                name: `${interaction.user.tag}`,
                iconURL: interaction.user.displayAvatarURL(),
            })
            .setColor("#FFA500")
            .setTitle(`Account Unlink`)
            .setFields([
                { name: "User", value: `<@${userProfile?.discordId}>`, inline: true },
                { name: "Token", value: userProfile?.token, inline: true },
            ])
            .setTimestamp();

        // Send the embed to the logging channel
        const loggingChannel = client.guilds.cache
            .get(config.guildId)
            ?.channels.cache.get(config.channels.botLogging);
        if (loggingChannel && loggingChannel.isTextBased()) {
            loggingChannel
                .send({ embeds: [unlinkEmbed] })
                .catch((err) =>
                    logger.error(
                        "[UNLINK] Error with sending the embed to the logging channel."
                    )
                );
        }
    },
}

export default UnlinkCommand;