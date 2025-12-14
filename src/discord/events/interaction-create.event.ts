import {
	Events,
	Interaction,
	InteractionType,
} from "discord.js";

import { THMClient } from "../../types/discord-client.type";
import { CustomLogger } from "../../shared/custom-logger";
import { handleCommandError } from "../../shared/utils/error.utils";
import { safeReply } from "../../shared/utils/reply.utils";

const logger = new CustomLogger(__filename);

export default {
	name: Events.InteractionCreate,
	label: "Interaction Create",

	async execute(client: THMClient, interaction: Interaction) {
		const start = performance.now();

		// Helper to safely identify interaction
		const resolveInteractionName = () => {
			if (interaction.isChatInputCommand()) return `Command:/${interaction.commandName}`;
			if (interaction.isButton()) return `Button:${interaction.customId}`;
			if (interaction.isStringSelectMenu()) return `Dropdown:${interaction.customId}`;
			if (interaction.type === InteractionType.ModalSubmit) return `Modal:${interaction.customId}`;
			if (interaction.isContextMenuCommand()) return `Context:${interaction.commandName}`;
			if (interaction.type === InteractionType.ApplicationCommandAutocomplete)
				return `Autocomplete:${interaction.commandName}`;
			return "Unknown Interaction";
		};

		try {
			// Slash Commands
			if (interaction.isChatInputCommand()) {
				const command = client.commands.get(interaction.commandName);

				if (!command) return safeReply(interaction, "Command not found.");

				try {
					await command.execute(interaction, client);
				} catch (err) {
					return handleCommandError(interaction, err, `Command: ${interaction.commandName}`);
				}
			}

			// Buttons
			else if (interaction.isButton()) {
				const button = client.buttons.get(interaction.customId);

				if (!button) return safeReply(interaction, "Button not found.");

				try {
					await button.execute(interaction, client);
				} catch (err) {
					return handleCommandError(interaction, err, `Button: ${interaction.customId}`);
				}
			}

			// Dropdowns
			else if (interaction.isStringSelectMenu()) {
				const dropdown = client.dropdowns.get(interaction.customId);

				if (!dropdown) return safeReply(interaction, "Dropdown not found.");

				try {
					await dropdown.execute(interaction, client);
				} catch (err) {
					return handleCommandError(interaction, err, `Dropdown: ${interaction.customId}`);
				}
			}

			// Autocomplete
			else if (interaction.type === InteractionType.ApplicationCommandAutocomplete) {
				const command = client.commands.get(interaction.commandName);
				if (!command?.autocomplete) return;

				try {
					await command.autocomplete(interaction, client);
				} catch (err) {
					logger.error("Autocomplete Error:", err);
				}
			}

			// Modals
			else if (interaction.type === InteractionType.ModalSubmit) {
				const modal = client.modals.get(interaction.customId);

				if (!modal) return safeReply(interaction, "Modal not found.");

				try {
					await modal.execute(interaction, client);
				} catch (err) {
					return handleCommandError(interaction, err, `Modal: ${interaction.customId}`);
				}
			}

			// Context Menus
			else if (interaction.isContextMenuCommand()) {
				const contextCmd = client.commands.get(interaction.commandName);

				if (!contextCmd) return safeReply(interaction, "Context command not found.");

				try {
					await contextCmd.execute(interaction, client);
				} catch (err) {
					return handleCommandError(interaction, err, `Context: ${interaction.commandName}`);
				}
			}

		} finally {
			// ⏱ Slow execution logger
			const end = performance.now();
			const duration = Math.round(end - start);

			if (duration > 2000) {
				logger.warn(`⚠ Slow Interaction (${duration}ms): ${resolveInteractionName()}`);
			}
		}
	}
};
