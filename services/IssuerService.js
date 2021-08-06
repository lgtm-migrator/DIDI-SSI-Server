/* eslint-disable no-console */
const fetch = require('node-fetch');

const Issuer = require('../models/Issuer');
const DelegateTransaction = require('../models/DelegateTransaction');

const BlockchainService = require('./BlockchainService');

const Constants = require('../constants/Constants');
const Messages = require('../constants/Messages');
const { putOptionsAuth } = require('../constants/RequestOptions');
const { createImage } = require('./utils/createImage');

const {
  missingDid,
  missingName,
  missingUrl,
  missingToken,
  missingData,
  missingCallback,
  missingAction,
  missingContentType,
  missingPath,
  missingDescription,
} = require('../constants/serviceErrors');

/**
 *  Crea un nuevo issuer
 */
module.exports.addIssuer = async function addIssuer(did, name, description) {
  if (!did) throw missingDid;
  if (!name) throw missingName;
  if (!description) throw missingDescription;

  // Verificar que el issuer no exista
  const byDIDExist = await Issuer.getByDID(did);
  if (byDIDExist) throw Messages.ISSUER.ERR.DID_EXISTS;

  // Realizar delegacion en la blockchain
  const { transactionHash, ...rest } = await BlockchainService.addDelegate(did);
  if (Constants.DEBUGG) console.log({ transactionHash, ...rest });

  // Asignar fecha de expiracion
  const expireOn = new Date();
  if (Constants.BLOCKCHAIN.DELEGATE_DURATION) {
    expireOn.setSeconds(expireOn.getSeconds() + Number(Constants.BLOCKCHAIN.DELEGATE_DURATION));
  }

  return Issuer.create({
    name, did, expireOn, blockHash: transactionHash, description,
  });
};

/**
 *  Permite editar el nombre de un issuer a partir de un did
 */
module.exports.editData = async function editData(did, name, description) {
  if (!did) throw missingDid;
  try {
    let issuer = await Issuer.getByDID(did);
    if (!issuer) throw Messages.ISSUER.ERR.DID_NOT_EXISTS;

    issuer = await issuer.edit({ name, description });

    return issuer;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

/**
 *  Refrescar issuer (nueva fecha de expiración y hash)
 */
module.exports.refresh = async function refresh(did) {
  if (!did) throw missingDid;
  // Verificar que el issuer no exista o haya sido borrado
  const byDIDExist = await Issuer.getByDID(did);
  if (!byDIDExist || byDIDExist.deleted) throw Messages.ISSUER.ERR.DID_NOT_EXISTS;

  try {
    const { transactionHash, ...rest } = await BlockchainService.addDelegate(did);
    if (Constants.DEBUGG) console.log({ transactionHash, ...rest });

    const expireOn = new Date();
    if (Constants.BLOCKCHAIN.DELEGATE_DURATION) {
      expireOn.setSeconds(expireOn.getSeconds() + Number(Constants.BLOCKCHAIN.DELEGATE_DURATION));
    }

    await byDIDExist.edit({ expireOn, blockHash: transactionHash });

    return { ...byDIDExist, expireOn, blockHash: transactionHash };
  } catch (err) {
    console.log(err);
    throw err;
  }
};

/**
 *  Devuelve informacion de un issuer según su did
 */
module.exports.getIssuerByDID = async function getIssuerByDID(did) {
  if (!did) throw missingDid;
  try {
    return await Issuer.getByDID(did);
  } catch (err) {
    console.log(err);
    throw err;
  }
};

/**
 *  Devuelve informacion de todos los issuer delegados
 */
module.exports.getAll = async function getAll(limit, page) {
  return Issuer.getAll(limit, page);
};

/**
 *  Envia respuesta a la url indicada
 */
module.exports.callback = async function callback(url, did, token, data) {
  if (!did) throw missingDid;
  if (!url) throw missingUrl;
  if (!token) throw missingToken;
  if (!data) throw missingData;
  try {
    const response = await fetch(`${url}/${did}`, putOptionsAuth(token, data));
    const jsonResp = await response.json();

    if (jsonResp.status === 'error') throw jsonResp;

    return jsonResp;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

/**
 *  Permite manejar autorización para emitir credenciales de un issuer dada una action
 */
module.exports.createDelegateTransaction = async function createDelegateTransaction({
  did, name, callbackUrl, token, action, description,
}) {
  if (!did) throw missingDid;
  if (!callbackUrl) throw missingCallback;
  if (!token) throw missingToken;
  if (!action) throw missingAction;
  try {
    return await DelegateTransaction.create({
      did, name, callbackUrl, token, action, description,
    });
  } catch (err) {
    console.log(err);
    throw err;
  }
};

/**
 *  Obtener issuer y actualizar imagen
 */
module.exports.saveImage = async function saveImage(did, contentType, path) {
  if (!did) throw missingDid;
  if (!contentType) throw missingContentType;
  if (!path) throw missingPath;
  try {
    // Obtener información de usuario
    const issuer = await Issuer.getByDID(did);
    if (!issuer) throw Messages.ISSUER.ERR.DID_NOT_EXISTS;

    const imageId = await createImage(path, contentType);

    // Actualizar imagen del usuario
    await issuer.updateImage(imageId);

    return Promise.resolve(imageId);
  } catch (err) {
    console.log(err);
    return Promise.reject(Messages.IMAGE.ERR.CREATE);
  }
};
