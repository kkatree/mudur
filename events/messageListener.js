import { ActionRow, ActionRowBuilder, ButtonBuilder, Embed, EmbedBuilder, StringSelectMenuBuilder } from "discord.js";
import { JsonDatabase } from "wio.db";
import { convertTimestamp, getThisWeek, restartCountGame } from "./buttonListener.js";
import config from '../config.json' assert {type: 'json'};

const once = false;
const name = 'messageCreate';

async function invoke(message) {
    const gamecountdb = new JsonDatabase({
        databasePath: "././database/games/count.json"
    })
    const gamecountingdb = new JsonDatabase({
        databasePath: "././database/games/counting.json"
    })
    if (message.author.bot) return;
    if (gamecountdb.fetch(`game.settings.status`) === "true") {
        gamecountdb.add(`game.members.${message.member.id}.count`, 1);
        let convertingExpires = await convertTimestamp(new Date().getTime())
        gamecountdb.set(`game.members.${message.member.id}.lastTimestamp`, await convertingExpires);
        const thisWeekTimestamp = await convertTimestamp(getThisWeek());
    } else {
        return;
    }
    if (message.content.includes("destek") || message.content.includes("destek istiyorum")) {
        const button = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("ticket_button_forward")
                    .setLabel('Talep açmak için tıkla.')
                    .setStyle('Primary')
            )
        message.reply({
            components: [button]
        }).then((m) => {
            setTimeout(() => {
                m.delete();
                message.delete();
            }, 5000)
        });
    }

    if (message.channel.id === config.game.countingGameChannel) {
        const gameStatus = gamecountingdb.fetch(`settings.status`);
        const general = {
            saveDatas: function(message) {
                gamecountingdb.set(`game.lastDatas.lastMember`, message.member.id);
                gamecountingdb.set(`game.lastDatas.lastNumberTimestamp`, message.createdTimestamp);
                gamecountingdb.set(`game.lastDatas.lastNumber`, message.content)
            },
            setMemberDatas: function(message) {
                gamecountingdb.set(`game.members.${message.member.id}.lastNumber`, message.content);
                gamecountingdb.set(`game.members.${message.member.id}.lastNumberTimestamp`, message.createdTimestamp);
                gamecountingdb.add(`game.members.${message.member.id}.totalActions`, 1);
            },
            getMemberInfo: function(member) {

            },
            getLastMember: function() {
                return gamecountingdb.fetch(`game.lastDatas.lastMember`);
            },
            messageAddReact: function(message) {
                message.react('❤')
            },
            nextNumber: function() {
                return Math.floor(gamecountingdb.fetch(`game.lastDatas.lastNumber`) + 1);
            },
            thisNumber: function() {
                return gamecountingdb.fetch(`game.lastDatas.lastNumber`);
            },
            createNotThisNumberEmbed: function() {
                const embed = new EmbedBuilder()   
                    .setDescription(`> Yazacağın sayı bu değil, düzenli şekilde takip etmeyi unutma dostum!`)
                    .setTimestamp()
                    .setColor('Purple')
                    .setFooter({
                        text: "( Müdür) 0.2ms içinde işlendi. Son güncelleme", iconURL: message.member.displayAvatarURL({ dynamic: true })
                    })
                return embed;
            },
            createNotNumberEmbed: function() {
                const embed = new EmbedBuilder()   
                    .setDescription(`> Yazdığın bir sayı değil, bizimle alay mı ediyorsun acaba?`)
                    .setTimestamp()
                    .setColor('Purple')
                    .setFooter({
                        text: "( Müdür) 0.2ms içinde işlendi. Son güncelleme", iconURL: message.member.displayAvatarURL({ dynamic: true })
                    })
                return embed;
            },
            createAlreadyMember: function() {
                const embed = new EmbedBuilder()   
                    .setDescription(`> Son yazan kişi sensin zaten...`)
                    .setTimestamp()
                    .setColor('Purple')
                    .setFooter({
                        text: "( Müdür) 0.2ms içinde işlendi. Son güncelleme", iconURL: message.member.displayAvatarURL({ dynamic: true })
                    })
            return embed;  
            }
        }
        
        if (!gameStatus === true) return;
        if (isNaN(message.content)) return message.reply({ embeds: [general.createNotNumberEmbed()] }).then((m) => setTimeout(() => { message.delete() 
                                                                                                                                m.delete() }, 3000))
        if (message.content != parseInt(general.thisNumber()) + 1) return message.reply({ embeds: [general.createNotThisNumberEmbed()] }).then((m) => setTimeout(() => { message.delete() 
            m.delete() }, 3000))
        if (general.getLastMember() === message.member.id) return message.reply({ embeds: [general.createAlreadyMember()] }).then((m) => setTimeout(() => { message.delete() 
            m.delete() }, 3000)) 
        general.saveDatas(message)
        general.setMemberDatas(message)
        general.messageAddReact(message)
    }
}

function restartCounting() {
    db.set(`game.lastDatas`, null)
}

export { once, name, invoke };
