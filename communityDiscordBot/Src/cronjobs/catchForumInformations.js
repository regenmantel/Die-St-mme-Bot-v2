const config = require('../Credentials/Config');
const fs = require('fs');
const path = require('path');
const request = require('request');
const { EmbedBuilder, roleMention, AttachmentBuilder } = require('discord.js');

const catchForumInformations = async function catchForumInformations(client) {
	const guild = client.guilds.cache.get(config.server.serverId);
	const eventRole = config.server.roles.eventRole;
	const newsRole = config.server.roles.newsRole;
	const updateRole = config.server.roles.updateRole;
	const newWorldRole = config.server.roles.newWorldRole;
	const file = new AttachmentBuilder('dsBanner.png');

	let events = fs.readFileSync(path.resolve(__dirname, '../assets/list/eventfile.txt'), 'utf8').toString().split('\n');
	events = events.map((string) => string.replaceAll('\r', ''));

	const eventChannel = await client.channels.cache.find((channel) => channel.id === config.server.channels.events);
	const newsChannel = await client.channels.cache.find((channel) => channel.id === config.server.channels.newsChannelID);
	const updateChannel = await client.channels.cache.find((channel) => channel.id === config.server.channels.updateChannelID);
	const newWorldChannel = await client.channels.cache.find((channel) => channel.id === config.server.channels.newWorldChannelID);

	request('https://forum.die-staemme.de/index.php?forums/ank%C3%BCndigungen.180/', function (error, response, body) {
		const jsdom = require('jsdom');
		const dom = new jsdom.JSDOM(body);
		const jquery = require('jquery')(dom.window);
		jquery('.structItem--thread').each(async function () {
			const eventFlag = jquery(this).find('.labelLink').length != 0;
			let href;
			let value;
			if (eventFlag) {
				href = jquery(this).find('.structItem-title').children().eq(1).attr('href');
				value = jquery(this).find('.structItem-title').children().eq(1).text();
				if (!events.includes(href)) {
					fs.appendFile(path.resolve(path.resolve(__dirname, '../assets/list/eventfile.txt')), '\n' + href, async (err) => {
						if (!err) {
							request('https://forum.die-staemme.de' + href, async function (error, response, body) {
								const dom2 = new jsdom.JSDOM(body);
								const jquery2 = require('jquery')(dom2.window);
								let eventInfos = jquery2('.bbWrapper').text();
								eventInfos = eventInfos.replaceAll('\t', '');
								eventInfos = eventInfos.replaceAll('\n', '');
								eventInfos = eventInfos.replaceAll('  ', ' ');

								/*let eventStartReg = /Eventstart\D+(?<day>\d+)\W+(?<month>\d+|\w+)\W+(?<year>\d+)\D+(?<time>\d+\W\d+)/g;
								let eventEndReg = /Eventende\D+(?<day>\d+)\W+(?<month>\d+|\w+)\W+(?<year>\d+)\D+(?<time>\d+\W\d+)/g;
								let eventWorldsReg = /Eventbeschreibung\:\s+(?<eventName>.+)Teilnehmende\sSpielwelten\:\s+(?<eventWorlds>.+)(Wir)/g;*/
								let eventStartReg = /Eventstart\:\s+\w+\W+(?<day>\d+)\W+(?<month>\S+)\s+(?<year>\d+)\s+\w+\s+(?<time>\d+\W\d+)/g;
								let eventEndReg = /Eventende\:\s+\w+\W+(?<day>\d+)\W+(?<month>\S+)\s+(?<year>\d+)\s+\w+\s+(?<time>\d+\W\d+)/g;
								let eventNameReg = /Eventbeschreibung\:\s*(?<eventName>.+)Teilnehmende\sSpielwelten\:\s+(?<eventWorlds>.+)(Wir)/g;
								let match, eventStartDay, eventStartMonth, eventStartYear, eventStartTime;
								let eventEndDay, eventEndMonth, eventEndYear, eventEndTime;
								let eventWorlds = '';
								let eventName = '';

								while ((match = eventStartReg.exec(eventInfos))) {
									eventStartDay = match.groups['day'];
									eventStartMonth = match.groups['month'];
									eventStartYear = match.groups['year'];
									eventStartTime = match.groups['time'];
								}

								while ((match = eventEndReg.exec(eventInfos))) {
									eventEndDay = match.groups['day'];
									eventEndMonth = match.groups['month'];
									eventEndYear = match.groups['year'];
									eventEndTime = match.groups['time'];
								}

								while ((match = eventNameReg.exec(eventInfos))) {
									eventName = match.groups['eventName'];
									eventWorlds = match.groups['eventWorlds'];
								}

								if (eventStartDay !== undefined && eventEndDay !== undefined && eventWorlds !== undefined) {
									const eventEmbed = new EmbedBuilder()
										.setTitle(`Es startet schon bald ein neues Event!`)
										.setAuthor({
											name: `Die Stämme Events`,
											iconURL: `${guild.iconURL()}`,
										})
										.setThumbnail('https://dsde.innogamescdn.com/asset/525cce89/graphic/start/favicon/favicon-32x32.png')
										.setURL('https://forum.die-staemme.de' + href)
										.addFields(
											{
												name: 'Eventname:',
												value: eventName,
												inline: false,
											},
											{
												name: 'Eventstart:',
												value: `${eventStartDay}. ${eventStartMonth} ${eventStartYear}, ${eventStartTime}`,
												inline: false,
											},
											{
												name: 'Eventende:',
												value: `${eventEndDay}. ${eventEndMonth} ${eventEndYear}, ${eventEndTime}`,
												inline: false,
											},
											{
												name: 'Teilnehmende Welten:',
												value: `${eventWorlds}`,
												inline: false,
											},
										)
										.setColor(0xed3d7d)
										.setImage('attachment://dsBanner.png');
									await eventChannel.send({
										content: `${roleMention(eventRole)}\n\n🎆 Ein neues Event startet bald. Hier findet ihr die Infos. 🎆`,
										embeds: [eventEmbed],
										files: [file],
									});
								} else {
									const eventEmbed = new EmbedBuilder()
										.setTitle(`Es startet schon bald ein neues Event!`)
										.setAuthor({
											name: `Die Stämme Events`,
											iconURL: `${guild.iconURL()}`,
										})
										.setThumbnail('https://dsde.innogamescdn.com/asset/525cce89/graphic/start/favicon/favicon-32x32.png')
										.setURL('https://forum.die-staemme.de' + href)
										.addFields({ name: 'Eventname:', value: value, inline: false })
										.setColor(0xed3d7d)
										.setImage('attachment://dsBanner.png');
									await eventChannel.send({
										content: `${roleMention(eventRole)}\n\n🎆 Ein neues Event startet bald. Hier findet ihr die Infos. 🎆`,
										embeds: [eventEmbed],
										files: [file],
									});
								}
							});
						}
					});
				}
			} else {
				href = jquery(this).find('.structItem-title').children().eq(0).attr('href');
				value = jquery(this).find('.structItem-title').children().eq(0).text();
				if (!events.includes(href)) {
					fs.appendFile(path.resolve(path.resolve(__dirname, '../assets/list/eventfile.txt')), '\n' + href, async (err) => {
						const newsEmbed = new EmbedBuilder()
							.setTitle(`Eine allgemeine Ankündigung ist im Forum!`)
							.setAuthor({
								name: `Die Stämme Ankündigung`,
								iconURL: `${guild.iconURL()}`,
							})
							.setThumbnail('https://dsde.innogamescdn.com/asset/525cce89/graphic/start/favicon/favicon-32x32.png')
							.setURL('https://forum.die-staemme.de' + href)
							.addFields({
								name: 'Ankündigung:',
								value: value,
								inline: false,
							})
							.setColor(0xed3d7d)
							.setImage('attachment://dsBanner.png');
						await newsChannel.send({
							content: `${roleMention(newsRole)}\n\n📜 Ein neue Ankündigung ist im Forum. Hier findet ihr die Infos. 📜`,
							embeds: [newsEmbed],
							files: [file],
						});
					});
				}
			}
		});
	});

	request('https://forum.die-staemme.de/index.php?forums/updates.872/', function (error, response, body) {
		const jsdom = require('jsdom');
		const dom = new jsdom.JSDOM(body);
		const jquery = require('jquery')(dom.window);
		jquery('.structItem--thread').each(async function () {
			const eventFlag = jquery(this).find('.labelLink').length != 0;
			let href;
			let value;
			if (eventFlag) {
				href = jquery(this).find('.structItem-title').children().eq(1).attr('href');
				value = jquery(this).find('.structItem-title').children().eq(1).text();
				if (!events.includes(href)) {
					fs.appendFile(path.resolve(path.resolve(__dirname, '../assets/list/eventfile.txt')), '\n' + href, async (err) => {
						if (!err) {
							const eventEmbed = new EmbedBuilder()
								.setTitle(`Es kommt demnächst eine neues Update!`)
								.setAuthor({
									name: `Die Stämme Update`,
									iconURL: `${guild.iconURL()}`,
								})
								.setThumbnail('https://dsde.innogamescdn.com/asset/525cce89/graphic/start/favicon/favicon-32x32.png')
								.setURL('https://forum.die-staemme.de' + href)
								.addFields({ name: 'Update:', value: value, inline: false })
								.setColor(0xed3d7d)
								.setImage('attachment://dsBanner.png');
							await updateChannel.send({
								content: `${roleMention(updateRole)}\n\n🎲 Ein neues Update kommt bald. Hier findet ihr die Infos. 🎲`,
								embeds: [eventEmbed],
								files: [file],
							});
						}
					});
				}
			} else {
				href = jquery(this).find('.structItem-title').children().eq(0).attr('href');
				value = jquery(this).find('.structItem-title').children().eq(0).text();
				if (!events.includes(href)) {
					fs.appendFile(path.resolve(path.resolve(__dirname, '../assets/list/eventfile.txt')), '\n' + href, async (err) => {
						const eventEmbed = new EmbedBuilder()
							.setTitle(`Es kommt demnächst eine neues Update!`)
							.setAuthor({
								name: `Die Stämme Update`,
								iconURL: `${guild.iconURL()}`,
							})
							.setThumbnail('https://dsde.innogamescdn.com/asset/525cce89/graphic/start/favicon/favicon-32x32.png')
							.setURL('https://forum.die-staemme.de' + href)
							.addFields({ name: 'Update:', value: value, inline: false })
							.setColor(0xed3d7d)
							.setImage('attachment://dsBanner.png');
						await updateChannel.send({
							content: `${roleMention(updateRole)}\n\n🎲 Ein neues Update kommt bald. Hier findet ihr die Infos. 🎲`,
							embeds: [eventEmbed],
							files: [file],
						});
					});
				}
			}
		});
	});

	request('https://forum.die-staemme.de/index.php?forums/neue-welten.873/', function (error, response, body) {
		const jsdom = require('jsdom');
		const dom = new jsdom.JSDOM(body);
		const jquery = require('jquery')(dom.window);
		jquery('.structItem--thread').each(async function () {
			const eventFlag = jquery(this).find('.labelLink').length != 0;
			let href;
			let value;
			if (eventFlag) {
				href = jquery(this).find('.structItem-title').children().eq(1).attr('href');
				value = jquery(this).find('.structItem-title').children().eq(1).text();
				if (!events.includes(href)) {
					fs.appendFile(path.resolve(path.resolve(__dirname, '../assets/list/eventfile.txt')), '\n' + href, async (err) => {
						if (!err) {
							request('https://forum.die-staemme.de' + href, async function (error, response, body) {
								const dom2 = new jsdom.JSDOM(body);
								const jquery2 = require('jquery')(dom2.window);
								let eventInfos = jquery2('.bbWrapper').text();
								eventInfos = eventInfos.replaceAll('\t', '');
								eventInfos = eventInfos.replaceAll('\n', '');
								eventInfos = eventInfos.replaceAll('  ', ' ');

								let eventStartReg = /(?<day>\d+)\W+(?<month>\d+|\w+)\W+(?<year>\d+)\D+(?<time>\d+\W\d+)\s+Uhr/g;
								let match, eventStartDay, eventStartMonth, eventStartYear, eventStartTime;

								while ((match = eventStartReg.exec(eventInfos))) {
									eventStartDay = match.groups['day'];
									eventStartMonth = match.groups['month'];
									eventStartYear = match.groups['year'];
									eventStartTime = match.groups['time'];
								}

								if (eventStartDay !== undefined) {
									const eventEmbed = new EmbedBuilder()
										.setTitle(`Es starten schon bald neue Welten!`)
										.setAuthor({
											name: `Die Stämme Welten`,
											iconURL: `${guild.iconURL()}`,
										})
										.setThumbnail('https://dsde.innogamescdn.com/asset/525cce89/graphic/start/favicon/favicon-32x32.png')
										.setURL('https://forum.die-staemme.de' + href)
										.addFields(
											{
												name: 'Welten:',
												value: value,
												inline: false,
											},
											{
												name: 'Weltenstart:',
												value: `${eventStartDay}.${eventStartMonth}.${eventStartYear}, ${eventStartTime} Uhr`,
												inline: false,
											},
										)
										.setColor(0xed3d7d)
										.setImage('attachment://dsBanner.png');
									await newWorldChannel.send({
										content: `${roleMention(newWorldRole)}\n\n🌍 Eine neue Welt startet bald. Hier findet ihr die Infos. 🌍`,
										embeds: [eventEmbed],
										files: [file],
									});
								} else {
									const eventEmbed = new EmbedBuilder()
										.setTitle(`Es starten schon bald neue Welten!`)
										.setAuthor({
											name: `Die Stämme Welten`,
											iconURL: `${guild.iconURL()}`,
										})
										.setThumbnail('https://dsde.innogamescdn.com/asset/525cce89/graphic/start/favicon/favicon-32x32.png')
										.setURL('https://forum.die-staemme.de' + href)
										.addFields({ name: 'Welten:', value: value, inline: false })
										.setColor(0xed3d7d)
										.setImage('attachment://dsBanner.png');
									await newWorldChannel.send({
										content: `${roleMention(newWorldRole)}\n\n🌍 Eine neue Welt startet bald. Hier findet ihr die Infos. 🌍`,
										embeds: [eventEmbed],
										files: [file],
									});
								}
							});
						}
					});
				}
			} else {
				href = jquery(this).find('.structItem-title').children().eq(0).attr('href');
				value = jquery(this).find('.structItem-title').children().eq(0).text();
				if (!events.includes(href)) {
					fs.appendFile(path.resolve(path.resolve(__dirname, '../assets/list/eventfile.txt')), '\n' + href, async (err) => {
						const newsEmbed = new EmbedBuilder()
							.setTitle(`Es startet demnächst eine neue Sonderwelt!`)
							.setAuthor({
								name: `Die Stämme Welten`,
								iconURL: `${guild.iconURL()}`,
							})
							.setThumbnail('https://dsde.innogamescdn.com/asset/525cce89/graphic/start/favicon/favicon-32x32.png')
							.setURL('https://forum.die-staemme.de' + href)
							.addFields({
								name: 'Sonderwelt:',
								value: value,
								inline: false,
							})
							.setColor(0xed3d7d)
							.setImage('attachment://dsBanner.png');
						await newWorldChannel.send({
							content: `${roleMention(newWorldRole)}🌍 Eine neue Welt startet bald. Hier findet ihr die Infos. 🌍`,
							embeds: [newsEmbed],
							files: [file],
						});
					});
				}
			}
		});
	});

	return new Promise((resolve) => {
		resolve();
	});
};

exports.catchForumInformations = catchForumInformations;
