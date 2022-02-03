// discord.js classes
const fs = require('fs');
const { Client, Collection, Intents, MessageEmbed } = require('discord.js');
const { token, apikey } = require('./config.json');
const request = require('request-promise');

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

client.eqobj = new Collection();

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	// Set a new item in the Collection
	// With the key as the command name and the value as the exported module
	client.commands.set(command.data.name, command);
}

// When the client is ready, run this code only once
client.once('ready', () => {
	console.log('Ready!');
	// get api data every 9s
	chkEQ();
	setInterval(chkEQ, 9000);
});

// check current time
function chkCurT() {
	const now = new Date();

	const year = now.getFullYear();
	const month = ('0' + (now.getMonth() + 1)).slice(-2);
	const day = ('0' + now.getDate()).slice(-2);
	const yday = ('0' + (now.getDate() - 1)).slice(-2);
	const hour = ('0' + now.getHours()).slice(-2);
	const min = ('0' + now.getMinutes()).slice(-2);
	const sec = ('0' + now.getSeconds()).slice(-2);

	const today = year.toString() + month.toString() + day.toString();
	const yesterday = year.toString() + month.toString() + yday.toString();
	const tdDay = now.getDate();
	const curTime = `${year.toString().slice(-2)}-${month.toString()}-${day.toString()} ${hour.toString()}:${min.toString()}:${sec.toString()}`;

	const data = { today, yesterday, tdDay, curTime };
	return data;
}

// set notification reply
function noti(i) {
	const data = client.eqobj.response.body.items.item[i];

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

	/* fcTp 통보종류
	2: 국외 지진정보
	3: 국내 지진정보
	5: 국내 지진정보(재통보)
	11: 국내 지진조기경보
	12: 국외 지진조기경보
	13: 조기경보 정밀분석
	14: 지진속보(조기분석)
	*/
	var text, embed, isEmbed;
	if (data.fcTp == 11 || data.fcTp == 12) {
		// 지진조기경보
		if (data.inT) text = `[지진조기경보]\n${data.loc}에서 규모 ${data.mt.toFixed(1)}의 지진이 발생했습니다. 흔들림에 주의하십시오. ${data.inT}`;
		else text = `[지진조기경보]\n${data.loc}에서 규모 ${data.mt.toFixed(1)}의 지진이 발생했습니다. 흔들림에 주의하십시오.`;
	}
	else if (data.fcTp == 13) {
		// 조기경보 정밀분석
		text = `방금 전 ${tmEqk.str}에 ${data.loc}에서 규모 ${data.mt.toFixed(1)}의 지진이 발생했습니다.`;
		embed = new MessageEmbed()
			.setTitle('지진조기경보 정밀분석')
			.setImage(data.img)
			.addFields(
				{ name: '위치', value: data.loc, inline: true },
				{ name: '지진발생시각', value: tmEqk.str, inline: true },
				{ name: '규모', value: data.mt.toFixed(1), inline: true },
			)
			.setFooter({ text: '정보: 기상청' });
		if (data.inT) embed.addField('진도', data.inT, true);
		if (data.dep) embed.addField('깊이', data.dep.toString() + 'km', true);
		if (data.rem) embed.addField('참고사항', data.rem);
		isEmbed = true;
	}
	else if (data.fcTp == 14) {
		// 지진속보(조기분석)
		if (data.inT) text = `[지진속보]\n${data.loc}에서 규모 ${data.mt.toFixed(1)}의 지진이 발생했습니다. ${data.inT}`;
		else text = `[지진속보]\n${data.loc}에서 규모 ${data.mt.toFixed(1)}의 지진이 발생했습니다.`;
	}
	else {
		text = `${data.loc}에서 ${tmEqk.str}에 규모 ${data.mt.toFixed(1)}의 지진이 발생했습니다.`;
		embed = new MessageEmbed()
			.setFooter({ text: '정보: 기상청' });
		if (data.inT) {
			isEmbed = true;
			embed.addField('진도', data.inT, true);
		}
		if (data.dep) {
			isEmbed = true;
			embed.addField('깊이', data.dep.toString() + 'km', true);
		}
		if (data.rem) {
			isEmbed = true;
			embed.addField('참고사항', data.rem);
		}
	}

	return { text, embed, isEmbed };
}

// earthquake api
async function chkEQ() {
	// get current time
	const now = chkCurT();
	// make api request url
	const url = `http://apis.data.go.kr/1360000/EqkInfoService/getEqkMsg?serviceKey=${apikey}&dataType=JSON&fromTmFc=${now.yesterday}&toTmFc=${now.today}`;

	// api request
	try {
		await request(url, function(err, response, body) {
			if (err) throw (err);
			try {
				const jsondata = JSON.parse(body);
				client.eqobj = jsondata;
			}
			catch (error) {
				console.log(`[${now.curTime}]Error on json parsing: ${error}\nbody:\n${body}`);
			}
		});
	}
	catch (er) {
		console.log(`[${now.curTime}]Error on get data: ${er}`);
	}

	// check new data
	var checked;
	try {
		checked = JSON.parse(fs.readFileSync('checked-list.json'));
		if (checked.todayDate != now.tdDay) {
			checked.list = checked.todaylist;
			checked.todaylist = [];
			checked.todayDate = now.tdDay;
			console.log('checked-list reset');
			fs.writeFileSync('checked-list.json', JSON.stringify(checked));
		}
	}
	catch (err) {
		console.log('There is no file. Making new file.');
		fs.writeFileSync('checked-list.json', `{"todayDate":"${now.tdDay}","list":[],"todaylist":[]}`);
		checked = JSON.parse(fs.readFileSync('checked-list.json'));
	}

	if (client.eqobj.response.body) {
		for (var i in client.eqobj.response.body.items.item) {
			const data = client.eqobj.response.body.items.item[i];
			var isChecked;
			for (var j in checked.list) {
				if (data.tmSeq == checked.list[j]) {
					isChecked = true;
					break;
				}
			}
			if (!isChecked) {
				client.guilds.cache.forEach(guild => {
					const replys = noti(i);
					const channel = guild.channels.cache.find(ch => ch.type == 'GUILD_TEXT' && ch.permissionsFor(client.user.id).has('SEND_MESSAGES'));
					if (channel) {
						if (replys.isEmbed == true) {
							channel.send({ content: replys.text, embeds: [replys.embed] });
						}
						else {
							channel.send({ content: replys.text });
						}
					}
				});
				checked.list.push(data.tmSeq);
				checked.todaylist.push(data.tmSeq);
				fs.writeFileSync('checked-list.json', JSON.stringify(checked));
			}
		}
	}
}

// interactions
client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;

	const command = client.commands.get(interaction.commandName);

	if (!command) return;

	try {
		await command.execute(interaction);
	}
	catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

// Login to Discord with token
client.login(token);