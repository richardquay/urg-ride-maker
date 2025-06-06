import { SlashCommandBuilder, EmbedBuilder } from 'discord.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const data = new SlashCommandBuilder()
  .setName('status')
  .setDescription('Show bot status and environment info');

export async function execute(interaction) {
  console.log('Status command triggered!');
  const isRailway = !!process.env.RAILWAY_ENVIRONMENT_NAME;
  const environment = isRailway ? `Railway (${process.env.RAILWAY_ENVIRONMENT_NAME})` : 'Local';
  const type = process.env.TYPE || 'Not set';
  const vibe = process.env.VIBE || 'Not set';

  // Test DB write
  let dbStatus = 'Unknown';
  try {
    const test = await prisma.statusTest.create({ data: { createdAt: new Date() } });
    dbStatus = `✅ Success (id: ${test.id})`;
    // Optionally, clean up the test row
    await prisma.statusTest.delete({ where: { id: test.id } });
  } catch (err) {
    dbStatus = `❌ Failed: ${err.message}`;
  }

  const embed = new EmbedBuilder()
    .setTitle('Bot Status')
    .setColor(isRailway ? 0x0099FF : 0xFFD700)
    .addFields(
      { name: 'Environment', value: environment, inline: true },
      { name: 'Database Write', value: dbStatus, inline: false },
      { name: 'TYPE', value: type, inline: true },
      { name: 'VIBE', value: vibe, inline: true },
      { name: 'Uptime', value: `${Math.floor(process.uptime())} seconds`, inline: true }
    );

  await interaction.reply({ embeds: [embed], ephemeral: true });
} 