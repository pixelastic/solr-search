const fs = require('fs');
const html = require('./html');
const _ = require('lodash');

module.exports = {
  init(pageId) {
    const filename = `${pageId}`.padStart(4, '0');
    const filepath = `./src/html/${filename}.html`;
    const fileContent = fs.readFileSync(filepath).toString();

    return {
      getRecords() {
        const nodes = html.init(fileContent).getTextNodes();

        const records = [];
        const hierarchy = {};
        _.each(nodes, node => {
          if (_.startsWith(node.type, 'h')) {
            const level = _.parseInt(node.type.replace('h', ''));
            // Save this level
            hierarchy[level] = node.content;
            // Clear all the following
            _.each(_.range(level + 1, 6), index => {
              hierarchy[index] = null;
            });
            return;
          }

          records.push({
            pageId: pageId,
            hierarchy: _.compact(_.values(hierarchy)),
            content: node.content,
          });
        });

        return records;
      },
    };
  },
};
