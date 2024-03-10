import { ActionRow, ActionRowBuilder, ButtonBuilder, EmbedBuilder } from "discord.js";
import { JsonDatabase } from "wio.db";

const once = false;
const name = 'interactionCreate';

async function invoke(interaction) {
	
    if (!interaction.isModalSubmit()) return;

    if (interaction.customId === "ticket_modal") {
        const ticketChannel = interaction.fields.getTextInputValue('ticket_setup_channel');
        const ticketCategory = interaction.fields.getTextInputValue('ticket_category_id');
        const db = new JsonDatabase({
            databasePath: "././database/ticket.json"
        })
        await db.set("settings.category", ticketCategory)
        const ticketChannelFetch = interaction.guild.channels.cache.get(ticketChannel);
        
        const ticketEmbed = new EmbedBuilder()
            .setAuthor({
                name: "Talep açılış.",
                iconURL: interaction.member.displayAvatarURL({ dynamic: true })
            })
            .setDescription(":wave: Merhabalar, talep sisteminin mesajına hoş geldiniz! Sanırsam bir yerde takıldınız veya bizim için en kötüsü! Yoksa hakkınız? Umarım bu olmamıştır, bu tür sorunlarınızı çözmemiz için talep açın!")
            .setTimestamp()
            .setColor('Purple')
			.setFooter({
				text: "( Müdür) 0.2ms içinde işlendi. Son güncelleme", iconURL: interaction.member.displayAvatarURL({ dynamic: true })
			})
			.setTimestamp()
            .setImage("https://cdn.discordapp.com/attachments/1071516021954990210/1086022450384490526/banner.jpg")
            .addFields(
                { name: "🎈 Yönlendirme", value: "Talep açmak için tıkla!" }
            )
        const buttons = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId("ticket_button_forward")
                    .setEmoji("🎈")
                    .setLabel("Yönlendirme")
                    .setStyle('Success')
            )
        await ticketChannelFetch.send({ embeds: [ticketEmbed], components: [buttons] })
        interaction.reply({
            content: "Talep mesajı gönderildi. " + `${ticketChannelFetch}`,
            ephemeral: true
        });

    }
}

export { once, name, invoke };
