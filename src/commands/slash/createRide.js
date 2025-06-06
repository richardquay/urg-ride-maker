import { SlashCommandBuilder, ChatInputCommandInteraction, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } from 'discord.js';
import { PrismaClient } from '@prisma/client';
import { parseDate, parseTime, calculateRolloutTime, formatDate } from '../../utils/dateTimeUtils.js';
import { parseDistance, formatDistance } from '../../utils/distanceUtils.js';
import { getLocationInfo, formatLocation, validateLocationUrl } from '../../utils/locationUtils.js';

const prisma = new PrismaClient();

export const data = new SlashCommandBuilder()
    .setName('create-ride')
    .setDescription('Create a new cycling ride')
    // Required options first
    .addStringOption(option =>
        option.setName('vibe')
            .setDescription('The vibe of the ride')
            .setRequired(true)
            .addChoices(
                { name: '🌶️ Spicy', value: 'SPICY' },
                { name: '🎉 Party', value: 'PARTY' }
            ))
    .addStringOption(option =>
        option.setName('type')
            .setDescription('The type of ride')
            .setRequired(true)
            .addChoices(
                { name: 'Road', value: 'ROAD' },
                { name: 'Gravel', value: 'GRAVEL' },
                { name: 'Mountain', value: 'MOUNTAIN' },
                { name: 'Social', value: 'SOCIAL' },
                { name: 'Virtual', value: 'VIRTUAL' }
            ))
    .addStringOption(option =>
        option.setName('drop_style')
            .setDescription('The drop style of the ride')
            .setRequired(true)
            .addChoices(
                { name: 'Drop', value: 'DROP' },
                { name: 'No Drop', value: 'NO_DROP' },
                { name: 'Regroup', value: 'REGROUP' }
            ))
    .addStringOption(option =>
        option.setName('date')
            .setDescription('The date of the ride (e.g., "tomorrow", "next Tuesday", "MM/DD")')
            .setRequired(true))
    .addStringOption(option =>
        option.setName('meet_time')
            .setDescription('When to arrive (e.g., "9:00 AM", "21:00")')
            .setRequired(true))
    .addStringOption(option =>
        option.setName('start_location')
            .setDescription('Where to meet')
            .setRequired(true)
            .addChoices(
                { name: 'Angry Catfish', value: 'ANGRY_CATFISH' },
                { name: 'Northern Coffeeworks', value: 'NORTHERN_COFFEEWORKS' },
                { name: 'Other', value: 'OTHER' }
            ))
    // Optional options after all required
    .addStringOption(option =>
        option.setName('rollout_time')
            .setDescription('Minutes after meet time to start')
            .setRequired(false)
            .addChoices(
                { name: '0 minutes', value: '0' },
                { name: '15 minutes', value: '15' },
                { name: '30 minutes', value: '30' },
                { name: '45 minutes', value: '45' },
                { name: '60 minutes', value: '60' }
            ))
    .addStringOption(option =>
        option.setName('end_location')
            .setDescription('Where the ride ends (defaults to start location)')
            .setRequired(false)
            .addChoices(
                { name: 'Same as start', value: 'SAME' },
                { name: 'Angry Catfish', value: 'ANGRY_CATFISH' },
                { name: 'Northern Coffeeworks', value: 'NORTHERN_COFFEEWORKS' },
                { name: 'Other', value: 'OTHER' }
            ))
    .addStringOption(option =>
        option.setName('distance')
            .setDescription('Distance in miles or kilometers (e.g., "20 miles" or "32 km")')
            .setRequired(false))
    .addStringOption(option =>
        option.setName('route_source')
            .setDescription('URL to route (Strava, RideWithGPS, etc.)')
            .setRequired(false))
    .addStringOption(option =>
        option.setName('notes')
            .setDescription('Additional notes for the ride')
            .setRequired(false));

