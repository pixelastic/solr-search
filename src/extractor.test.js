import module from './extractor.js';
// jest.mock('request-promise');
// const request = require('request-promise');

describe('extractor', () => {
  // afterEach(() => {
  //   jest.resetAllMocks();
  //   jest.restoreAllMocks();
  // });
  describe('init', () => {
    // beforeEach(() => {
    //   request.mockReturnValue(Promise.resolve());
    // });
    // afterEach(() => {
    //   request.mockReset();
    // });

    it('should return an object with self-methods', () => {
      const input = './fixtures/0100.html';

      const actual = module.init(input);

      expect(actual).toHaveProperty('getRecords');
    });
  });

  describe('getRecords', () => {
    it('should get one record ', () => {
      // Given
      // When
      // Then
    });
  });
});
