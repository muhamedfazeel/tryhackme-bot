import { ChatInputCommandInteraction, EmbedBuilder, MessageFlags, SlashCommandBuilder } from "discord.js";
import { ICommand } from "../../../interfaces/command.interface";
import { COMMAND_CATEGORY, COMMAND_SCOPE } from "../../../shared/constants";
import { THMClient } from "../../../types/discord-client.type";
import config from "../../../config/configuration";
import { CustomLogger } from "../../../shared/custom-logger";
import { handleAPI } from "../../handlers/api.handler";

const logger = new CustomLogger(__filename);

const RankCommand: ICommand = {
    category: COMMAND_CATEGORY.UTIL,
    scope: COMMAND_SCOPE.APPLICATION,
    command: true,
    data: new SlashCommandBuilder()
        .setName("rank")
        .setDescription("Get the TryHackMe rank of a user.")
        .addStringOption((option) =>
            option
                .setName("username")
                .setDescription("The username to retrieve the rank for.")
                .setRequired(true)
        ),
    execute: async (interaction: ChatInputCommandInteraction, client: THMClient) => {
        const username: string = interaction.options.getString("username") as string;

        if (
            interaction.channel &&
            interaction.channel.id === config.channels.botCommands
        ) {
            await interaction.deferReply();
        } else {
            await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });
        }

        if (username && username.length > 30) {
            await interaction.editReply({
                content:
                    "Your input exceeds the username character limit. Please try again.",
            });

            return;
        }

        try {
            const userProfile = await handleAPI.get_user_data(username);
            if (
                !userProfile ||
                userProfile.userRank == 0 ||
                userProfile.userRank == undefined ||
                userProfile.points === "undefined" ||
                userProfile.points === undefined
            ) {
                await interaction.editReply({
                    content: "User not found.",
                });

                return;
            }

            const tryhackme_url = "https://tryhackme.com/p/";
            const rankEmbed = new EmbedBuilder()
                .setColor("#5865F2")
                .setTitle(userProfile.username || username)
                .addFields(
                    {
                        name: "Leaderboard Position",
                        value: `${userProfile.rank || userProfile.userRank}`,
                    },
                    {
                        name: "Username",
                        value: `[${userProfile.username || username}](${tryhackme_url}${userProfile.username || username
                            })`,
                        inline: true,
                    },
                    { name: "Points", value: String(userProfile.points), inline: true },
                    {
                        name: "Subscribed?",
                        value: userProfile.subscribed ? "Yes" : "No",
                        inline: true,
                    }
                )
                .setThumbnail(userProfile.avatar);

            await interaction.editReply({
                embeds: [rankEmbed],
            });
        } catch (error) {
            logger.error("Error in rank command:", error);
            await interaction.editReply({
                content: "An error occurred while processing your request.",
            });
        }
    }
}

export default RankCommand;