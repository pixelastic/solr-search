'use strict';

/* global instantsearch */
var search = instantsearch({
  appId: 'MXM0JWJNIW',
  apiKey: 'fb1b0d41de5d1a9d24727d6d85b6b375',
  indexName: 'solr'
});

search.addWidget(instantsearch.widgets.searchBox({
  container: '#searchbox',
  placeholder: 'Search in Solr documentation'
}));

search.addWidget(instantsearch.widgets.hits({
  container: '#hits'
}));

search.start();
