const {response} = require('express');
const Mensaje = require('../models/mensaje');

const getMensajes = async (req, res = response) => {
	const myId = req.uid;
	const mensajeTo = req.params.from;

	const last30 = await Mensaje.find({
		$or: [
			{from: myId, to: mensajeTo},
			{from: mensajeTo, to: myId}
		]
	})
		.sort({createdAt: 'desc'})
		.limit(30);
	res.json({
		ok: true,
		mensajes: last30
	});
};

module.exports = {
	getMensajes
};
