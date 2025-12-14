import * as dotenv from 'dotenv';
import { IConfig, IEnvConfig } from '../interfaces/config.interface';

dotenv.config();

const env = process.env as unknown as IEnvConfig;

if (!env.BOT_TOKEN || !env.CLIENT_ID) {
    throw new Error(
        'Missing required environment variables: BOT_TOKEN or CLIENT_ID'
    );
}

const config: IConfig = {
    bot: {
        token: env.BOT_TOKEN!,
        clientId: env.CLIENT_ID!,
    },
    guildId: env.GUILD_ID!,
    mongo: {
        uri: env.MONGODB_URI!,
    },
    intercom: {
        token: env.INTERCOM_TOKEN,
    },
    users: {
        developerId: env.BOT_DEVELOPER_ID!,
    },
    roles: {
        owner: env.OWNER_ROLE_ID!,
        admin: env.ADMIN_ROLE_ID!,
        moderator: env.MODERATOR_ROLE_ID!,
        subscriber: env.SUBSCRIBER_ROLE_ID!,
        verified: env.VERIFIED_ROLE_ID!,
        announcements: env.ANNOUNCEMENTS_ROLE_ID!,
        levels: {
            event: env.LEVEL_EVENT!,
            bugHunter: env.LEVEL_BUG_HUNTER!,
            contributor: env.LEVEL_CONTRIBUTOR!,
            level21: env.LEVEL_21!,
            level20: env.LEVEL_20!,
            level19: env.LEVEL_19!,
            level18: env.LEVEL_18!,
            level17: env.LEVEL_17!,
            level16: env.LEVEL_16!,
            level15: env.LEVEL_15!,
            level14: env.LEVEL_14!,
            level13: env.LEVEL_13!,
            level12: env.LEVEL_12!,
            level11: env.LEVEL_11!,
            level10: env.LEVEL_10!,
            level9: env.LEVEL_9!,
            level8: env.LEVEL_8!,
            level7: env.LEVEL_7!,
            level6: env.LEVEL_6!,
            level5: env.LEVEL_5!,
            level4: env.LEVEL_4!,
            level3: env.LEVEL_3!,
            level2: env.LEVEL_2!,
            level1: env.LEVEL_1!,
        },
    },
    channels: {
        botLogging: env.BOT_LOGGING!,
        communityAnnouncements: env.COMMUNITY_ANNOUNCEMENTS!,
        thmUsers: env.THM_USERS,
        thmRooms: env.THM_ROOMS,
        discordUsers: env.DISCORD_USERS,
        botCommands: env.BOT_COMMANDS,
    },
};

export default config;