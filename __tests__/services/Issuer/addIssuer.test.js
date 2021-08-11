const mongoose = require('mongoose');
const { MONGO_URL } = require('../../../constants/Constants');
const { addIssuer } = require('../../../services/IssuerService');
const { missingDid, missingName, missingDescription } = require('../../../constants/serviceErrors');
const { revokeDelegate } = require('../../../services/BlockchainService');
const { data } = require('./constatns');
const Messages = require('../../../constants/Messages');

xdescribe('services/Issuer/addIssuer.test.js', () => {
  const { did, name, description } = data;
  beforeAll(async () => {
    await mongoose
      .connect(MONGO_URL, {
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
        useNewUrlParser: true,
      });
  });
  afterAll(async () => {
    await revokeDelegate(did);
    await mongoose.connection.db.dropCollection('issuers');
    await mongoose.connection.close();
  });

  test('Expect addIssuer to throw on missing did', async () => {
    try {
      await addIssuer(undefined, 'name', 'description');
    } catch (e) {
      expect(e.code).toMatch(missingDid.code);
    }
  });

  test('Expect addIssuer to throw on missing name', async () => {
    try {
      await addIssuer('did', undefined, 'description');
    } catch (e) {
      expect(e.code).toMatch(missingName.code);
    }
  });

  test('Expect addIssuer to throw on missing description', async () => {
    try {
      await addIssuer('did', 'name', undefined);
    } catch (e) {
      expect(e.code).toMatch(missingDescription.code);
    }
  });

  test('Expect addIssuer to success', async () => {
    const response = await addIssuer(did, name, description);
    expect(response.did).toMatch(did);
    expect(response.name).toMatch(name);
    expect(response.description).toMatch(description);
    expect(response.deleted).toBe(false);
    expect(response.expireOne).not.toBe(null);
    expect(response.blockHash).not.toBe(null);
  });

  test('Expect addIssuer to throw error on existent did', async () => {
    try {
      await addIssuer(did, name, description);
    } catch (e) {
      expect(e).toBe(Messages.ISSUER.ERR.DID_EXISTS);
    }
  });
});
