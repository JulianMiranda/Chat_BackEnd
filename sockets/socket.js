const {io} = require('../index');
const {checkToken} = require('../helpers/jwt');
const {
	userConnected,
	userDisconnected,
	grabarMensaje
} = require('../controllers/socket');

// Mensajes de Sockets
io.on('connection', (client) => {
	const [valido, uid] = checkToken(client.handshake.headers['x-token']);

	if (!valido) {
		return client.disconnect();
	}
	userConnected(uid);

	client.join(uid);

	client.on('message-personal', async (payload) => {
		await grabarMensaje(payload);
		io.to(payload.to).emit('message-personal', payload);
	});

	client.on('disconnect', () => {
		userDisconnected(uid);
	});

	// client.on('mensaje', ( payload ) => {
	//     console.log('Mensaje', payload);
	//     io.emit( 'mensaje', { admin: 'Nuevo mensaje' } );
	// });
});
