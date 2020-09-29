
module.exports = {
	name: 'пинг',
	description: 'пингани бота!',
	guildOnly: true,
	aliases: ['понг'],
	execute(api: any, object: any) {
		
		api.messagesSend({
			peer_id: object.peer_id,
			message: 'Pong',
			random_id: 0
		})
	},
};