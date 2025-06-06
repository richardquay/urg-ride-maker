import { SlashCommandBuilder, ChatInputCommandInteraction, PermissionFlagsBits, ChannelType, EmbedBuilder } from 'discord.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const data = new SlashCommandBuilder()
    .setName('urg-settings')
    .setDescription('Configure bot settings')
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
    .addSubcommand(subcommand =>
        subcommand
            .setName('channels')
            .setDescription('Configure ride type channels')
            .addStringOption(option =>
                option.setName('type')
                    .setDescription('The type of ride')
                    .setRequired(true)
                    .addChoices(
                        { name: 'Road', value: 'ROAD' },
                        { name: 'Gravel', value: 'GRAVEL' },
                        { name: 'Mountain', value: 'MOUNTAIN' },
                        { name: 'Social', value: 'SOCIAL' },
                        { name: 'Virtual', value: 'VIRTUAL' },
                        { name: 'Race', value: 'RACE' }
                    ))
            .addChannelOption(option =>
                option.setName('channel')
                    .setDescription('The channel for this ride type')
                    .addChannelTypes(ChannelType.GuildText)
                    .setRequired(true)));

export async function execute(interaction) {
    console.log('urg-settings command invoked', { guildId: interaction.guildId, user: interaction.user?.id });
    if (!interaction.guildId) {
        await interaction.reply({
            content: 'This command can only be used in a server.',
            ephemeral: true
        });
        return;
    }

    const subcommand = interaction.options.getSubcommand();
    console.log('Subcommand:', subcommand);

    if (subcommand === 'channels') {
        const type = interaction.options.getString('type', true);
        const channel = interaction.options.getChannel('channel', true);
        console.log('Channel config requested', { type, channelId: channel?.id });

        try {
            await interaction.deferReply({ ephemeral: true });
            // Get or create guild settings
            const guild = await prisma.guild.upsert({
                where: { id: interaction.guildId },
                update: {},
                create: { id: interaction.guildId }
            });

            // Update the channel mapping
            const updateData = {};
            switch (type) {
                case 'ROAD':
                    updateData.roadChannelId = channel.id;
                    break;
                case 'GRAVEL':
                    updateData.gravelChannelId = channel.id;
                    break;
                case 'MOUNTAIN':
                    updateData.mtbChannelId = channel.id;
                    break;
                case 'SOCIAL':
                    updateData.socialChannelId = channel.id;
                    break;
                case 'VIRTUAL':
                    updateData.virtualChannelId = channel.id;
                    break;
                case 'RACE':
                    updateData.raceChannelId = channel.id;
                    break;
            }

            await prisma.guild.update({
                where: { id: interaction.guildId },
                data: updateData
            });

            // Create embed showing current channel mappings
            const updatedGuild = await prisma.guild.findUnique({
                where: { id: interaction.guildId }
            });

            const embed = new EmbedBuilder()
                .setTitle('Channel Configuration')
                .setColor(0x0099FF)
                .setDescription('Current channel mappings for ride types:')
                .addFields(
                    { 
                        name: 'Road Rides', 
                        value: updatedGuild?.roadChannelId ? `<#${updatedGuild.roadChannelId}>` : 'Not configured',
                        inline: true 
                    },
                    { 
                        name: 'Gravel Rides', 
                        value: updatedGuild?.gravelChannelId ? `<#${updatedGuild.gravelChannelId}>` : 'Not configured',
                        inline: true 
                    },
                    { 
                        name: 'Mountain Rides', 
                        value: updatedGuild?.mtbChannelId ? `<#${updatedGuild.mtbChannelId}>` : 'Not configured',
                        inline: true 
                    },
                    { 
                        name: 'Social Rides', 
                        value: updatedGuild?.socialChannelId ? `<#${updatedGuild.socialChannelId}>` : 'Not configured',
                        inline: true 
                    },
                    { 
                        name: 'Virtual Rides', 
                        value: updatedGuild?.virtualChannelId ? `<#${updatedGuild.virtualChannelId}>` : 'Not configured',
                        inline: true 
                    },
                    { 
                        name: 'Race Events', 
                        value: updatedGuild?.raceChannelId ? `<#${updatedGuild.raceChannelId}>` : 'Not configured',
                        inline: true 
                    }
                );

            await interaction.editReply({ embeds: [embed] });
            console.log('Channel configuration updated successfully');

        } catch (error) {
            console.error('Error updating channel configuration:', error);
            // Try to reply or edit the reply depending on state
            try {
                if (interaction.deferred || interaction.replied) {
                    await interaction.editReply({
                        content: 'There was an error updating the channel configuration. Please try again.',
                        embeds: [],
                        ephemeral: true
                    });
                } else {
                    await interaction.reply({
                        content: 'There was an error updating the channel configuration. Please try again.',
                        ephemeral: true
                    });
                }
            } catch (err) {
                console.error('Failed to send error reply:', err);
            }
        }
    }
} 