import { CommandInteraction, Interaction, SlashCommandBuilder, SlashCommandOptionsOnlyBuilder, SlashCommandSubcommandsOnlyBuilder } from "discord.js";

export interface ICommand {
    category: string;
    command: boolean;
    scope: string;
    data: SlashCommandBuilder | SlashCommandSubcommandsOnlyBuilder | SlashCommandOptionsOnlyBuilder;
    execute(interaction: CommandInteraction, client: any): Promise<void>;
    // Optional autocomplete handler for slash command autocomplete interactions
    autocomplete?: (interaction: Interaction, client: any) => Promise<void>;
}
