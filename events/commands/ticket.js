import { EmbedBuilder, SlashCommandBuilder } from 'discord.js';

const create = () => {
	const command = new SlashCommandBuilder()
		.setName('ticket')
		.setDescription('Talep ana komutu.')
		.addStringOption((option) =>
			option.setName('command').setDescription("Komut seçimi.").addChoices(
				{ name: 'Admin', value: 'admin_commands' },
				{ name: 'Kullanıcı', value: 'user_commands' },
			)
		);

	return command.toJSON();
};

const invoke = (interaction) => {
	const option = interaction.options.getString('command');
	console.log(option)
	if (option === null) {
		const embed = new EmbedBuilder() 
			.setAuthor({
				name: "Talep sistemi", iconURL: interaction.member.displayAvatarURL({ dynamic: true })
			})
			.setColor('Purple')
			.setFooter({
				text: " Müdür", iconURL: interaction.member.displayAvatarURL({ dynamic: true })
			})
			.setTimestamp()
		interaction.reply({ embeds: [embed], ephemeral: true })
	} else if (option === "admin_commands") {
		const embed = new EmbedBuilder() 
			.setAuthor({
				name: "Talep sistemi", iconURL: interaction.member.displayAvatarURL({ dynamic: true })
			})
			.setColor('Purple')
			.setDescription("**Yetkili**lerin kullanabileceği komutlar listelenmiştir.")
			.addFields(
				{ name: "tickets info", value: "Mevcut talep hakkında bilgiler verir.", inline: true },
				{ name: "tickets settings", value: "Mevcut talebe ayarlar yapmanızı sağlar.", inline: true }
			)
			.setThumbnail(interaction.member.displayAvatarURL({ dynamic: true }))
			.setFooter({
				text: "( Müdür) 0.2ms içinde işlendi.", iconURL: interaction.member.displayAvatarURL({ dynamic: true })
			})
			.setTimestamp()
		interaction.reply({ embeds: [embed], ephemeral: true })
	} else if (option === "user_commands") {
		const embed = new EmbedBuilder() 
			.setAuthor({
				name: "Talep sistemi", iconURL: interaction.member.displayAvatarURL({ dynamic: true })
			})
			.setColor('Purple')
			.setDescription("**Yetkili**lerin kullanabileceği komutlar listelenmiştir.")
            .addFields(
                { name: "tickets members", value: "Mevcut talepte üye işlemleri yapılır.", inline: true },
                { name: "tickets select", value: "Talep konusunu değiştirir.", inline: true }
            )
			.setThumbnail(interaction.member.displayAvatarURL({ dynamic: true }))
			.setFooter({
				text: "( Müdür) 0.2ms içinde işlendi.", iconURL: interaction.member.displayAvatarURL({ dynamic: true })
			})
			.setTimestamp()
		interaction.reply({ embeds: [embed], ephemeral: true })
	}
};

export { create, invoke };
