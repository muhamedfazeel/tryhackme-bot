import { join } from "node:path";
import { readdirSync } from "node:fs";
import { AsciiTable3 } from "ascii-table3";
import { CustomLogger } from "../../shared/custom-logger";
import { THMClient } from "../../types/discord-client.type";

const logger = new CustomLogger(__filename);

export const registerComponents = async (client: THMClient) => {
    const table = new AsciiTable3().setHeading("Component", "Status", "Type");
    const basePath = join(__dirname, "../components");

    try {
        const folders = readdirSync(basePath);

        for (const category of folders) {
            const categoryPath = join(basePath, category);
            const files = readdirSync(categoryPath)
                .filter((f) => f.endsWith(".ts") || f.endsWith(".js"));

            for (const file of files) {
                const filePath = join(categoryPath, file);

                try {
                    const module = await import(filePath);
                    const component = module.default;

                    if (!component || !component.data) {
                        logger.error(`Invalid component in ${filePath}`);
                        table.addRow(file, "❌", category);
                        continue;
                    }

                    switch (category) {
                        case "buttons":
                            client.buttons.set(component.data.name, component);
                            table.addRow(file, "✅", "Button");
                            break;

                        case "dropdowns":
                            client.dropdowns.set(component.data.id, component);
                            table.addRow(file, "✅", "Dropdown");
                            break;

                        case "modals":
                            client.modals.set(component.data.id, component);
                            table.addRow(file, "✅", "Modal");
                            break;

                        default:
                            table.addRow(file, "⚠️", "Unknown");
                            break;
                    }

                } catch (err) {
                    logger.error(`Failed to load component: ${file}`, err);
                    table.addRow(file, "❌", category);
                }
            }
        }

        logger.info("\n" + table.toString());
        logger.info("All components loaded successfully.");

    } catch (err) {
        logger.error("Failed to register components:", err);
    }
};
