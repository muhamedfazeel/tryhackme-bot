import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { ICommand } from "../../../interfaces/command.interface";
import { COMMAND_CATEGORY, COMMAND_SCOPE } from "../../../shared/constants";
import { THMClient } from "../../../types/discord-client.type";
import { CustomLogger } from "../../../shared/custom-logger";
import { handleAPI } from "../../handlers/api.handler";

const logger = new CustomLogger(__filename);

const DocsCommand: ICommand = {
    category: COMMAND_CATEGORY.UTIL,
    scope: COMMAND_SCOPE.APPLICATION,
    command: true,
    data: new SlashCommandBuilder()
        .setName("docs")
        .setDescription("Search for a document on our knowledge base")
        .addStringOption((option) =>
            option
                .setName("search")
                .setDescription("find an article by its title")
                .setRequired(true)
        )
        .addUserOption((option) =>
            option
                .setName("mention")
                .setDescription("Optionally mention a user with the response.")
                .setRequired(false)
        ),
    execute: async (interaction: ChatInputCommandInteraction, client: THMClient) => {
        await interaction.deferReply({});

        const user = interaction.options.getUser("mention");
        const search = interaction.options.getString("search");

        if (search && search.length > 100) {
            await interaction.editReply({
                content: "Your input exceeds the character limit. Please try again.",
            });

            return;
        }

        let article;
        try {
            article = await handleAPI.get_article_by_phrase(search as string);
        } catch (error) {
            logger.error("Error fetching article:", error);
            await interaction.editReply({
                content:
                    "An error occurred while fetching the article. Please try again later."
            });

            return;
        }

        if (article === null) {
            await interaction.editReply({
                content: "I could not find an article, please try again."
            });

            return;
        }

        const embed = new EmbedBuilder()
            .setTitle(article.title)
            .setThumbnail(client.user?.displayAvatarURL() as string)
            .setTimestamp(Date.now())
            .addFields({
                name: "Article Link",
                value: `${article.url}`,
            });

        const messageContent = user ? `${user}` : "";

        await interaction.editReply({ content: messageContent, embeds: [embed] });
    }
}

export default DocsCommand;