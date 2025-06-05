import { ModalSubmitInteraction } from 'discord.js';
import { PrismaClient } from '@prisma/client';
import { validateLocationUrl } from '../utils/locationUtils';

const prisma = new PrismaClient();

export const name = 'modalSubmit';
export const once = false;

export async function execute(interaction: ModalSubmitInteraction) {
    if (interaction.customId === 'location-modal') {
        try {
            const locationName = interaction.fields.getTextInputValue('locationName');
            const locationUrl = interaction.fields.getTextInputValue('locationUrl');

            if (!validateLocationUrl(locationUrl)) {
                await interaction.reply({
                    content: 'Please provide a valid URL for the location.',
                    ephemeral: true
                });
                return;
            }

            // Store the custom location in the database
            // TODO: Implement custom location storage

            await interaction.reply({
                content: 'Custom location details received. Please use the `/create-ride` command again with your custom location.',
                ephemeral: true
            });
        } catch (error) {
            console.error('Error handling location modal:', error);
            await interaction.reply({
                content: 'Sorry, there was an error processing your location details. Please try again.',
                ephemeral: true
            });
        }
    }
} 