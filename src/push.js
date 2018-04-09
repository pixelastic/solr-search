/* eslint-disable no-process-exit */
const _ = require('lodash');
const fs = require('fs');
const algoliasearch = require('algoliasearch');
const jsonfile = require('jsonfile');

const appId = 'MXM0JWJNIW';
const indexName = 'solr';

// Checks the apiKey in ENV and local file
let apiKey = process.env.ALGOLIA_API_KEY;
if (fs.existsSync('./_algolia_api_key')) {
  apiKey = _.trim(fs.readFileSync('./_algolia_api_key', 'utf8'));
}
if (!apiKey) {
  console.info('Usage:');
  console.info('$ ALGOLIA_API_KEY=XXXXX yarn run push');
  process.exit();
}
const client = algoliasearch(appId, apiKey);
const index = client.initIndex(indexName);

const records = jsonfile.readFileSync('./records.json');
const settings = {
  attributesToIndex: ['unordered(content)', 'unordered(hierarchy)'],
  customRanking: [
    'desc(ranking.headerWeight)',
    'desc(ranking.index)',
    'asc(pageId)',
  ],
  distinct: true,
  attributeForDistinct: 'pageId',
};

index
  .clearIndex()
  .then(() => {
    index.setSettings(settings);
  })
  .then(() => {
    index.addObjects(records);
  })
  .then(() => {
    console.info('finished');
  });
