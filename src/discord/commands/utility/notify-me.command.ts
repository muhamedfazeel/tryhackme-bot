import { CommandInteraction, SlashCommandBuilder } from "discord.js";
import { ICommand } from "../../../interfaces/command.interface";
import { COMMAND_CATEGORY, COMMAND_SCOPE } from "../../../shared/constants";
import { THMClient } from "../../../types/discord-client.type";
import config from "../../../config/configuration";
import { CustomLogger } from "../../../shared/custom-logger";

const logger = new CustomLogger(__filename);

const NotifyMeCommand: ICommand = {
    category: COMMAND_CATEGORY.UTIL,
    scope: COMMAND_SCOPE.APPLICATION,
    command: true,

    data: new SlashCommandBuilder()
        .setName("notifyme")
        .setDescription("Toggle announcements notifications."),

    execute: async (interaction: CommandInteraction, client: THMClient): Promise<void> => {
        try {
            const roleID = config.roles.announcements;

            if (!roleID) {
                logger.info("ANNOUNCEMENTS_ROLE_ID is not set.");
                await interaction.reply({
                    content: "Announcements role is not configured.",
                    ephemeral: true,
                });
                return;
            }

            const member = await interaction.guild?.members.fetch(interaction.user.id);

            if (!member) {
                await interaction.reply({
                    content: "Member could not be found. Try again shortly.",
                    ephemeral: true,
                });
                return;
            }

            let content: string;

            if (member.roles.cache.has(roleID)) {
                await member.roles.remove(roleID);
                content = "You will no longer receive announcements.";
            } else {
                await member.roles.add(roleID);
                content = "You will now receive announcements.";
            }

            await interaction.reply({
                content,
                ephemeral: true,
            });
        } catch (error) {
            logger.error("Error in notifyme command:", error);

            // Handle case where reply already exists
            if (interaction.replied || interaction.deferred) {
                await interaction.followUp({
                    content: "An error occurred while processing your request.",
                    ephemeral: true,
                });
            } else {
                await interaction.reply({
                    content: "An error occurred while processing your request.",
                    ephemeral: true,
                });
            }
        }
    }
};

export default NotifyMeCommand;
