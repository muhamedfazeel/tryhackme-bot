import { Guild, GuildMember } from "discord.js";
import { CustomLogger } from "../custom-logger";

const logger = new CustomLogger(__filename);;

export async function fetchMember(guild: Guild, discordId: string): Promise<GuildMember | null> {
    try {
        return guild.members.fetch(discordId);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger.error(`Error fetching member with ID ${discordId}: ${errorMessage}`);
        return null;
    }
}