export interface IEnvConfig {
	// Discord Bot
	BOT_TOKEN: string;
	CLIENT_ID: string;

	// Guild
	GUILD_ID: string;

	// MongoDB
	MONGODB_URI: string;

	// Intercom
	INTERCOM_TOKEN: string;

	// User IDs
	BOT_DEVELOPER_ID: string;

	// Role IDs
	VERIFIED_ROLE_ID: string;
	MODERATOR_ROLE_ID: string;
	ADMIN_ROLE_ID: string;
	OWNER_ROLE_ID: string;
	SUBSCRIBER_ROLE_ID: string;
	ANNOUNCEMENTS_ROLE_ID: string;

	// Level Role IDs
	LEVEL_EVENT: string;
	LEVEL_BUG_HUNTER: string;
	LEVEL_CONTRIBUTOR: string;
	LEVEL_21: string;
	LEVEL_20: string;
	LEVEL_19: string;
	LEVEL_18: string;
	LEVEL_17: string;
	LEVEL_16: string;
	LEVEL_15: string;
	LEVEL_14: string;
	LEVEL_13: string;
	LEVEL_12: string;
	LEVEL_11: string;
	LEVEL_10: string;
	LEVEL_9: string;
	LEVEL_8: string;
	LEVEL_7: string;
	LEVEL_6: string;
	LEVEL_5: string;
	LEVEL_4: string;
	LEVEL_3: string;
	LEVEL_2: string;
	LEVEL_1: string;

	// Channel IDs
	BOT_LOGGING: string;
	COMMUNITY_ANNOUNCEMENTS: string;
	THM_USERS: string;
	THM_ROOMS: string;
	DISCORD_USERS: string;
	BOT_COMMANDS: string;
}

interface IBotConfig {
	token: string; // BOT_TOKEN must be defined, or we can throw an error if missing
	clientId: string; // CLIENT_ID must be defined, or we can throw an error if missing
}

interface IMongoConfig {
	uri: string; // MONGODB_URI must be defined, or we can throw an error if missing
}

interface IIntercomConfig {
	token: string; // INTERCOM_TOKEN must be defined, or we can throw an error if missing
}

interface IUsersConfig {
	developerId: string; // BOT_DEVELOPER_ID must be defined, or we can throw an error if missing
}

interface ILevelsConfig {
	event: string;
	bugHunter: string;
	contributor: string;
	level21: string;
	level20: string;
	level19: string;
	level18: string;
	level17: string;
	level16: string;
	level15: string;
	level14: string;
	level13: string;
	level12: string;
	level11: string;
	level10: string;
	level9: string;
	level8: string;
	level7: string;
	level6: string;
	level5: string;
	level4: string;
	level3: string;
	level2: string;
	level1: string;
}

interface IRolesConfig {
	verified: string;
	moderator: string;
	admin: string;
	owner: string;
	subscriber: string;
	announcements: string;
	levels: ILevelsConfig;
}

interface IChannelsConfig {
	botLogging: string;
	communityAnnouncements: string;
	thmUsers: string;
	thmRooms: string;
	discordUsers: string;
	botCommands: string;
}

export interface IConfig {
	bot: IBotConfig;
	guildId: string;
	intercom: IIntercomConfig;
	mongo: IMongoConfig;
	users: IUsersConfig;
	roles: IRolesConfig;
	channels: IChannelsConfig;
}