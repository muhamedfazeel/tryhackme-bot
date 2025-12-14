import { Client, Collection, GatewayIntentBits, REST } from 'discord.js'; // Ensure you import necessary components
import { ICommand } from '../interfaces/command.interface';

export class THMClient extends Client {
  public commands: Collection<string, ICommand>;
  public buttons: Collection<string, any>;
  public dropdowns: Collection<string, any>;
  public modals: Collection<string, any>;
  public pages: Map<string, any>;
  public commandArray: Array<Record<string, any>>;
  public rest: REST;

  public handleCommands: () => Promise<void> = async () => { };
  public handleEvents: () => Promise<void> = async () => { };
  public handleComponents: () => Promise<void> = async () => { };
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
    this.commandArray = [];

    // Initialise REST
    this.rest = new REST({ version: '10' })
  }

  // Static method to get the singleton instance
  public static getInstance(): THMClient {
    if (!this.instance) this.instance = new THMClient();
    return this.instance;
  }
}