import { ActionRow, ButtonBuilder, ClientUser, EmbedBuilder, StringSelectMenuBuilder, ActionRowBuilder, Events, ModalBuilder, TextInputBuilder, TextInputStyle, Embed, Colors } from "discord.js";
import { JsonDatabase } from "wio.db";
const once = false;
const name = 'interactionCreate';
import config from '../config.json' assert {type: 'json'};
const db = new JsonDatabase({
    databasePath: "././database/ticket.json"
})
function getAllMembers(interaction) {
    const ticketMembers = db.get(`channels.${interaction.channel.id}.ticketMembers`) || [];
    const formatted = ticketMembers
        .filter(memberId => Boolean(memberId))
        .map((memberId, index) => ({
            label: `#${index + 1} ⸻ ${interaction.guild.members.cache.get(memberId).user.username}`,
            value: memberId.toString()
        }))
    return formatted;
}

function invoke(interaction) {

    if(interaction.customId === "ticketAddMembers") {
        const modal = new ModalBuilder()
            .setCustomId('memberDetails')
            .setTitle('Üye ekle.');
        const favoriteColorInput = new TextInputBuilder()
            .setCustomId('memberID')
            .setLabel("Eklemek istediğin üyenin ID'si.")
            .setStyle(TextInputStyle.Short);

        const hobbiesInput = new TextInputBuilder()
            .setCustomId('memberAddReason')
            .setLabel("Üyeyi neden eklemek istiyorsun?")
            .setStyle(TextInputStyle.Paragraph);

        const firstActionRow = new ActionRowBuilder().addComponents(favoriteColorInput);
        const secondActionRow = new ActionRowBuilder().addComponents(hobbiesInput);

        modal.addComponents(firstActionRow, secondActionRow);

        interaction.showModal(modal);
    } else if (interaction.customId === "ticketRemoveMember") {
        const ticketMembers = db.fetch(`channels.${interaction.channel.id}.ticketMembers`) || [];

        console.log(ticketMembers)
        if (ticketMembers.length === 0) {
            const embed = new EmbedBuilder() 
                .setAuthor({ name: `Müdür - [Talep sistemi / Üye çıkarma]`,iconURL: interaction.member.displayAvatarURL({ dynamic: true })}) .setDescription(`Talepte herhangi bir üye bulunmuyor.`) .setColor(Colors.Blurple) .setTimestamp()
                .setFooter({
                    text: "( Müdür) 0.2ms içinde işlendi. Son güncelleme", iconURL: interaction.member.displayAvatarURL({ dynamic: true })
                })
                .setTimestamp()
                .setThumbnail(interaction.member.displayAvatarURL({ dynamic: true }))
            interaction.reply({ embeds: [embed], ephemeral: true });
        } else {
            
            const options = getAllMembers(interaction);
            const embed = new EmbedBuilder()
                .setAuthor({
                    name: `Müdür - [Talep sistemi / Üye çıkarma]`,
                    iconURL: interaction.member.displayAvatarURL({ dynamic: true })
                })
                .setColor(Colors.Blurple)
                .setDescription(`Talebe eklenmiş olan ve çıkarmak istediğin üyeyi alttaki listeden seç!`)
                .setTimestamp()
                .setFooter({
                    text: "( Müdür) 0.2ms içinde işlendi. Son güncelleme", iconURL: interaction.member.displayAvatarURL({ dynamic: true })
                })
                .setTimestamp()
                .setThumbnail(interaction.member.displayAvatarURL({ dynamic: true }))
            const select = new StringSelectMenuBuilder()
                .setCustomId('ticket_selectmenus')
                .setPlaceholder('Çıkarmak istediğin üyeyi seç...')
                .addOptions(options)
            const forwardMessage = new ActionRowBuilder()
                .addComponents(select)
            interaction.reply({ embeds: [embed], ephemeral: true, components: [forwardMessage] })
        }
    };
    
	
    
    //if (!interaction.isModalSubmit()) return;
    if (interaction.customId === "memberDetails") {
        const inputValues = [ interaction['fields'].getTextInputValue('memberID'), interaction['fields'].getTextInputValue('memberAddReason') ];
        const db = new JsonDatabase({
            databasePath: "././database/ticket.json"
        })
        const member = interaction.guild.members.cache.get(inputValues[0]) ? interaction.guild.members.cache.get(inputValues[0]) : false;
        if (member === false) return interaction.reply( { content: "Böyle bir üye sunucuda yok veya hatalı bir ID girişi yapıldı.", ephemeral: true } );
        const embed = new EmbedBuilder()
            .setAuthor({
                name: `Müdür - [Talep sistemi / Üye ekleme]`,
                iconURL: interaction.member.displayAvatarURL({ dynamic: true })
            })
            .setColor(Colors.Blurple)
            .setDescription(`İstenilen üye başarılı bir şekilde eklendi! Detaylar için aşağı kısımı inceleyebilirsin.`)
            .addFields(
                { name: "Eklenen üye", value: `${member}`, inline: true },
                { name: "Eklenme sebebi", value: `${inputValues[1]}`, inline: true },
                { name: "Ekleyen üye", value: `${interaction.member}`, inline: true }
            )
            .setTimestamp()
            .setFooter({
                text: "( Müdür) 0.2ms içinde işlendi. Son güncelleme", iconURL: interaction.member.displayAvatarURL({ dynamic: true })
            })
            .setTimestamp()
            .setThumbnail(interaction.member.displayAvatarURL({ dynamic: true }))
        interaction.reply({ embeds: [embed], ephemeral: false })
        interaction.channel.permissionOverwrites.edit(member.id, { ViewChannel: true, SendMessages: true })
        db.add(`channels.${interaction.channel.id}.ticketMembers`, member.id)
        }
    }

export { once, name, invoke };
