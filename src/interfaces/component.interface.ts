import { ButtonInteraction, Client } from "discord.js";

export interface IComponent {
    data: {
        name: string;
    };
    execute: (interaction: ButtonInteraction, client: Client) => Promise<void>;
}