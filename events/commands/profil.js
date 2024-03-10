import { ActionRowBuilder, ButtonBuilder, Embed, EmbedBuilder, SlashCommandBuilder } from 'discord.js';

const create = () => {
	const command = new SlashCommandBuilder()
		.setName('profil')
		.setDescription('Verilerinizin gösterildiği işlev.')
        .addStringOption((option) =>
			option.setName('statistic').setDescription("İstatistik seçimi.").addChoices(
				{ name: 'Kişisel', value: 'member_statistic' },
				{ name: 'Oyun', value: 'game_statistic' },
			).setRequired(true)
		);
	return command.toJSON();
};

const invoke = (interaction) => {
	const option = interaction.options.getString('statistic');
	if (option === "member_statistic") {

	}
};

export { create, invoke };
