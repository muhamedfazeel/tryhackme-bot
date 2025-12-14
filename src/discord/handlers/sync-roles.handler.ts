import { Guild, GuildMember } from "discord.js";
import config from "../../config/configuration";
import { Profile } from "../../schemas";
import { CustomLogger } from "../../shared/custom-logger";
import { fetchMember } from "../../shared/utils/member.utils";
import { THMClient } from "../../types/discord-client.type";
import { assignRoles } from "../../shared/utils/role.utils";
import { handleAPI } from "./api.handler";

const logger = new CustomLogger(__filename);

export default (client: THMClient): void => {

    client.syncRoles = async () => {
        const guild = client.guilds.cache.get(config.guildId);
        if (!guild) {
            logger.error(`Guild not found: ${config.guildId}`);
            return;
        }

        let profiles = [];
        try {
            profiles = await Profile.find();
        } catch (err) {
            logger.error("Failed to load user profiles:", err);
            return;
        }

        logger.info(`Syncing roles for ${profiles.length} users...`);

        for (const profile of profiles) {
            try {
                // Step 1: Ensure member exists in guild
                const member = await fetchMember(guild, profile.discordId);
                if (!member) {
                    await removeProfile(profile);
                    continue;
                }

                // Step 2: Skip if no token available
                if (!profile.token) continue;

                // Step 3: Fetch data from API
                const apiData = await handleAPI.get_token_data(profile.token);
                if (!isValidApiResponse(apiData)) {
                    logger.warn(`Invalid API response for ${profile.discordId}`);
                    continue;
                }

                // Step 4: Update profile if needed
                const hasUpdated = updateProfile(profile, apiData);
                if (hasUpdated) {
                    await profile.save();
                    logger.info(`Profile updated: ${profile.discordId}`);
                }

                // Step 5: Assign roles
                await assignRoles(member, apiData);

            } catch (err) {
                logger.error(`Error syncing profile ${profile.discordId}:`, err);
            }
        }

        logger.info("Role sync completed.");

        try {
            await client.updateStats();
        } catch (error) {
            logger.error("Failed to update stats:", error);
        }
    };
};

// ------------------------
// Helper: remove profile
// ------------------------
async function removeProfile(profile: any) {
    await Profile.findOneAndDelete({ discordId: profile.discordId });
    logger.info(`Removed stale profile: ${profile.discordId}`);
}

// ------------------------
// Helper: API validation
// ------------------------
function isValidApiResponse(data: any): boolean {
    return (
        data &&
        data.success === true &&
        typeof data.username === "string"
    );
}

// ------------------------
// Helper: Profile update
// ------------------------
function updateProfile(profile: any, apiData: any) {
    const { username, subscribed, usersRank, points, level, avatar } = apiData;

    const before = profile.toObject();

    profile.username = username;
    profile.subscribed = !!subscribed;
    profile.level = level;
    profile.avatar = avatar;

    // Check for changes AFTER modification
    return profile.isModified();
}