export async function execute(interaction) {
    try {
        // Get all options
        const vibe = interaction.options.getString('vibe', true);
        const type = interaction.options.getString('type', true);
        const dropStyle = interaction.options.getString('drop_style', true);
        const dateStr = interaction.options.getString('date', true);
        const meetTimeStr = interaction.options.getString('meet_time', true);
        const rolloutTimeStr = interaction.options.getString('rollout_time') ?? '15'; // Default to 15 if not provided
        const startLocationCode = interaction.options.getString('start_location', true);
        const endLocationCode = interaction.options.getString('end_location') || 'SAME';
        const distanceStr = interaction.options.getString('distance');
        const routeSource = interaction.options.getString('route_source');
        const notes = interaction.options.getString('notes');

        // Hardcoded channel IDs for each ride type
        const CHANNEL_IDS = {
            ROAD: '1369666762601140295',
            GRAVEL: '1369666794444296274',
            MOUNTAIN: '1369666736424488990',
            SOCIAL: '1370182475170582558',
            VIRTUAL: '1380541852360507473',
            RACE: '1380541994593419326'
        };

        // Get the target channel for this ride type
        const targetChannelId = CHANNEL_IDS[type];

        if (!targetChannelId) {
            await interaction.reply({
                content: `No channel has been configured for ${type.toLowerCase()} rides. Please contact an administrator.`,
                ephemeral: true
            });
            return;
        }

        // Check if the ride type is allowed in the current channel
        const guild = await prisma.guild.findUnique({
            where: { id: interaction.guildId }
        });

        if (!guild) {
            await interaction.reply({
                content: 'This server has not been configured for ride creation. Please contact an administrator.',
                ephemeral: true
            });
            return;
        }

        // Handle custom locations
        if (startLocationCode === 'OTHER' || (endLocationCode !== 'SAME' && endLocationCode === 'OTHER')) {
            const modal = new ModalBuilder()
                .setCustomId('location-modal')
                .setTitle('Custom Location Details');

            const locationNameInput = new TextInputBuilder()
                .setCustomId('locationName')
                .setLabel('Location Name')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const locationUrlInput = new TextInputBuilder()
                .setCustomId('locationUrl')
                .setLabel('Google Maps URL')
                .setStyle(TextInputStyle.Short)
                .setRequired(true);

            const firstActionRow = new ActionRowBuilder().addComponents(locationNameInput);
            const secondActionRow = new ActionRowBuilder().addComponents(locationUrlInput);

            modal.addComponents(firstActionRow, secondActionRow);
            await interaction.showModal(modal);
            return;
        }

        // Parse date and time
        const date = parseDate(dateStr);
        const meetTime = parseTime(meetTimeStr);
        const rolloutTime = calculateRolloutTime(meetTime, rolloutTimeStr);

        // Parse distance if provided
        let distance = null;
        let distanceUnit = null;
        if (distanceStr) {
            const parsedDistance = parseDistance(distanceStr);
            distance = parsedDistance.distance;
            distanceUnit = parsedDistance.unit;
        }

        // Get location information
        const startLocation = getLocationInfo(startLocationCode);
        const endLocation = endLocationCode === 'SAME' ? startLocation : getLocationInfo(endLocationCode);

        // Create the ride in the database
        const ride = await prisma.ride.create({
            data: {
                guildId: interaction.guildId,
                channelId: targetChannelId,
                creatorId: interaction.user.id,
                type,
                vibe,
                dropStyle,
                date,
                meetTime,
                rolloutTime,
                startLocationName: startLocation.name,
                startLocationUrl: startLocation.url ?? undefined,
                endLocationName: endLocation.name,
                endLocationUrl: endLocation.url ?? undefined,
                distance: distance ?? undefined,
                distanceUnit: distanceUnit ?? undefined,
                routeSource: routeSource ?? undefined,
                notes: notes ?? undefined
            }
        });

        // Create embed for the ride
        const embed = new EmbedBuilder()
            .setTitle(`${vibe === 'SPICY' ? '🌶️' : '🎉'} ${vibe} ${type} RIDE`)
            .setColor(getRideTypeColor(type))
            .addFields(
                { name: 'Date', value: formatDate(date), inline: true },
                { name: 'Meet', value: `${meetTime} - Rollout: ${rolloutTime}`, inline: true },
                { name: 'Start', value: formatLocation(startLocation), inline: true },
                { name: 'Drop Style', value: dropStyle, inline: true }
            );

        if (endLocationCode !== 'SAME') {
            embed.addFields({ name: 'End', value: formatLocation(endLocation), inline: true });
        }

        if (distance) {
            embed.addFields({ 
                name: 'Distance', 
                value: formatDistance(distance, distanceUnit), 
                inline: true 
            });
        }

        if (routeSource) {
            embed.addFields({ name: 'Route', value: routeSource, inline: true });
        }

        if (notes) {
            embed.addFields({ name: 'Notes', value: notes });
        }

        embed.addFields({ name: 'Hosted by', value: `<@${interaction.user.id}>` });

        // Add reaction instructions
        embed.addFields({
            name: 'How to Join',
            value: '👍 - I\'m in!\n🤔 - Maybe',
            inline: false
        });

        // Get the target channel
        const targetChannel = await interaction.guild?.channels.fetch(targetChannelId);
        if (!targetChannel || !targetChannel.isTextBased()) {
            await interaction.reply({
                content: 'Error: Could not find the target channel. Please contact an administrator.',
                ephemeral: true
            });
            return;
        }

        // Send the embed to the target channel
        const message = await targetChannel.send({ embeds: [embed] });

        // Add reaction buttons
        await message.react('👍');
        await message.react('🤔');

        // Update the ride with the message ID
        await prisma.ride.update({
            where: { id: ride.id },
            data: { messageId: message.id }
        });

        // Confirm to the user
        await interaction.reply({
            content: `Your ride has been created in <#${targetChannelId}>!`,
            ephemeral: true
        });

    } catch (error) {
        console.error('Error creating ride:', error);
        let userMessage = 'Sorry, something went wrong. Please try again or contact an admin.';

        // Prisma/database error
        if (error.code === 'P1001' || error.code === 'P1002' || error.code === 'P1003' || error.message?.includes('prisma') || error.message?.toLowerCase().includes('database')) {
            userMessage = 'There was a problem connecting to the database. Please try again later or contact an admin.';
        }
        // Discord API error (missing permissions, channel not found, etc.)
        else if (error.code === 50013 || error.message?.includes('Missing Permissions') || error.message?.includes('Could not find the target channel')) {
            userMessage = 'I couldn\'t post the ride in the target channel. Please check my permissions and the channel ID.';
        }
        // Validation error (date/time, etc.)
        else if (error.message?.toLowerCase().includes('invalid') || error.message?.toLowerCase().includes('format')) {
            userMessage = 'There was a problem with your input. Please check the date, time, and other details.';
        }
        // Timeout
        else if (error.message?.toLowerCase().includes('timeout')) {
            userMessage = 'The operation timed out. Please try again.';
        }

        try {
            if (interaction.deferred || interaction.replied) {
                await interaction.editReply({ content: userMessage, ephemeral: true });
            } else {
                await interaction.reply({ content: userMessage, ephemeral: true });
            }
        } catch (err) {
            console.error('Failed to send error reply:', err);
        }
    }
}

function getRideTypeColor(type) {
    const colors = {
        'ROAD': 0x0099FF,
        'GRAVEL': 0x8B4513,
        'MOUNTAIN': 0x228B22,
        'SOCIAL': 0xFFD700,
        'VIRTUAL': 0x9370DB,
        'RACE': 0xFF0000
    };
    return colors[type] || 0x000000;
} 