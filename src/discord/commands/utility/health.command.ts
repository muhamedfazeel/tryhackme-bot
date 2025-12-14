import {
    ChatInputCommandInteraction,
    SlashCommandBuilder,
    EmbedBuilder
} from "discord.js";
import { ICommand } from "../../../interfaces/command.interface";
import os from "node:os";
import mongoose from "mongoose";
import { COMMAND_CATEGORY, COMMAND_SCOPE } from "../../../shared/constants";

function formatBytes(bytes: number) {
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

const HealthCommand: ICommand = {
    category: COMMAND_CATEGORY.UTIL,
    scope: COMMAND_SCOPE.APPLICATION,
    command: true,
    data: new SlashCommandBuilder()
        .setName("health")
        .setDescription("Displays health and performance statistics for the bot"),

    async execute(interaction: ChatInputCommandInteraction, client) {
        await interaction.deferReply();

        // CPU Load
        const cpus = os.cpus();
        const cpuLoad =
            cpus
                .map((cpu) => cpu.times.user + cpu.times.nice + cpu.times.sys + cpu.times.irq)
                .reduce((a, b) => a + b, 0) /
            cpus.length;

        // Memory
        const memoryUsage = process.memoryUsage();

        // Uptime
        const uptime = process.uptime();
        const uptimeFormatted = `${Math.floor(uptime / 3600)}h ${Math.floor(
            (uptime % 3600) / 60
        )}m`;

        // DB
        const dbState = mongoose.connection.readyState;
        const dbStatus = ["Disconnected", "Connected", "Connecting", "Disconnecting"][dbState];

        const embed = new EmbedBuilder()
            .setTitle("📊 Bot Health Dashboard")
            .setColor("#34eb95")
            .setFields(
                {
                    name: "🧠 Memory Usage",
                    value: `
                        **RSS:** ${formatBytes(memoryUsage.rss)}
                        **Heap Used:** ${formatBytes(memoryUsage.heapUsed)}
                        **Heap Total:** ${formatBytes(memoryUsage.heapTotal)}
                    `,
                    inline: true,
                },
                {
                    name: "⚙ CPU Load",
                    value: `${cpuLoad.toFixed(2)} ms`,
                    inline: true,
                },
                {
                    name: "📡 WebSocket Ping",
                    value: `${client.ws.ping}ms`,
                    inline: true,
                },
                {
                    name: "🏢 Guild Members",
                    value: `${interaction.guild?.memberCount ?? "N/A"}`,
                    inline: true,
                },
                {
                    name: "🗄 Database",
                    value: `${dbStatus}`,
                    inline: true,
                },
                {
                    name: "⏱ Bot Uptime",
                    value: uptimeFormatted,
                    inline: true,
                }
            )
            .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
    }
};

export default HealthCommand;
