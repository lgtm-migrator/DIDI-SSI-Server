const { findByDID, createApp } = require('../../services/AppAuthService');
const {
  missingDid, missingName,
} = require('../../constants/serviceErrors');

describe('Should be green', () => {
  /**
   * findByDID
   */
  test('Expect findByDID to throw on missing did', async () => {
    try {
      await findByDID(undefined);
    } catch (e) {
      expect(e.code).toMatch(missingDid.code);
    }
  });

  /**
   * createApp
   */
  test('Expect createApp to throw on missing did', async () => {
    try {
      await createApp(undefined, 'name');
    } catch (e) {
      expect(e.code).toMatch(missingDid.code);
    }
  });

  test('Expect createApp to throw on missing name', async () => {
    try {
      await createApp('did', undefined);
    } catch (e) {
      expect(e.code).toMatch(missingName.code);
    }
  });
});
