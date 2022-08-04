require('dotenv').config()
const { MessageEmbed } = require('discord.js');
const api = require('./webAPI.js');
var client, guildId, auto = false, isSetImage = false;

const getSeconds = (time)=>{
	var sec = (time * 60);
	return (sec * 1000);
}

const isOwner = (id)=>{
	var _id = process.env.OWNERID || null;
	if(!_id) return true;
	if(id === _id) return true;
	return false;
}

setInterval(async ()=>{
	if(auto && guildId){
		var json = await api();
		if(json.status === 200){
		json = json.data;
		guildId.setNickname(`${json.name} $${json.price}`)
	    if(!isSetImage){
			try{
				c.user.setAvatar(json.image);
				isSetImage = true;
			}catch(e){
				console.log(e);
			}
		}		
		var msg = `${json.name} is Updated!`, _cid = process.env.LOGCHANNEL || null;
		if(_cid){
		client.channels.cache.get().send(msg);
		}
		console.log(msg);
		
		}
	}
}, getSeconds(process.env.AUTOUPDATETIME));

async function manual(i, c){
	await i.deferReply();
	var json = await api();
	if(json.status === 200){
		json = json.data;
		guildId.setNickname(`${json.name} $${json.price}`)
		if(!isSetImage){
			try{
				c.user.setAvatar(json.image);
				isSetImage = true;
			}catch(e){
				console.log(e);
			}
		}
		i.editReply({content: `Ok ${json.name} Bot is Reload!`})
	}else{
		i.editReply({content: `Have Error with ${c.user.tag} Bot!`})
	}
}

function getHostname(){
	return new URL(process.env.API).hostname;
}

async function requestInfo(i, d){
	var json = await api(d.type, d.target);
	try{
		if(json.status === 200){
			const _embedResponse = new MessageEmbed()
				.setColor('#0099ff')
				.setTitle(json.data.name)
				.setURL(`https://${getHostname()}/`)
				.setAuthor({ name: json.data.name, iconURL: json.data.image })
				.setDescription(`${json.data.name} Price is: $ ${json.data.price}`)
				.addFields([{name: 'Currency: ', value: d.target }, {name:'Info Delivered from: ', value: getHostname()}])
				.setTimestamp()
				.setFooter({ text: `LastUpdate at: ${json.data.lastupdate}`, iconURL: json.data.image });
			await i.reply({ embeds: [_embedResponse]});
		}else{
			await i.reply({content: `Have Error ${json.status}!`})
		}
	}catch(e){
		console.log(e);
		await i.reply({content: `Have Some Error try Again!`})
	}
}

async function status(i, t, c){
	switch(t.toLowerCase()){
		case "online":
		    c.user.setStatus('visible');
		    await i.reply(`Bot Go  in ${t} Status!`);
		    break;
		case "offline":
		    c.user.setStatus('invisible');
		    await i.reply(`Bot Go  in ${t} Status!`);
		    break;
		default:
		   await i.reply(`This ${t} Status Not Support use Online, Offline!`);
		   break;
	}
}



module.exports = async (i, c)=>{
	client = c;
	guildId = await i.guild.members.cache.get(c.user.id)
	if(!guildId)
		throw new Error("Guild ID Error")
	const { commandName, options } = i;
	switch(commandName){
		case "ping":
		   await i.reply('Pong!');
		   break;
		case "manualupdate":
		    if(isOwner(i.user.id)){
				manual(i, c);
		    }else{
				await i.reply('Hmmm Only Owner can use this Command!');
			}
		   break;
		case "autoupdate":
			if(isOwner(i.user.id)){
				if(auto){
					auto = false;
					await i.reply('AutoUpdate Disabled!');			   
				}else{
					auto = true;
					await i.reply(`AutoUpdate Ever ${process.env.AUTOUPDATETIME} minutes Enabled!`);
				}
			}else{
				await i.reply('Hmmm Only Owner can use this Command!');
			}
		   break;
		case "status":
		    if(isOwner(i.user.id)){
				const opt_two = options._hoistedOptions;
				for(var s=0; s<opt_two.length; s++) {
				if(opt_two[s].name ==="type")
					status(i, opt_two[s].value, c);
				}
			}else{
				await i.reply('Hmmm Only Owner can use this Command!');
			}
            break;
		case "info":
            var type, target
    	    const opt = options._hoistedOptions;
    	    for(var s=0; s<opt.length; s++) {
            if(opt[s].name ==="type")
                type = opt[s].value
            if(opt[s].name ==="target")
                target = opt[s].value
            } 
            requestInfo(i, { type:type, target:target, client: c });
            break;
		default:
		   await i.reply('Hmmm Missing Command!');
	}
	
}