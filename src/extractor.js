const fs = require('fs');
const html = require('./html');

module.exports = {
  init(filepath) {
    const fileContent = fs.readFileSync(filepath).toString();
    const rawNodes = html.init(fileContent).getTextNodes();

    return {
      getRecords() {
        return rawNodes;
      },
    };
  },
};
