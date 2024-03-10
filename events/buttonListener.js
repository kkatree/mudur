import { ActionRow, ActionRowBuilder, ButtonBuilder, EmbedBuilder, StringSelectMenuBuilder } from "discord.js";
import { JsonDatabase } from "wio.db";
import fs from 'fs'
import config from '../config.json' assert {type: 'json'};

const once = false;
const name = 'interactionCreate';

async function invoke(interaction) {
    const db = new JsonDatabase({
        databasePath: "././database/ticket.json"
    })
    const gamecountdb = new JsonDatabase({
        databasePath: "././database/games/count.json"
    })
    const gamecountdb2 = new JsonDatabase({
        databasePath: "././database/games/counting.json"
    })
    function topMessage() {
        const gameData = gamecountdb.get("game");
        let topMemberID = null;
        let topCount = -Infinity;
        if (gameData && gameData.members) {
            const membersData = gameData.members;
            for (const memberID in membersData) {
                if(membersData.hasOwnProperty(memberID)) {
                    const count = membersData[memberID].count;
    
                    if (count > topCount) {
                        topCount = count;
                        topMemberID = memberID;
                    }
                }
            }
        }
        return [topCount, topMemberID];
    }
    if (!interaction.isButton()) return;
    //ticket_claim_${eventChannel.id}
    if (interaction.customId === "ticket_button_forward") {
        const forwardMessage = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('ticket_selectmenu')
                    .setPlaceholder('Seçmeni bekliyoruz...')
                    .addOptions(
                        {
                            label: 'Oyun-içi Şikayet',
                            description: 'Hile, dolandırma gibi bildirimler için.',
                            value: 'os',
                        },
                        {
                            label: 'Hata Bildirimi',
                            description: 'Oluşan hataları bildirmek için.',
                            value: 'hb',
                        },
                        {
                            label: 'Yetkili Şikayeti',
                            description: 'Ekibimizin olumsuz davranışlarını bildirmeniz için.',
                            value: 'ys',
                        },
                    ),
            )
        interaction.reply({
            content: "Bir kategori seçin.",
            components: [forwardMessage],
            ephemeral: true
        }) 

    } else if (interaction.customId.includes("ticket_claim")) {
        const eventChannelID = interaction.customId
            .replaceAll('ticket_claim_', '')
        db.push(`channels.${eventChannelID}.ticketMembers`, interaction.member.id)
        db.set(`channels.${eventChannelID}.ticketStaff`, interaction.member.id)
        const eventChannel = interaction.client.channels.cache.get(eventChannelID);
        eventChannel.send({
            content: "> Bu talebe bir **yetkili atandı**! Yetkili: <@" + interaction.member + ">"
        })
        eventChannel.permissionOverwrites.edit(interaction.member.id, { ViewChannel: true, SendMessages: true })
        //const fetchOwner = interaction.client.guilds.cache.get(config.client['ID']).members.cache.get(db.fetch(`channels.${eventChannel.id}.ticketCreator`))
        const createMessage = new EmbedBuilder()
            .setAuthor({
                name: "Talep sistemi. [Yetkili bildirim.]"
            })
            .setDescription("Bu talep bir yetkili tarafından alındı.\n\n> Talep bilgileri.")
            .addFields(
                { name: "Talep sahibi", value: `<@${db.fetch(`channels.${eventChannel.id}.ticketCreator`)}>`, inline: true },
                { name: "Talep türü", value: `${db.fetch(`channels.${eventChannel.id}.ticketType`)}`, inline: true },
                { name: "Talep no", value: `${eventChannel.name .replaceAll('ticket-', '')}`, inline: true },
                { name: "Talep yetkilisi", value: `${interaction.member}`, inline: false }
            )
            .setTimestamp()
            .setColor('Purple')
            .setFooter({
                text: "( Müdür) 0.2ms içinde işlendi. Son güncelleme", iconURL: interaction.member.displayAvatarURL({ dynamic: true })
            })
        const buttons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId(`ticket_claim_${eventChannel.id}`)
                    .setStyle('Secondary')
                    .setLabel(`Bu talep, ${interaction.member.user.username} tarafından alındı.`)
                    .setDisabled(true)
            )
        interaction.message.edit({
            embeds: [createMessage],
            components: [buttons]
        })
        interaction.reply({
            content: "Bu talep artık senindir!",
            ephemeral: true
        })
    } else if (interaction.customId === "countingm_commands") {
        let gameStatus = gamecountdb.fetch(`game.settings.status`) ? "🟢 Aktif" : "🔴 Pasif"
        let gameRestartTime = gamecountdb.fetch(`game.settings.restartTime`) ? gamecountdb.fetch(`game.settings.restartTime`) : "Oyun pasif.";
        let gameStartTime = gamecountdb.fetch(`game.settings.startTime`) ? gamecountdb.fetch(`game.settings.startTime`) : "Oyun pasif.";
        let topMessager = topMessage();
        const embed = new EmbedBuilder()
            .setAuthor({
                name: "Oyun sistemi. [Mesaj]",
                iconURL: interaction.member.displayAvatarURL({ dynamic: true })
            })
            .setDescription(`Aşağıda bu oyuna dair bilgiler listelendi.`)
            .addFields(
                { name: "Oyun durumu", value: `${gameStatus}`, inline: true },
                { name: "Başlama zamanı", value: `<t:${gameStartTime}:R>`, inline: true },
                { name: "Sıfırlanmaya kalan süre", value: `<t:${gameRestartTime}:R>`, inline: true },
                { name: "En çok mesaj yazan", value: `<@${topMessager[1]}> | **${topMessager[0]}** mesaj `, inline: true },
                { name: "Oyunu başlat & sıfırla", value: "Başlatmak ve sıfırlamak için aşağıdaki butonu kullan." }
            )
            .setColor('Purple')
			.setFooter({
				text: " Müdür", iconURL: interaction.member.displayAvatarURL({ dynamic: true })
			})
            .setThumbnail(interaction.member.displayAvatarURL({ dynamic: true }))
			.setTimestamp()
        const button = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("start_countingm")
                    .setLabel("🧧 Oyun durumunu değiştir.")
                    .setStyle('Primary')
            )
        interaction.reply({
            embeds: [embed],
            components: [button],
            ephemeral: true
        })

    } else if (interaction.customId === "start_countingm") {
        if (gamecountdb.fetch(`game.settings.status`) === "true") {
            interaction.reply({
                content: "Oyun durumu kapatıldı ve sıfırlandı.",
                ephemeral: true
            })
            gamecountdb.set(`game.settings.status`, "false");
            restartCountGame();
        } else {
            interaction.reply({
                content: "Oyun durumu açıldı ve başlatıldı.",
                ephemeral: true
            })
            gamecountdb.set(`game.settings.status`, "true")
            startCountGame();
        } //tamamdır yaparız
    } else if (interaction.customId === "countingm_leaderboard") {
        let nowWeekExpiresDate = gamecountdb.fetch(`game.settings.restartTime`);
        let messagesTopDb = Object.keys((gamecountdb.fetch(`game.members`) || []));
        let messagesTop = messagesTopDb.length >= 1 ? messagesTopDb.map((member, index) => { 
            let userDB = gamecountdb.fetch(`game.members.${messagesTopDb[index]}`);
            userDB['id'] = member;
            return userDB;
        }).sort((a, b) => { 
            b['count'] - a['count']
         }).slice(0, 3).map((member, index) => {
            const returnedData = {
                name: `#${index + 1}`,
                value: `<@${member['id']}> **${member['count']}** mesaj.`,
                lastTimeStamp: `${member['lastTimestamp']}`
            }
            return returnedData;
        }) : [];
        const embed = new EmbedBuilder()
            .setAuthor({
                name: "Sıralama sistemi. [Mesaj]",
                iconURL: interaction.member.displayAvatarURL({ dynamic: true })
            })
            .setDescription(`Haftalık sıralama listelendi.`)
            .addFields(
                { name: `🏆 Sıralama (3/${messagesTopDb.length})`, value: `${messagesTopDb.length == 0 ? "Sıra Yok." : messagesTop.map((top, index) => `${index + 1}. ${top.value} - <t:${top.lastTimeStamp}:R>`).join('\n')}`, inline: true },
                { name: "🕐 Sıfırlanmaya kalan", value: `${nowWeekExpiresDate != null ? `<t:${nowWeekExpiresDate}:R>` : "Sıfırlanmış"}`, inline: true }
            )
            .setTimestamp()
            .setColor('Purple')
            .setFooter({
                text: "( Müdür) 0.2ms içinde işlendi. Son güncelleme", iconURL: interaction.member.displayAvatarURL({ dynamic: true })
            })
        interaction.reply({ embeds: [embed], ephemeral: true })
    } else if (interaction.customId === "countingn_leaderboard") {
        let messagesTopDb = Object.keys((gamecountdb2.fetch(`game.members`) || []));
        let messagesTop = messagesTopDb.length >= 1 ? messagesTopDb.map((member, index) => { 
            let userDB = gamecountdb2.fetch(`game.members.${messagesTopDb[index]}`);
            userDB['id'] = member;
            return userDB;
        }).sort((a, b) => { 
            b['totalActions'] - a['totalActions']
         }).slice(0, 3).map((member, index) => {
            const returnedData = {
                name: `#${index + 1}`,
                value: `<@${member['id']}> **${member['totalActions']*2}** puan.`,
                lastTimeStamp: `${member['lastNumberTimestamp']}`
            }
            return returnedData;
        }) : [];
        const embed = new EmbedBuilder()
            .setAuthor({
                name: "Sıralama sistemi. [Sayı Sayma]",
                iconURL: interaction.member.displayAvatarURL({ dynamic: true })
            })
            .setDescription(`Haftalık sıralama listelendi.`)
            .addFields(
                { name: `🏆 Sıralama (3/${messagesTopDb.length})`, value: `${messagesTopDb.length == 0 ? "Sıra Yok." : messagesTop.map((top, index) => `${index + 1}. ${top.value} - <t:${Math.floor(top.lastTimeStamp / 1000.0)}:R>`).join('\n')}`, inline: true }
                //{ name: "🕐 Sıfırlanmaya kalan", value: `${nowWeekExpiresDate != null ? `<t:${nowWeekExpiresDate}:R>` : "Sıfırlanmış"}`, inline: true }
            )
            .setTimestamp()
            .setColor('Purple')
            .setFooter({
                text: "( Müdür) 0.2ms içinde işlendi. Son güncelleme", iconURL: interaction.member.displayAvatarURL({ dynamic: true })
            })
        interaction.reply({ embeds: [embed], ephemeral: true })
    } else if (interaction.customId === "countingn_commands") {
        startCountingGame(interaction.client)
    } else if (interaction.customId === "ticketDelete") {
        const general = {
            getTicketInfo: function(id) {
                return [ db.fetch(`channels.${id}.ticketCreator`), db.fetch(`channels.${id}.ticketType`), db.fetch(`channels.${id}.createdTimestamp`)];
            },
            deleteTicket: function(id) {
                const ticketOwner = db.fetch(`channels.${id}.ticketCreator`)
                const index = db.fetch(`activeTicketMembers`).indexOf(ticketOwner)
                db.delete(`channels.${id}`)
                db.delete(`activeTicketMembers.${index}`)
                interaction.guild.channels.cache.get(id).delete();
            }

        }
        interaction.reply(`> Bu talep, ${interaction.member} tarafından sonlandırılıyor.`)
        general.deleteTicket(interaction.channel.id)
    }
}

