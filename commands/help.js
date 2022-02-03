const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('봇정보')
		.setDescription('지진알림봇을 소개합니다!'),
	async execute(interaction) {
		await interaction.reply('지진알림봇은 기상청 API를 사용해 지진에 대한 정보를 알려드립니다.\n지진이 발생하면 실시간으로 정보를 전송하고, 명령어를 입력해 지진의 정보를 자세히 알아볼 수 있습니다.');
	},
};