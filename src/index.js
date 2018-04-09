const _ = require('lodash');
const extractor = require('./extractor');

let records = [];
_.each(_.range(100, 102), pageId => {
  console.info(`Page: ${pageId}`);
  records += extractor.init(pageId).getRecords();
});

console.info(records);
