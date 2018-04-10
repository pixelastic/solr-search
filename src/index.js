const _ = require('lodash');
const extractor = require('./extractor');
const stringify = require('json-stable-stringify');
const fs = require('fs');

let records = [];
_.each(_.range(6, 1200), pageId => {
  console.info(`Page: ${pageId}`);
  records = records.concat(extractor.init(pageId).getRecords());
});

fs.writeFileSync('./records.json', stringify(records, { space: '  ' }));

// console.info(records);
