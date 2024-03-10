import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Embed, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import { JsonDatabase } from "wio.db";

const create = () => {
	const command = new SlashCommandBuilder()
		.setName('tickets')
		.setDescription('Talep işlem komutu.')
        .addStringOption((option) =>
			option.setName('command').setDescription("Komut seçimi.").addChoices(
				{ name: 'settings', value: 'settings_command' },
				{ name: 'info', value: 'info_command' },
				{ name: 'members', value: 'members_command' },
				{ name: 'select', value: 'select_command' },
			).setRequired(true)
        );

	return command.toJSON();
};

function getMemberData(memberId, interaction) {
	const member = interaction.guild.members.cache.get(memberId, false);
	return member ? { id: member.id, username: member.username } : null;
}
function getMembers(interaction) {
	const db = new JsonDatabase({
        databasePath: "./././database/ticket.json"
    })
	const memberIds = db.get(`channels.${interaction.channel.id}.ticketMembers`) || [];
  
	if (memberIds.length === 0) {
	  console.log('Üye bilgisi yok.');
	  return;
	}
  
	const memberDataPromises = memberIds.map((memberId) => {
	  return getMemberData(memberId, interaction);
	});
  
	const memberData = Promise.all(memberDataPromises);
	const filteredMemberData = memberData.filter(Boolean);

	const formattedData = filteredMemberData.map(data => `${data.username} (${data.id})`).join('\n');
	console.log(formattedData)
	return formattedData;
}		 

const invoke = (interaction) => {
	const option = interaction.options.getString('command');
	const db = new JsonDatabase({
        databasePath: "./././database/ticket.json"
    })
	if (option === "settings_command") {
		if (!interaction.member.permissions.has("ADMINISTATOR")) return;
		const embed = new EmbedBuilder() 
			.setAuthor({
				name: "Talep sistemi", iconURL: interaction.member.displayAvatarURL({ dynamic: true })
			})
			.setDescription("Talep sisteminin genel ayarlarına buradan erişebilirsin.")
			.addFields(
				{ name: "🎊 Gönder", value: "İşlem kanalını belirle.", inline: true },
				/*{ name: "🧪 Log", value: "Log sistemini ayarla.", inline: true },
				{ name: "🔧 Yetkili", value: "Yetkilileri tanımla.", inline: true }*/
			)
			.setColor('Purple')
			.setFooter({
				text: "( Müdür) 0.2ms içinde işlendi.", iconURL: interaction.member.displayAvatarURL({ dynamic: true })
			})
			.setTimestamp()
		const buttons = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setLabel("Gönder")
					.setCustomId("ticket_send")
					.setEmoji("🎊")
					.setStyle('Secondary'),
				/*new ButtonBuilder()
					.setLabel("Log")
					.setCustomId("ticket_log")
					.setEmoji("🧪")
					.setStyle('Secondary'),
				new ButtonBuilder()
					.setLabel("Yetkili")
					.setCustomId("ticket_staff")
					.setEmoji("🔧")
					.setStyle('Secondary'),*/
			)
			
		interaction.reply({ embeds: [embed], components: [buttons], ephemeral: true })
	} else if (option === "info_command") {
		if (!interaction.channel.name.includes('ticket')) return interaction.reply({ content: "Bu bir talep komutudur, sadece talep kanallarında kullanabilirsiniz.", ephemeral: true })
		const infoMessage = new EmbedBuilder()	
			.setAuthor({
				name: "Talep sistemi. [Talep bilgi]",
				iconURL: interaction.member.displayAvatarURL({
					dynamic: true
				})
			})
			.setDescription("Bu talep hakkında bilgiler toplandı.")
			.addFields(
				{ name: "Talep Sahibi", value: `<@${db.fetch(`channels.${interaction.channel.id}.ticketCreator`)}>`, inline: true },
				{ name: "Talep Türü", value: `${db.fetch(`channels.${interaction.channel.id}.ticketType`)}`, inline: true },
				{ name: "Talep Açılış", value: `<t:${Math.floor(db.fetch(`channels.${interaction.channel.id}.createdTimestamp`) / 1000)}>`, inline: true },
				{ name: "Talep Yetkilisi", value: db.fetch(`channels.${interaction.channel.id}.ticketStaff`) ? `<@${db.fetch(`channels.${interaction.channel.id}.ticketStaff`)}>` : "Talep yetkilisi yok.", inline: true }
			)
			.setColor('Purple')
			.setFooter({
				text: "( Müdür) 0.2ms içinde işlendi.", iconURL: interaction.member.displayAvatarURL({ dynamic: true })
			})
			.setTimestamp()
		const buttons = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setLabel("Talebi Sonlandır")
					.setCustomId("ticketDelete")
					.setEmoji("🎊")
					.setStyle('Danger'),
			)
		interaction.reply({ embeds: [infoMessage], components: [buttons], ephemeral: true })
	} else if (option === "members_command") {
		const data = db.fetch(`channels.${interaction.channel.id}.ticketMembers`); 
		const buttons = new ActionRowBuilder()
			.addComponents(
		new ButtonBuilder()
				.setLabel("Üye ekle")
				.setCustomId("ticketAddMembers")
				.setEmoji("🧙‍♂️")
				.setStyle(ButtonStyle.Secondary),
			new ButtonBuilder()
				.setLabel("Üye çıkar")
				.setCustomId("ticketRemoveMember")
				.setEmoji("🛹")
				.setStyle(ButtonStyle.Secondary),
	);
		const embed = new EmbedBuilder()
			.setAuthor({
				name: "Talep sistemi. [Üye ekleme & çıkarma]",
				iconURL: interaction.member.displayAvatarURL({
					dynamic: true
				})
			})
			.setThumbnail(interaction.member.displayAvatarURL({dynamic: true}))
			.setDescription("Bu talep hakkında bilgiler toplandı. Gerekli uygulayacağınız işlemleri alt taraftaki butonlardan gerçekleştirebilirsiniz.")
			.addFields(
				{ name: "Talep Sahibi", value: `<@${db.fetch(`channels.${interaction.channel.id}.ticketCreator`)}>`, inline: true },
				{ name: "Talep Açılış", value: `<t:${Math.floor(db.fetch(`channels.${interaction.channel.id}.createdTimestamp`) / 1000)}>`, inline: true },
				{ name: "Talep Yetkilisi", value: db.fetch(`channels.${interaction.channel.id}.ticketStaff`) ? `<@${db.fetch(`channels.${interaction.channel.id}.ticketStaff`)}>` : "Talep yetkilisi yok.", inline: true },
				{ name: "Talepte Bulunan Üyeler", value: db.fetch(`channels.${interaction.channel.id}.ticketMembers`) === "[]" || db.fetch(`channels.${interaction.channel.id}.ticketMembers`) === null  ? "Talepte bulunan üye yok." : `${data.map(x => `<@${x}>`).join("\n")}`, inline: true }
			)
			.setColor('Purple')
			.setFooter({
				text: "( Müdür) 0.2ms içinde işlendi.", iconURL: interaction.member.displayAvatarURL({ dynamic: true })
			})
			.setTimestamp()
		interaction.reply({ embeds: [embed], components: [buttons], ephemeral: true })
	}
};

export { create, invoke };
