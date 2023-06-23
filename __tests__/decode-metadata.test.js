import TestUtils from './test-utils';

const walletId = 'stub_decode';

const testCases = [
  {
    title: 'partialTx empty',
    input: {
      partial_tx: 'PartialTx|0001000000000000000000000062bb48b50000000000||',
    },
    expectedObj: {
      success: true,
      tx: expect.objectContaining({
        completeSignatures: false,
        tokens: [],
        inputs: [],
        outputs: [],
      }),
      balance: expect.objectContaining({
        '00': expect.objectContaining({
          tokens: expect.objectContaining({
            available: expect.any(Number),
            locked: expect.any(Number),
          }),
          authorities: expect.objectContaining({
            melt: { available: 0, locked: 0 },
            mint: { available: 0, locked: 0 },
          }),
        }),
      }),
    },
  },
  {
    title: 'multisig HTR transfer transaction proposal',
    // - no inpunts signed
    // - outputs doesn't belong to this wallet
    input: {
      txHex: '0001000101009e1f95e402d3449c5da0a594a4ab8b0d4950ea37cc54bddc2c3c52f6fef0ee0100000000000100001976a914420a6ae9c94e71993ced5df0b720043a9f00e5d188ac0000000000000000000000000000000000'
    },
    expectedObj: {
      success: true,
      tx: expect.objectContaining({
        completeSignatures: false,
        inputs: [
          expect.objectContaining({
            signed: false,
          }),
        ],
        outputs: [
          expect.objectContaining({
            decoded: expect.objectContaining({
              mine: false,
            }),
          }),
        ],
      }),
      balance: expect.objectContaining({
        '00': expect.objectContaining({
          tokens: expect.objectContaining({
            available: expect.any(Number),
            locked: expect.any(Number),
          }),
          authorities: expect.objectContaining({
            melt: { available: 0, locked: 0 },
            mint: { available: 0, locked: 0 },
          }),
        }),
      }),
    }
  },
  {
    title: 'multisig HTR transfer transaction',
    // - inputs signed
    // - outputs doesn't belong to this wallet
    input: {
      txHex: '0001000101009e1f95e402d3449c5da0a594a4ab8b0d4950ea37cc54bddc2c3c52f6fef0ee0100d5473045022100ba9d76cf416ce1e926721c4a29151008e4c8f53c749aa5d96aec7b85394109d502204102813567f7cccf669c29a9bfcdf90b140723b632b37bf0d54f420e5268adb84c8b51210316d124d8b365cc8fd698a26d0e39349a0ca341ca8ce2361a9f2ea596a1a85cf62102726228513b7ed554e3104b927e478f261bf6d7219bf6859e07a23b524ba90f882103d6ef02ee8293b173376c56940c3899be163869fd67ad83363cb8930f0cec14ff2103bb30226c68dc146ba382ffd26851f16fb2b7caa218be4d73da50ca04ebf23b3354ae0000000100001976a914420a6ae9c94e71993ced5df0b720043a9f00e5d188ac4031a0221feae049649592390200603ec01e4628aba50dc760a62378505a8d4557680c2e85b3e66b5bdcf79cfd009e1f95e402d3449c5da0a594a4ab8b0d4950ea37cc54bddc2c3c52f6fef0ee43d673a7'
    },
    expectedObj: {
      success: true,
      tx: expect.objectContaining({
        completeSignatures: true,
        inputs: [
          expect.objectContaining({
            signed: true,
          }),
        ],
        outputs: [
          expect.objectContaining({
            decoded: expect.objectContaining({
              mine: false,
            }),
          }),
        ],
      }),
      balance: expect.objectContaining({
        '00': expect.objectContaining({
          tokens: expect.objectContaining({
            available: expect.any(Number),
            locked: expect.any(Number),
          }),
          authorities: expect.objectContaining({
            melt: { available: 0, locked: 0 },
            mint: { available: 0, locked: 0 },
          }),
        }),
      }),
    },
  },
];

describe('metadata in decode api', () => {
  beforeAll(async () => {
    global.config.multisig = TestUtils.multisigData;
    await TestUtils.startWallet({
      walletId,
      preCalculatedAddresses: TestUtils.multisigAddresses,
      multisig: true
    });
  });

  afterAll(async () => {
    global.config.multisig = {};
    await TestUtils.stopWallet({ walletId });
  });

  for (const cut of testCases) {
    if (cut.skip) {
      it.skip(cut.title, () => {});
    } else {
      it(cut.title, async () => {
        const response = await TestUtils.request
          .post('/wallet/decode')
          .send(cut.input)
          .set({ 'x-wallet-id': walletId });
        expect(response.status).toBe(200);
        expect(response.body).toEqual(cut.expectedObj);
      });
    }
  }
});
