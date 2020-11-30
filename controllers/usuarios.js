const {response} = require('express');
const User = require('../models/usuario');

const getUsuarios = async (req, res = response) => {
	const desde = Number(req.query.desde) || 0;
	const usuarios = await User.find({_id: {$ne: req.uid}})
		.sort('-online')
		.skip(desde)
		.limit(20);
	res.json({
		ok: true,
		usuarios: usuarios
	});
};

module.exports = {
	getUsuarios
};
