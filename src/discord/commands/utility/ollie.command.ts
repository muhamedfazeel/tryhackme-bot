import { ChatInputCommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { ICommand } from "../../../interfaces/command.interface";
import { COMMAND_CATEGORY, COMMAND_SCOPE } from "../../../shared/constants";
import { THMClient } from "../../../types/discord-client.type";
import { handleAPI } from "../../handlers/api.handler";

const OllieCommand: ICommand = {
    category: COMMAND_CATEGORY.UTIL,
    scope: COMMAND_SCOPE.APPLICATION,
    command: true,
    data: new SlashCommandBuilder()
        .setName("ollie")
        .setDescription("Retrieves a special picture"),
    execute: async (interaction: ChatInputCommandInteraction, client: THMClient) => {
        await interaction.deferReply();

        const pictureUrl = await handleAPI.get_ollie_picture();
        if (!pictureUrl) {
            await interaction.editReply("Failed to retrieve the picture.");
            return;
        }

        const ollieEmbed = new EmbedBuilder()
            .setTitle("Ollie")
            .setColor("#5865F2")
            .setImage(pictureUrl)
            .setAuthor({
                name: client?.user?.username as string,
                iconURL: client?.user?.displayAvatarURL(),
            })
            .setFooter({
                text: "Ollie Unix Montgomery - Rest in Peace, 5th of January, 2023",
            });

        await interaction.editReply({ embeds: [ollieEmbed] });
    }
}

export default OllieCommand;