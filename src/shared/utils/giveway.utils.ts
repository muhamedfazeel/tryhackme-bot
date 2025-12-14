import { ActionRowBuilder, ButtonBuilder, ButtonStyle, TextChannel } from "discord.js";
import { Giveaway } from "../../schemas";
import { CustomLogger } from "../custom-logger";
import { THMClient } from "../../types/discord-client.type";
import config from "../../config/configuration";

const logger = new CustomLogger(__filename);

function selectRandomWinners(participants: any[], winnersCount: number) {
  const shuffled = participants.sort(() => 0.5 - Math.random());
  // Select up to the number of winners or all participants if fewer than desired winners
  return shuffled.slice(0, Math.min(winnersCount, participants.length));
}

export async function checkGiveaways(client: THMClient) {
  try {
    const now = new Date();
    const giveaways = await Giveaway.find({
      endDate: { $lte: now },
      concluded: { $ne: true },
    });

    giveaways.forEach(async (giveaway: { _id: any; concluded: boolean; save: () => any; }) => {
      await endGiveaway(client, giveaway._id, true);
      logger.info(`Giveaway ended for giveaway ID: ${giveaway._id}`);
      // Update the giveaway as concluded
      giveaway.concluded = true;
      await giveaway.save();
    });
  } catch (err) {
    logger.error("Error checking giveaways:", err);
  }
}

export async function endGiveaway(client: THMClient, id: any, announce: any) {
  try {
    const giveaway = await Giveaway.findById(id);
    if (!giveaway) {
      const msg = `Giveaway with ID ${id} not found.`;
      logger.error(msg);
      throw new Error(msg);
    }

    // Check if the giveaway has already concluded
    if (giveaway.concluded) {
      logger.info(`Giveaway with ID ${id} has already concluded.`);
      return;
    }

    const channel = await client.channels.fetch(
      config.channels.communityAnnouncements
    );
    if (!channel) {
      const msg = `Channel with ID ${config.channels.communityAnnouncements} not found.`;
      logger.error(msg);
      throw new Error(msg);
    }

    if (!(channel instanceof TextChannel)) {
      const msg = `Channel ${config.channels.communityAnnouncements} is not a text channel and cannot contain messages.`;
      logger.error(msg);
      throw new Error(msg);
    }

    if (!giveaway.messageId) {
      logger.error(`Giveaway ${id} does not have a messageId.`);
      return;
    }
    const message = await channel.messages.fetch(giveaway.messageId);

    const disabledButton = new ButtonBuilder()
      .setCustomId("join-giveaway")
      .setLabel("Join Giveaway")
      .setStyle(ButtonStyle.Primary)
      .setDisabled(true);

    const newRow = new ActionRowBuilder<ButtonBuilder>().addComponents(disabledButton);
    await message.edit({ components: [newRow] });

    // Select winners
    const winners = selectRandomWinners(
      giveaway.participants,
      giveaway.winners
    );
    let winnersMention =
      winners.length > 0
        ? winners.map((winner) => `<@${winner}>`).join(", ")
        : "No winners, not enough participants.";

    // Announce winners if required
    if (announce) {
      channel.send(
        `The giveaway is over!\n\nHere are the winners:\n${winnersMention}`
      );
    }

    // Update the giveaway as concluded in the database
    giveaway.concluded = true;
    await giveaway.save();
  } catch (error) {
    logger.error("Error in giveawayEnd function:", error);
  }
}