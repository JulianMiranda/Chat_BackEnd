const {response} = require('express');
var admin = require('firebase-admin');
const bcrypt = require('bcryptjs');

var adminFire = admin.initializeApp();

const Usuario = require('../models/usuario');
const {generarJWT} = require('../helpers/jwt');
const usuario = require('../models/usuario');
const {validarIdToken} = require('../helpers/google-verify-token');

const crearUsuario = async (req, res = response) => {
	const {email, password} = req.body;

	try {
		const existeEmail = await Usuario.findOne({email});
		if (existeEmail) {
			return res.status(400).json({
				ok: false,
				msg: 'El correo ya está registrado'
			});
		}

		const usuario = new Usuario(req.body);

		// Encriptar contraseña
		const salt = bcrypt.genSaltSync();
		usuario.password = bcrypt.hashSync(password, salt);

		await usuario.save();

		// Generar mi JWT
		const token = await generarJWT(usuario.id);

		res.json({
			ok: true,
			usuario,
			token
		});
	} catch (error) {
		console.log(error);
		res.status(500).json({
			ok: false,
			msg: 'Hable con el administrador'
		});
	}
};

const login = async (req, res = response) => {
	const {email, password} = req.body;

	try {
		const usuarioDB = await Usuario.findOne({email});
		if (!usuarioDB) {
			return res.status(404).json({
				ok: false,
				msg: 'Email no encontrado'
			});
		}

		// Validar el password
		const validPassword = bcrypt.compareSync(password, usuarioDB.password);
		if (!validPassword) {
			return res.status(400).json({
				ok: false,
				msg: 'La contraseña no es valida'
			});
		}

		// Generar el JWT
		const token = await generarJWT(usuarioDB.id);

		res.json({
			ok: true,
			usuario: usuarioDB,
			token
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			ok: false,
			msg: 'Hable con el administrador'
		});
	}
};

const loginFirebase = async (req, res = response) => {
	const {token} = req.body;

	try {
		const userFire = await adminFire.auth().verifyIdToken(token);
		console.log(userFire);

		/* const usuarioDB = await Usuario.findOne({email});
		if (!usuarioDB) {
			return res.status(404).json({
				ok: false,
				msg: 'Email no encontrado'
			});
		} */

		// Validar el password
		/* const validPassword = bcrypt.compareSync(password, usuarioDB.password);
		if (!validPassword) {
			return res.status(400).json({
				ok: false,
				msg: 'La contraseña no es valida'
			});
		} */

		// Generar el JWT
		/* const token = await generarJWT(usuarioDB.id); */

		res.json({
			ok: true,
			usuario: userFire,
			token
		});
	} catch (error) {
		console.log(error);
		return res.status(500).json({
			ok: false,
			msg: 'Hable con el administrador'
		});
	}
};

const renewToken = async (req, res = response) => {
	const uid = req.uid;

	// generar un nuevo JWT, generarJWT... uid...
	const token = await generarJWT(uid);

	// Obtener el usuario por el UID, Usuario.findById...
	const usuario = await Usuario.findById(uid);

	res.json({
		ok: true,
		usuario,
		token
	});
};

const googleAuth = async (req, res = response) => {
	const {token} = req.body;
	if (!token) {
		return res.json({ok: false, msg: 'Invalid Token'});
	}
	const googleUser = await validarIdToken(token);

	if (!googleUser) {
		return res.status(400).json({ok: false});
	}
	const emailGoogle = googleUser.email;

	const existeEmail = await Usuario.findOne({email: emailGoogle});

	if (existeEmail) {
		res.json({
			ok: true,
			usuario: existeEmail,
			token
		});
	} else {
		const user = {
			nombre: googleUser.name,
			email: googleUser.email,
			password: 'googleUser'
		};
		const usuario = new Usuario(user);

		/* const salt = bcrypt.genSaltSync();
		usuario.password = bcrypt.hashSync(password, salt); */

		await usuario.save();
		const myToken = await generarJWT(usuario.id);
		res.json({
			ok: true,
			usuario,
			token: myToken
		});
	}
};

module.exports = {
	crearUsuario,
	login,
	renewToken,
	googleAuth,
	loginFirebase
};
