import { ChatInputCommandInteraction, Guild, SlashCommandBuilder } from "discord.js";
import { ICommand } from "../../../interfaces/command.interface";
import { COMMAND_CATEGORY, COMMAND_SCOPE } from "../../../shared/constants";
import { THMClient } from "../../../types/discord-client.type";
import config from "../../../config/configuration";
import { Profile } from "../../../schemas";
import { fetchMember } from "../../../shared/utils/member.utils";
import { assignRoles } from "../../../shared/utils/role.utils";
import { CustomLogger } from "../../../shared/custom-logger";
import { handleAPI } from "../../handlers/api.handler";

const logger = new CustomLogger(__filename);

const VerifyCommand: ICommand = {
    category: COMMAND_CATEGORY.UTIL,
    scope: COMMAND_SCOPE.APPLICATION,
    command: true,
    data: new SlashCommandBuilder()
        .setName("verify")
        .setDescription("Syncs your TryHackMe site account to Discord")
        .addStringOption((option) =>
            option
                .setName("token")
                .setDescription(
                    "Use your Discord token from https://tryhackme.com/profile"
                )
                .setRequired(true)
        ),
    execute: async (interaction: ChatInputCommandInteraction, client: THMClient) => {
        await interaction.deferReply({ ephemeral: true });

        const token: string = interaction.options.getString("token") as string;
        const guild: Guild = client.guilds.cache.get(config.guildId) as Guild;
        const discordId = interaction.user.id;

        let userDiscordProfile = await Profile.findOne({ discordId });
        if (userDiscordProfile && userDiscordProfile.token !== token) {
            await interaction.editReply({
                content:
                    "Your Discord account is already linked with a token. If you wish to update your token, please contact a moderator.",
            });

            return;
        }

        let tokenProfile = await Profile.findOne({ token });
        if (tokenProfile && tokenProfile.discordId !== discordId) {
            await interaction.editReply({
                content: "This token is already in use by another account.",
            });

            return
        }

        const userApiData = await handleAPI
            .get_token_data(token)
            .catch(async (error) => {
                logger.error("Received invalid data from the API:", error);
                await interaction.editReply({
                    content:
                        "Failed to verify your account. Please ensure your token is correct.",
                });

                return;
            });

        if (!userApiData || !userApiData.success) {
            await interaction.editReply({
                content:
                    "Failed to verify your account. Please ensure your token is correct.",
            });

            return;
        }

        let userProfile = userDiscordProfile || new Profile({ discordId });
        userProfile = updateUserProfile(userProfile, userApiData, token);
        await userProfile.save().catch(logger.error);

        const member = await fetchMember(guild, discordId);
        if (member) {
            assignRoles(member, userProfile);
        }

        await interaction.editReply({
            content: "Your account has been updated and verified!",
        });
    },
};

function updateUserProfile(userProfile: any, userApiData: any, token: string) {
    userProfile.username = userApiData.username;
    userProfile.token = token;
    userProfile.subscribed = userApiData.subscribed === 1;
    userProfile.level = userApiData.level;
    userProfile.avatar = userApiData.avatar;

    return userProfile;
}


export default VerifyCommand;