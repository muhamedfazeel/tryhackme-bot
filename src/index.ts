import mongoose from "mongoose";
import config from "./config/configuration";
import { CustomLogger } from "./shared/custom-logger";
import { THMClient } from "./types/discord-client.type";
import { loadCommands } from "./discord/handlers/command.handler";
import { registerClientEvents } from "./discord/handlers/events.handler";
import { registerComponents } from "./discord/handlers/components.handler";

const logger = new CustomLogger(__filename);
const client = THMClient.getInstance();

(async () => {
    try {
        // Load commands
        logger.info("📥 Loading Commands...");
        await loadCommands(client);

        // Connect MongoDB
        logger.info("Connecting to MongoDB...");
        await mongoose.connect(config.mongo.uri);
        logger.info("✅ MongoDB connection successful.");

        // Register events
        logger.info("⬆ Registering events...");
        await registerClientEvents(client);

        // Register components
        logger.info("📦 Registering components...");
        await registerComponents(client);

        // Set REST token before login
        client.rest.setToken(config.bot.token);

        logger.info("🔌 Logging into Discord...");
        await client.login(config.bot.token);

    } catch (error) {
        logger.error("❌ Startup failure:", error);
        process.exit(1);
    }
})();

// ------------------------------------
// GLOBAL ERROR HANDLING
// ------------------------------------
client.on("error", (err) => logger.error(`Client Error: ${err.message}`));
client.on("warn", (warn) => logger.warn(`Warning: ${warn}`));

process.on("unhandledRejection", (reason) =>
    logger.error("🚨 Unhandled Promise Rejection:", reason)
);

process.on("uncaughtException", (error) =>
    logger.error("🔥 Uncaught Exception:", error)
);