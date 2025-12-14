import { ChatInputCommandInteraction, EmbedBuilder, MessageFlags, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import { COMMAND_CATEGORY, COMMAND_SCOPE } from "../../../shared/constants";
import { CustomLogger } from "../../../shared/custom-logger";
import { extname } from 'node:path';
import { ICommand } from "../../../interfaces/command.interface";
import { handleAPI } from "../../handlers/api.handler";
import sharp from "sharp";

const logger = new CustomLogger(__filename);

const NewRoomCommand: ICommand = {
    category: COMMAND_CATEGORY.ADMIN,
    // Disabling command
    command: false,
    scope: COMMAND_SCOPE.APPLICATION,
    data: new SlashCommandBuilder()
        .setName('newroom')
        .setDescription("Returns the API and Client latency")
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addStringOption((option) =>
            option
                .setName("code")
                .setDescription("the room that you want to announce")
                .setRequired(true)
        ),
    execute: async (interaction: ChatInputCommandInteraction, client: any) => {
        const hasPermission = await client.checkPermissions(
            interaction,
            "Administrator"
        );
        if (!hasPermission) return;

        await interaction.deferReply({
            flags: [MessageFlags.Ephemeral]
        });

        const code: string = interaction.options.getString("code") as string;
        let svg;

        const room = await handleAPI.get_room_data(code);

        logger.info(room);

        if (isSvgFile(room.image)) {
            sharp(room.data[code].image)
                .png()
                .toFile("recent_room_image.png", (err, info) => {
                    if (err) throw err;
                    logger.info("Image converted", info);
                });

            svg = true;
        } else {
            svg = false;
        }

        const pingEmbed = new EmbedBuilder()
            .setTitle("Pong!")
            .setImage(svg ? room.data[code].image : room.data[code].image)
            .setTimestamp(Date.now())
            .setFields({
                name: "API Latency",
                value: `ms`,
            });

        await interaction.editReply({ embeds: [pingEmbed] });
    },
};

function isSvgFile(filePath: any) {
    return extname(filePath).toLowerCase() === ".svg";
}


export default NewRoomCommand;