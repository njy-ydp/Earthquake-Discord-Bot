const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('최근지진')
		.setDescription('가장 최근 발생한 지진을 알려드려요.'),
	async execute(interaction) {

		// earthquake data from client.eqobj
		const data = interaction.client.eqobj.response.body.items.item[0];

		// set time to string
		var tmEqk = {};
		tmEqk.y = data.tmEqk.toString().slice(0, 4);
		tmEqk.m = data.tmEqk.toString().slice(4, 6);
		tmEqk.d = data.tmEqk.toString().slice(6, 8);
		tmEqk.hh = data.tmEqk.toString().slice(8, 10);
		tmEqk.mm = data.tmEqk.toString().slice(10, 12);
		tmEqk.ss = data.tmEqk.toString().slice(12);

		if (tmEqk.m < 10) tmEqk.m = tmEqk.m.slice(-1);
		if (tmEqk.d < 10) tmEqk.d = tmEqk.d.slice(-1);
		if (tmEqk.hh < 10) tmEqk.hh = tmEqk.hh.slice(-1);
		if (tmEqk.mm < 10) tmEqk.mm = tmEqk.mm.slice(-1);
		if (tmEqk.ss < 10) tmEqk.ss = tmEqk.ss.slice(-1);

		tmEqk.str = `${tmEqk.y}년 ${tmEqk.m}월 ${tmEqk.d}일 ${tmEqk.hh}시 ${tmEqk.mm}분 ${tmEqk.ss}초`;

		// set description
		const descript = data.loc + '에서 규모' + data.mt.toFixed(1) + '의 지진이 발생하였습니다.';

		// set reply message
		const reply = new MessageEmbed()
			.setTitle('최근지진')
			.setImage(data.img)
			.setDescription(descript)
			.addFields(
				{ name: '위치', value: data.loc, inline: true },
				{ name: '지진발생시각', value: tmEqk.str, inline: true },
				{ name: '규모', value: data.mt.toFixed(1), inline: true },
			)
			.setFooter({ text: '정보: 기상청' });

		if (data.inT) reply.addField('진도', data.inT, true);
		if (data.dep) reply.addField('깊이', data.dep.toString() + 'km', true);
		if (data.rem) reply.addField('참고사항', data.rem);

		await interaction.reply({ embeds: [reply] });
	},
};