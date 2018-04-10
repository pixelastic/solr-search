/* eslint-disable no-process-exit */
const _ = require('lodash');
const fs = require('fs');
const algoliasearch = require('algoliasearch');
const jsonfile = require('jsonfile');
const Promise = require('bluebird');

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
  attributesToSnippet: ['content:55'],
  snippetEllipsisText: '…',
  distinct: true,
  attributeForDistinct: 'pageId',
};

index
  .clearIndex()
  .then(() => {
    console.info('Index cleared');
  })
  .then(() => index.setSettings(settings))
  .then(() => {
    console.info('Settings set');
  })
  .then(() =>
    Promise.all(
      _.map(_.chunk(records, 500), (chunk, id) =>
        index.addObjects(chunk).then(() => {
          console.info(`chunk ${id} loaded`);
        })
      )
    )
  )
  .then(() => {
    console.info('finished');
    process.exit();
  });

//   .then(() => index.addObjects(records))