function startCountGame() {
    const gamecountdb = new JsonDatabase({
        databasePath: "././database/games/count.json"
    })
    let timestampDateStart = convertTimestamp(getThisWeek());
    let timestampDateRestart = convertTimestamp(getRestartWeek());
    gamecountdb.set(`game.settings.startTime`, `${timestampDateStart}`);
    gamecountdb.set(`game.settings.restartTime`, `${timestampDateRestart}`);
}

function startCountingGame(client) {
    const gamecountingdb = new JsonDatabase({
        databasePath: "././database/games/counting.json"
    })
    const gameChannel = client.channels.cache.get(config.game.countingGameChannel);
    let timestampDateStart = convertTimestamp(getThisNow());
    let timestampDateRestart = convertTimestamp(getTimeRestart(timestampDateStart));
    const embed = new EmbedBuilder()
        .setAuthor({
            name: "Sayı sayma başladı!",
            iconURL: client.user.displayAvatarURL()
        })
        .setDescription(`Sayı sayma oyunu başladı! Tahmin edeceğin üzere başlangıç sayısı, **1** puanlarını toplayıp; haftalık ödüllere sahip olabilirsin!`)
        .addFields(
            { name: "Başlangıç tarihi", value: `<t:${timestampDateStart}:R>`, inline: true },
            { name: "Bitiş tarihi", value: `<t:${timestampDateRestart}:R>`, inline: true }
        )
        .setThumbnail(client.user.displayAvatarURL())
        .setTimestamp()
        .setColor('Purple')
        .setFooter({
            text: "( Müdür) 0.2ms içinde işlendi. Son güncelleme", iconURL: client.user.displayAvatarURL({ dynamic: true })
        })
    gameChannel.send({
        embeds: [embed]
    })
    gamecountingdb.set(`game.lastDatas.lastNumber`, `1`);
    gamecountingdb.set(`game.lastDatas.lastMember`, "Yazan kişi yok!")
    gamecountingdb.set(`game.settings.startTime`, `${timestampDateStart}`);
    gamecountingdb.set(`game.settings.restartTime`, `${timestampDateRestart}`);
}
 
