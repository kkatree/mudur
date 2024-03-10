import { ActionRow, ActionRowBuilder, ButtonBuilder, ClientUser, EmbedBuilder, StringSelectMenuBuilder } from "discord.js";
import { JsonDatabase } from "wio.db";
const once = false;
const name = 'interactionCreate';
import config from '../config.json' assert {type: 'json'};

function sendCreatedTicket(interaction, eventChannel) {
    const sendedChannel = interaction.client.channels.cache.get(config.settings.ticketClaim.ticketClaimMessageChannel)
    const db = new JsonDatabase({
        databasePath: "././database/ticket.json"
    })
    const createMessage = new EmbedBuilder()
        .setAuthor({
            name: "Talep sistemi. [Yetkili bildirim.]",
            iconURL: interaction.member.displayAvatarURL({ dynamic: true })
        })
        .setDescription("Bir talep açıldı! Bu talebe katılmak için butona tıkla!\n\n> Talep bilgileri.")
        .addFields(
            { name: "Talep sahibi", value: `${interaction.member}`, inline: true },
            { name: "Talep türü", value: `${db.fetch(`channels.${eventChannel.id}.ticketType`)}`, inline: true },
            { name: "Talep no", value: `${eventChannel.name .replaceAll('ticket-', '')}`, inline: true },
            { name: "Talep yetkilisi", value: `Bekleniyor...`, inline: false }
        )
        .setTimestamp()
        .setColor('Purple')
        .setFooter({
            text: "( Müdür) 0.2ms içinde işlendi. Son güncelleme", iconURL: interaction.member.displayAvatarURL({ dynamic: true })
        })
        .setTimestamp()
        .setThumbnail(interaction.member.displayAvatarURL({ dynamic: true }))
    const buttons = new ActionRowBuilder()
        .addComponents(
            new ButtonBuilder()
                .setCustomId(`ticket_claim_${eventChannel.id}`)
                .setStyle('Secondary')
                .setLabel('🎀 Senin olsun!')
        )
    sendedChannel.send({
        embeds: [createMessage], components: [buttons]
    }).catch(err => console.log(err))
}

function createTicketSetup(interaction, channel) {
    const db = new JsonDatabase({
        databasePath: "././database/ticket.json"
    })
    const createMessage = new EmbedBuilder()
        .setAuthor({
            name: "Talep sistemi.",
            iconURL: interaction.member.displayAvatarURL({ dynamic: true })
        })
        .setDescription(`Merhaba ${interaction.member}! Talebin oluşturuldu, sana yetkili ekibimizden birisi atanana kadar sen arkana yaslanıp kahvenin tadını çıkarabilirsin. Merak etme, sorunun hızlı bir şekilde cevaplanıp çözüme ulaşacaktır!`)
        .addFields(
            { name: "Talep Sahibi", value: `${interaction.member}`, inline: true },
            { name: "Talep Konusu", value: `${db.fetch(`channels.${channel.id}.ticketType`)}`, inline: true },
            { name: "Talep ID", value: `${channel.name .replaceAll('ticket-', '')}`, inline: true }
        )
        .setTimestamp()
        .setColor('Purple')
        .setFooter({
            text: "( Müdür) 0.2ms içinde işlendi. Son güncelleme", iconURL: interaction.member.displayAvatarURL({ dynamic: true })
        })
        .setTimestamp()
        .setThumbnail(interaction.member.displayAvatarURL({ dynamic: true }))
    channel.send({
        embeds: [createMessage]
    }).then((m) => {
        db.set(`channels.${channel.id}.createdTimestamp`, m.createdTimestamp)
    })
    channel.permissionOverwrites.edit(interaction.guild.roles.everyone.id, { ViewChannel: false })
    channel.permissionOverwrites.edit(interaction.member.id, { ViewChannel: true, SendMessages: true })
    interaction.reply({ content: `Talebin açıldı, ${channel}`, ephemeral: true})
}

async function invoke(interaction) {
	
    if (!interaction.isStringSelectMenu()) return;

    if (interaction.customId === "ticket_selectmenu") {
        const db = new JsonDatabase({
            databasePath: "././database/ticket.json"
        })
        const ticketCount = await db.fetch("ticketCount");
        if(db.fetch('activeTicketMembers', interaction.member.id).includes(interaction.member.id) ? true : false === true) return interaction.reply({ content: "> Aktif bir talebin bulunuyor.", ephemeral: true })
        if (interaction.values[0] === "os") {
            interaction.guild.channels.create({ name: `ticket-${ticketCount}`, parent: db.fetch("settings.category")})
                .then((channel) => {
                    db.set(`channels.${channel.id}.ticketCreator`, interaction.member.id);
                    db.push(`activeTicketMembers`, interaction.member.id)
                    db.set(`channels.${channel.id}.ticketType`, "Oyun-içi Şikayet");
                    db.add("ticketCount", 1)
                    sendCreatedTicket(interaction, channel);
                    createTicketSetup(interaction, channel);
                })
                
            
        } else if (interaction.values[0] === "hb") {
            interaction.guild.channels.create({ name: `ticket-${ticketCount}`, parent: db.fetch("settings.category")})
                .then((channel) => {
                    db.set(`channels.${channel.id}.ticketCreator`, interaction.member.id);
                    db.push(`activeTicketMembers`, interaction.member.id)
                    db.set(`channels.${channel.id}.ticketType`, "Hata Bildirimi");
                    db.add("ticketCount", 1)
                    sendCreatedTicket(interaction, channel);
                    createTicketSetup(interaction, channel);
                })
        } else if (interaction.values[0] === "ys") {
            interaction.guild.channels.create({ name: `ticket-${ticketCount}`, parent: db.fetch("settings.category")})
                .then((channel) => {
                    db.set(`channels.${channel.id}.ticketCreator`, interaction.member.id);
                    db.push(`activeTicketMembers`, interaction.member.id)
                    db.set(`channels.${channel.id}.ticketType`, "Yetkili Şikayet");
                    db.add("ticketCount", 1)
                    sendCreatedTicket(interaction, channel);
                    createTicketSetup(interaction, channel);
                })
        }

    } else if (interaction.customId === "ticket_selectmenus") {
        const db = new JsonDatabase({
            databasePath: "././database/ticket.json"
        })
        console.log(interaction.values[0])
        db.delete(`channels.${interaction.channel.id}.ticketMembers`, interaction.values[0])
        interaction.reply({ content: `${interaction.values[0]}`})
    }
}

export { once, name, invoke };
