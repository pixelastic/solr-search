import module from './html.js';
const fs = require('fs');

function fixture(id) {
  return module.init(fs.readFileSync(`./fixtures/${id}.html`).toString());
}

describe('html', () => {
  describe('getRawTextNodes', () => {
    it('should find all .t nodes', () => {
      const actual = fixture('0100').getRawTextNodes();

      expect(actual).toHaveLength(38);
    });
  });

  describe('getTextNodes', () => {
    it('should get all text nodes', () => {
      const actual = fixture('0100').getTextNodes();

      expect(actual).toHaveLength(13);
    });

    it('should merge list items together', () => {
      const actual = fixture('0102').getTextNodes();

      expect(actual).toHaveLength(18);
    });

    describe('clean up content', () => {
      it('should style the links', () => {
        const actual = fixture('0102').getTextNodes()[12];

        expect(actual.content).toContain('<span class="link">Configuring Logging</span>')
      });
      it('should clean list items', () => {
        const actual = fixture('0102').getTextNodes()[12];

        expect(actual.content).toMatch(/^The default Solr/)
      });
    });
  });
});
