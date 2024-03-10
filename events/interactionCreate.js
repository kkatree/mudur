const once = false;
const name = 'interactionCreate';
import { ActionRowBuilder, Events, ModalBuilder, TextInputBuilder, TextInputStyle } from 'discord.js'

async function invoke(interaction) {
	if (interaction.isChatInputCommand())
		(await import(`#commands/${interaction.commandName}`)).invoke(interaction);

	if (interaction.customId === "ticket_send") {
		const modal = new ModalBuilder()
			.setCustomId('ticket_modal')
			.setTitle('🎾 Talep Kurulumu');
		const favoriteColorInput = new TextInputBuilder()
			.setCustomId('ticket_setup_channel')
			.setRequired(true)
			.setLabel("Hangi kanala gönderilsin? (ID)")
			.setStyle(TextInputStyle.Short);

		const hobbiesInput = new TextInputBuilder()
			.setCustomId('ticket_category_id')
			.setRequired(true)
			.setLabel("Talepler nereye açılsın? (ID)")
			.setStyle(TextInputStyle.Short);

		const firstActionRow = new ActionRowBuilder().addComponents(favoriteColorInput);
		const secondActionRow = new ActionRowBuilder().addComponents(hobbiesInput);

		modal.addComponents(firstActionRow, secondActionRow);

		await interaction.showModal(modal);
	}
}

export { once, name, invoke };
