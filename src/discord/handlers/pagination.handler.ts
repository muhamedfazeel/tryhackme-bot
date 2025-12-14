import {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    EmbedBuilder,
    ComponentType,
    ButtonInteraction,
    ChatInputCommandInteraction,
    ColorResolvable,
} from "discord.js";
import { THMClient } from "../../types/discord-client.type";

export default (client: THMClient): void => {
    client.paginationEmbed = async (
        interaction: ChatInputCommandInteraction,
        fields: { name: string; value: string }[],
        options: { maxPerPage?: number; color?: string; title?: string } = {}
    ) => {
        const maxPerPage = options.maxPerPage ?? 5;
        const color = options.color ?? "#8AC7DB";
        const title = options.title ?? "";

        let page = 1;
        const totalPages = Math.ceil(fields.length / maxPerPage);

        // Generate a unique pagination ID
        const sessionId = `${interaction.id}-${Date.now()}`;

        const buildRow = (currentPage: number) =>
            new ActionRowBuilder<ButtonBuilder>().addComponents(
                new ButtonBuilder()
                    .setCustomId(`prev-${sessionId}`)
                    .setLabel("Previous")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(currentPage === 1),
                new ButtonBuilder()
                    .setCustomId(`next-${sessionId}`)
                    .setLabel("Next")
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(currentPage === totalPages)
            );

        const buildEmbed = (page: number) => {
            const start = (page - 1) * maxPerPage;
            const end = start + maxPerPage;

            return new EmbedBuilder()
                .setColor(color as ColorResolvable)
                .setTitle(`${title} - Page ${page}/${totalPages}`)
                .addFields(fields.slice(start, end));
        };

        await interaction.reply({
            embeds: [buildEmbed(page)],
            components: [buildRow(page)],
            withResponse: true,
        })
        const message = await interaction.fetchReply();

        const collector = message.createMessageComponentCollector({
            componentType: ComponentType.Button,
            filter: (i) => i.user.id === interaction.user.id,
            time: 30000,
        });

        collector.on("collect", async (btn: ButtonInteraction) => {
            if (btn.customId === `prev-${sessionId}`) page--;
            if (btn.customId === `next-${sessionId}`) page++;

            await btn.update({
                embeds: [buildEmbed(page)],
                components: [buildRow(page)],
            });
        });

        collector.on("end", async () => {
            await message.edit({
                components: [
                    new ActionRowBuilder<ButtonBuilder>().addComponents(
                        new ButtonBuilder()
                            .setCustomId(`prev-${sessionId}`)
                            .setLabel("Previous")
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(true),
                        new ButtonBuilder()
                            .setCustomId(`next-${sessionId}`)
                            .setLabel("Next")
                            .setStyle(ButtonStyle.Primary)
                            .setDisabled(true)
                    ),
                ],
            });
        });
    };
};
