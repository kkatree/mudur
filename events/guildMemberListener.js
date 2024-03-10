const once = false;
const name = 'guildMemberAdd';
import { ActionRowBuilder, EmbedBuilder, Events, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js';
import config from '../config.json' assert {type: 'json'};

async function invoke(member) {

	const sendedChannel = config['settings']['joinleaveChannel'];
	const general = {
		getSendedChannel: function(id) {
			return member.guild.channels.cache.get(id);
		},
		getMemberInfo: function() {
			return {
				joined: member.joinedTimestamp,
				created: Math.floor(member.user.createdTimestamp / 1000),
				username: member.user.username,
				discrim: member.user.discriminator,
				id: member.user.id,
				avatar: member.displayAvatarURL( { dynamic: true } )
			}
		},
		createEmbeds: function(type) {
			if (type === "join") {
				const embed = new EmbedBuilder()
					.setAuthor({
						name: "Giriş yapıldı!", 
						iconURL: member.displayAvatarURL( { dynamic: true } )
					})
					.setDescription(`Bir maceracı aramıza katıldı! Sunucumuzda maceracı sayısı **${member.guild.memberCount}.** kişi olan **${general.getMemberInfo()['username']}#${general.getMemberInfo()['discrim']}** ile beraber yükseldi!`)
					.setThumbnail(general.getMemberInfo()['avatar'])
					.addFields(
						{ name: "Katılan üye", value: `<@${this.getMemberInfo()['id']}>`, inline: true },
						{ name: "Hesabın kuruluş tarihi", value: `<t:${this.getMemberInfo()['created']}>`, inline: true }
					)
					.setColor('Purple')
					.setFooter({
						text: "Evangelion - Müdür", iconURL: member.displayAvatarURL({ dynamic: true })
					})
					.setTimestamp()
				return embed;
			} else if (type === "leave") {
				const embed = new EmbedBuilder()
					.setAuthor({
						name: "Giriş yapıldı!", 
						iconURL: member.displayAvatarURL( { dynamic: true } )
					})
					.setDescription(`Bir maceracı aramızdan ayrıldı! Sunucumuzda maceracı sayısı **${member.guild.memberCount}.** kişiye geriledi!`)
					.setThumbnail(general.getMemberInfo()['avatar'])
					.addFields(
						{ name: "Katılan üye", value: `<@${this.getMemberInfo()['id']}>`, inline: true },
						{ name: "Hesabın kuruluş tarihi", value: `<t:${this.getMemberInfo()['created']}>`, inline: true }
					)
					.setColor('Purple')
					.setFooter({
						text: " Müdür", iconURL: member.displayAvatarURL({ dynamic: true })
					})
					.setTimestamp()
				return embed;
			}
		}
	}

	const message = general.createEmbeds("join");
	const channel = general.getSendedChannel(sendedChannel)
	channel.send({ embeds: [message] })

	console.log(member);
    
}

export { once, name, invoke };
