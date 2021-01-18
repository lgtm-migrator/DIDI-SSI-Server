const { json } = require("body-parser");
const Messages = require("../constants/Messages");
const Presentation = require("../models/Presentation");

const { GET, CREATE, NOT_FOUND, EXPIRED } = Messages.PRESENTATION.ERR;

module.exports.savePresentation = async function ({ jwts }) {
	try {
		const jwtsParsed = JSON.parse(jwts);
		return Presentation.generate({ jwts: jwtsParsed });
	} catch (e) {
		console.log(e);
		throw CREATE;
	}
};

module.exports.getPresentation = async function ({ id }) {
	try {
		const presentation = await Presentation.getById(id);

		// Valido que la presentacion exista
		if (!presentation) return Promise.reject(NOT_FOUND);

		// Valido que no haya expirado
		const { expireOn } = presentation;
		if (new Date(expireOn) < new Date()) return Promise.reject(EXPIRED);

		return presentation;
	} catch (e) {
		console.log(e);
		throw GET;
	}
};