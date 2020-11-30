const User = require('../models/usuario');
const Mensaje = require('../models/mensaje');

const userConnected = async (uid = '') => {
	const usuario = await User.findById(uid);
	usuario.online = true;
	await usuario.save();
	return usuario;
};
const userDisconnected = async (uid = '') => {
	const usuario = await User.findById(uid);
	usuario.online = false;
	await usuario.save();
	return usuario;
};
const grabarMensaje = async (payload) => {
	try {
		const mensaje = new Mensaje(payload);
		await mensaje.save();
		return true;
	} catch (e) {
		return false;
	}
};

module.exports = {
	userConnected,
	userDisconnected,
	grabarMensaje
};
