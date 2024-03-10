import { ActionRowBuilder, ButtonBuilder, Embed, EmbedBuilder, SlashCommandBuilder } from 'discord.js';

const create = () => {
	const command = new SlashCommandBuilder()
		.setName('sıralama')
		.setDescription('Oyunların verilerinin listelendiği komut.')
	return command.toJSON();
};

const invoke = (interaction) => {
	const option = interaction.options.getString('command');
    if (!interaction.memberPermissions.has('ManageChannels')) return interaction.reply({
        content: "Bunun için yeterli yetkiye sahip değilsin.",
        ephemeral: true
    });
	if (option === null) {
		const embed = new EmbedBuilder() 
			.setAuthor({
				name: "Oyun sistemi.", iconURL: interaction.member.displayAvatarURL({ dynamic: true })
			})
            .setDescription(`Altta verilerini görüntüleyebileceğin oyunlar listelendi.`)
            .addFields(
                { name: "✨ counting (message)", value: "Sıralamayı görüntülemek için bunu seç.", inline: true },
                { name: "🎏 counting (number)", value: "Sıralamayı görüntülemek için bunu seç.", inline: true }
            )
			.setColor('Purple')
			.setFooter({
				text: " Müdür", iconURL: interaction.member.displayAvatarURL({ dynamic: true })
			})
			.setTimestamp()
        const buttons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("countingm_leaderboard")
                    .setLabel('✨ Mesaj')
                    .setStyle('Secondary'),
                new ButtonBuilder()
                    .setCustomId("countingn_leaderboard")
                    .setLabel('🎏 Sayı')
                    .setStyle('Secondary')
            )
		interaction.reply({ embeds: [embed], components: [buttons], ephemeral: true })
	}
};

export { create, invoke };