function restartCountGame() {
    const gamecountdb = new JsonDatabase({
        databasePath: "././database/games/count.json"
    })
    gamecountdb.set(`game.settings.startTime`, `null`);
    gamecountdb.set(`game.settings.restartTime`, `null`);
    gamecountdb.delete(`game.members`)
}


function convertTimestamp(time) {
    return Math.floor(new Date(time).getTime() / 1000.0);
}

function getRestartWeek() {
    let nowDate = new Date();
    nowDate = new Date(nowDate.setDate(nowDate.getDate() + (nowDate.getDay() + 7)));
    return nowDate;
}

function getThisNow() {
    let now = new Date()
    return now;
}

function getTimeRestart() {
    let thisTime = new Date(getThisNow());
    thisTime = new Date(thisTime.setDate(thisTime.getDate() + (7)));
    return thisTime;
}

function getThisWeek() {
    let nowDate = new Date();
    nowDate = new Date(nowDate.setDate(nowDate.getDate() - (nowDate.getDay() + 0) % 7));
    return nowDate;
}

function getPrevWeek() {
    let prevDate = new Date();
    prevDate = new Date(prevDate.setDate(prevDate.getDate() - (prevDate.getDay() + 7) % 14));
    return prevDate;
}

export { once, name, invoke, restartCountGame, getThisWeek, startCountGame, startCountingGame, convertTimestamp };
