import { CommandInteraction, EmbedBuilder, SlashCommandBuilder } from "discord.js";
import { ICommand } from "../../../interfaces/command.interface";
import { COMMAND_CATEGORY, COMMAND_SCOPE } from "../../../shared/constants";
import { THMClient } from "../../../types/discord-client.type";

const HelpCommand: ICommand = {
    category: COMMAND_CATEGORY.UTIL,
    scope: COMMAND_SCOPE.APPLICATION,
    command: true,
    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("Information on how to use the bot!"),
    execute: async (interaction: CommandInteraction, client: THMClient) => {
        await interaction.deferReply({
            withResponse: true
        });

        const pingEmbed = new EmbedBuilder()
            .setTitle("Information")
            .setThumbnail(client.user?.displayAvatarURL() as string)
            .setTimestamp(Date.now())
            .setFields({
                name: "Discord Slash Commands",
                value: `https://support.discord.com/hc/en-us/articles/1500000368501-Slash-Commands-FAQ`,
            });

        await interaction.editReply({ embeds: [pingEmbed] });
    }
}

export default HelpCommand;