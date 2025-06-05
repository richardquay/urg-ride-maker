import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
export const name = 'messageReactionAdd';
export const once = false;
export async function execute(reaction, user) {
    // Ignore bot reactions
    if (user.bot)
        return;
    // Handle partial reactions
    if (reaction.partial) {
        try {
            await reaction.fetch();
        }
        catch (error) {
            console.error('Error fetching reaction:', error);
            return;
        }
    }
    // Get the message
    const message = reaction.message;
    if (!message.guild)
        return;
    try {
        // Find the ride in the database
        const ride = await prisma.ride.findFirst({
            where: {
                messageId: message.id,
                guildId: message.guild.id
            },
            include: {
                participants: true
            }
        });
        if (!ride)
            return;
        // Handle different reaction types
        switch (reaction.emoji.name) {
            case '👍': // Interested
                await handleParticipant(ride.id, user.id, user.username || 'Unknown User', 'interested');
                break;
            case '🤔': // Maybe
                await handleParticipant(ride.id, user.id, user.username || 'Unknown User', 'maybe');
                break;
        }
        // Update the ride message with new participant list
        await updateRideMessage(message, ride.id);
    }
    catch (error) {
        console.error('Error handling reaction:', error);
    }
}
async function handleParticipant(rideId, userId, userName, status) {
    // Remove any existing participation
    await prisma.participant.deleteMany({
        where: {
            rideId,
            userId
        }
    });
    // Add new participation
    await prisma.participant.create({
        data: {
            rideId,
            userId,
            userName,
            status
        }
    });
}
async function updateRideMessage(message, rideId) {
    const ride = await prisma.ride.findUnique({
        where: { id: rideId },
        include: {
            participants: true
        }
    });
    if (!ride)
        return;
    // Get the original embed
    const embed = message.embeds[0];
    if (!embed)
        return;
    // Update participant lists
    const interestedParticipants = ride.participants
        .filter((p) => p.status === 'interested')
        .map((p) => `<@${p.userId}>`)
        .join('\n');
    const maybeParticipants = ride.participants
        .filter((p) => p.status === 'maybe')
        .map((p) => `<@${p.userId}>`)
        .join('\n');
    // Update the embed fields
    const updatedFields = embed.fields.filter((field) => !field.name.startsWith('Participants') && !field.name.startsWith('Maybe'));
    if (interestedParticipants) {
        updatedFields.push({
            name: `Participants (${ride.participants.filter((p) => p.status === 'interested').length})`,
            value: interestedParticipants,
            inline: false
        });
    }
    if (maybeParticipants) {
        updatedFields.push({
            name: `Maybe (${ride.participants.filter((p) => p.status === 'maybe').length})`,
            value: maybeParticipants,
            inline: false
        });
    }
    // Update the message
    await message.edit({ embeds: [{ ...embed, fields: updatedFields }] });
}
