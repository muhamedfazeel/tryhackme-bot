import { Client, Collection, GatewayIntentBits } from 'discord.js'; // Ensure you import necessary components
import { IAPIHandlers } from '../interfaces/api-handlers.interface';
import { ICommand } from '../interfaces/command.interface';

export class THMClient extends Client {
  public commands: Collection<string, ICommand>;
  public buttons: Collection<string, any>;
  public dropdowns: Collection<string, any>;
  public modals: Collection<string, any>;
  public pages: Map<string, any>;

  public handleCommands: () => Promise<void> = async () => { };

  public handleEvents: () => Promise<void> = async () => { };

  public handleComponents: () => Promise<void> = async () => { };

  public handleAPI!: IAPIHandlers;

  public paginationEmbed: (interaction: any, fields: any[], options?: any) => Promise<void> = async () => { };

  public checkPermissions: (interaction: any, role: any, deferred?: any) => Promise<boolean> = async () => false;

  public updateStats: () => Promise<void> = async () => { };

  public syncRoles: () => Promise<void> = async () => { };

  private static instance?: THMClient;

  private constructor() {
    super({
      intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildModeration,
      ],
    });
    this.commands = new Collection();
    this.buttons = new Collection();
    this.dropdowns = new Collection();
    this.modals = new Collection();
    this.pages = new Map();
  }

  // Static method to get the singleton instance
  public static getInstance(): THMClient {
    if (!THMClient.instance) {
      THMClient.instance = new THMClient();
    }
    return THMClient.instance;
  }
}