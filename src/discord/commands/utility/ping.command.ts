import { EmbedBuilder, SlashCommandBuilder, CommandInteraction } from "discord.js";
import { ICommand } from "../../../interfaces/command.interface";
import { COMMAND_CATEGORY, COMMAND_SCOPE } from "../../../shared/constants";

const PingCommand: ICommand = {
    category: COMMAND_CATEGORY.UTIL,
    scope: COMMAND_SCOPE.APPLICATION,
    command: true,

    data: new SlashCommandBuilder()
        .setName("ping")
        .setDescription("Returns the API and Client latency"),

    async execute(interaction: CommandInteraction, client) {
        const start = Date.now();

        await interaction.deferReply();

        const end = Date.now();
        const latency = end - start;
        const pingEmbed = new EmbedBuilder()
            .setTitle("Pong!")
            .setThumbnail(client.user.displayAvatarURL())
            .setTimestamp(Date.now())
            .addFields(
                {
                    name: "API Latency",
                    value: `${client.ws.ping}ms`,
                    inline: true,
                },
                {
                    name: "Client Latency",
                    value: `${latency}ms`,
                    inline: true,
                }
            );

        await interaction.editReply({ embeds: [pingEmbed] });
    },
};

export default PingCommand;
