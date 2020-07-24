const { SEMILLAS_URLS, SEMILLAS_LOGIN } = require("../constants/Constants");
const fetch = require("node-fetch");
const { getOptionsAuth, postOptions, postOptionsAuth } = require("../constants/RequestOptions");
const SemillasAuth = require("../models/SemillasAuth");

const prestadores = require("../constants/MockPrestadores");

module.exports.login = async function () {
	try {
		const { username, password } = SEMILLAS_LOGIN;
		const data = { username, password };
		const res = await fetch(SEMILLAS_URLS.LOGIN, postOptions(data));
		const json = await res.json();
		return json;
	} catch (err) {
		console.log(err);
		return Promise.reject(err);
	}
};

module.exports.sendDIDandDNI = async function ({ dni, did }) {
	try {
		const data = { dni, did };
		const token = await SemillasAuth.getToken();
		const res = await fetch(SEMILLAS_URLS.CREDENTIALS_DIDI, postOptionsAuth(data, token));
		const didi = await res.json();
		return didi;
	} catch (err) {
		console.log(err);
		return Promise.reject(err);
	}
};

module.exports.shareEmail = async function ({ email }) {
	try {
		const data = { email };
		// const token = await getToken();
		// const res = await fetch(SEMILLAS_URLS.SHARE_EMAIL, postOptionsAuth(data, token));
		// const json = await res.json();
		return data;
	} catch (err) {
		console.log(err);
		return Promise.reject(err);
	}
};

module.exports.getPrestadores = async function (token) {
	try {
		// const prestadores = await fetch(SEMILLAS_URLS.PRESTADORES, getOptionsAuth(token));
		return prestadores;
	} catch (err) {
		console.log(err);
		return Promise.reject(err);
	}
};
