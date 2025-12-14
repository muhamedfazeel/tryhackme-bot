import { ButtonInteraction, MessageFlags } from "discord.js";
import { IComponent } from "../../../interfaces/component.interface";
import { Giveaway } from "../../../schemas/giveaway.schema";


const component: IComponent = {
    data: {
        name: "join-giveaway",
    },
    async execute(interaction: ButtonInteraction) {
        const userId: string = interaction.user.id;
        const messageId: string = interaction.message.id;

        const giveaway = await Giveaway.findOne({ messageId: messageId });

        if (!giveaway) {
            await interaction.reply({
                content: "This giveaway does not exist or has ended.",
                flags: [MessageFlags.Ephemeral],
            });
            return;
        }

        if (giveaway.participants.includes(userId)) {
            await interaction.reply({
                content: "You have already joined this giveaway!",
                flags: [MessageFlags.Ephemeral],
            });
            return;
        }

        giveaway.participants.push(userId);
        await giveaway.save();

        await interaction.reply({
            content: "You have successfully joined the giveaway!",
            flags: [MessageFlags.Ephemeral],
        });
    },
};

export default component;
