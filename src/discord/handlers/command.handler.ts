import { join } from "node:path";
import { AsciiTable3 } from "ascii-table3";
import { readdirSync, statSync } from "node:fs";
import { CustomLogger } from "../../shared/custom-logger";
import { THMClient } from "../../types/discord-client.type";

const logger = new CustomLogger(__filename);

export const loadCommands = async (client: THMClient) => {
    const table = new AsciiTable3().setHeading("Command", "Scope", "Status");
    const commandsRoot = join(__dirname, "../commands");

    logger.info("Loading Application (/) commands...");

    const folders = readdirSync(commandsRoot)
        .filter(dir => statSync(join(commandsRoot, dir)).isDirectory());

    for (const folder of folders) {
        const folderPath = join(commandsRoot, folder);
        const files = readdirSync(folderPath).filter(f => f.endsWith(".ts") || f.endsWith(".js"));

        for (const file of files) {
            const filePath = join(folderPath, file);

            try {
                const module = await import(filePath);
                const command = module.default;

                if (!command?.command) continue;
                if (!command.data || !command.execute) {
                    logger.warn(`Invalid command: ${filePath}`);
                    continue;
                }

                client.commands.set(command.data.name, command);
                client.commandArray.push(command.data.toJSON());

                table.addRow(command.data.name, command.scope, "✅");
            } catch (err) {
                logger.error(`Failed loading command: ${filePath}`, err);
            }
        }
    }

    logger.info("\n" + table.toString());
};