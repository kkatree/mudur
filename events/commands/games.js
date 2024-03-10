import { ActionRowBuilder, ButtonBuilder, Embed, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
//import { levelAdoons } from '.\.\classes\level.js';

const create = () => {
	const command = new SlashCommandBuilder()
		.setName('games')
		.setDescription('Oyunların merkez komutu.')

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
            .setDescription(`Altta yönetebileceğin oyunlar listelendi.`)
            .addFields(
                { name: "✨ counting (message)", value: "Mesajları tek tek sayarak, bunu bir yarışmaya döndürür!", inline: true },
                { name: "🎏 counting (number)", value: "Bir kanal üzerinden başlatılan yarışma ile en çok katılan ödülleri kazanır!", inline: true }
            )
			.setColor('Purple')
			.setFooter({
				text: " Müdür", iconURL: interaction.member.displayAvatarURL({ dynamic: true })
			})
			.setTimestamp()
        const buttons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("countingm_commands")
                    .setLabel('✨ Mesaj')
                    .setStyle('Secondary'),
                new ButtonBuilder()
                    .setCustomId("countingn_commands")
                    .setLabel('🎏 Sayı')
                    .setStyle('Secondary')
            )
		interaction.reply({ embeds: [embed], components: [buttons], ephemeral: true })
	}
};

export { create, invoke };
