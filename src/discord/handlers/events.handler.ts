import { join } from "node:path";
import { readdirSync } from "node:fs";
import { CustomLogger } from "../../shared/custom-logger";
import { THMClient } from "../../types/discord-client.type";
import { AsciiTable3 } from "ascii-table3";

const logger = new CustomLogger(__filename);

export const registerClientEvents = async (client: THMClient) => {
    const table = new AsciiTable3().setHeading("Event", "Status");
    const eventsPath = join(__dirname, "../events");

    let eventFiles: string[] = [];

    try {
        eventFiles = readdirSync(eventsPath).filter(
            (file) => file.endsWith(".ts") || file.endsWith(".js")
        );
    } catch (err) {
        logger.error("Failed to read events directory:", err);
        return;
    }

    logger.info(`Found ${eventFiles.length} event files.`);

    for (const file of eventFiles) {
        const filePath = join(eventsPath, file);

        try {
            const eventModule = await import(filePath);
            const event = eventModule.default;

            if (!event || !event.name || !event.execute) {
                logger.error(`Invalid event structure in: ${file}`);
                continue;
            }

            const handler = (...args: unknown[]) => event.execute(client, ...args);

            if (event.once) {
                client.once(event.name, handler);
            } else {
                client.on(event.name, handler);
            }

            table.addRow(event.label ?? event.name, "✅");
            logger.info(`Loaded event: ${event.label ?? event.name}`);

        } catch (err) {
            logger.error(`Failed to load event file "${file}"`, err);
            table.addRow(file, "❌");
        }
    }

    logger.info("\n" + table.toString());
    logger.info(`Successfully loaded ${eventFiles.length} events.`);
};
