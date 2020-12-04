const {OAuth2Client} = require('google-auth-library');

const CLIENT_ID =
	'1049332871063-ta8b26a82q8nutahg6natoi4u0elfjam.apps.googleusercontent.com';
const client = new OAuth2Client(CLIENT_ID);
const validarIdToken = async (token) => {
	try {
		const ticket = await client.verifyIdToken({
			idToken: token,
			audience: [
				CLIENT_ID,
				'1049332871063-ero11j3teojvg6gohi7rgsql6c16pch8.apps.googleusercontent.com'
			]
		});
		const payload = ticket.getPayload();
		return {
			name: payload['name'],
			picture: payload['picture'],
			email: payload['email']
		};
	} catch (error) {
		return null;
	}
};

module.exports = {
	validarIdToken
};
