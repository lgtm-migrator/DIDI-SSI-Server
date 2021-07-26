/* eslint-disable max-len */
const ResponseHandler = require('../../utils/ResponseHandler');
const IssuerService = require('../../services/IssuerService');
const Messages = require('../../constants/Messages');
const Constants = require('../../constants/Constants');

const updateIssuerDataByDid = async (req, res) => {
  try {
    const { did } = req.params;
    const { name, description } = req.body;
    const { path, mimetype, size } = req.file;

    // Actualizar nombre y descripcion
    const issuer = await IssuerService.editData(did, name, description);

    // Actualizar imagen
    if (path && mimetype && size) {
      if (size > Constants.MAX_MB * 1000000) return ResponseHandler.sendErr(res, Messages.IMAGE.ERR.INVALID_SIZE);
      const result = await IssuerService.saveImage(did, mimetype, path);
      console.log('imagen del issuer');
      console.log(result);
    }

    return ResponseHandler.sendRes(res, issuer.name);
  } catch (err) {
    return ResponseHandler.sendErr(res, err);
  }
};

module.exports = {
  updateIssuerDataByDid,
};
