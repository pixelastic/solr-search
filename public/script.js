'use strict';

/* global instantsearch, _, $, mediumZoom  */

var $zoomImg = $('#zoom');
var zoom = mediumZoom('#zoom');

var search = instantsearch({
  appId: 'MXM0JWJNIW',
  apiKey: 'fb1b0d41de5d1a9d24727d6d85b6b375',
  indexName: 'solr',
  searchParameters: {
    highlightPreTag: '<span class="text-blue font-bold">',
    highlightPostTag: '</span>',
    hitsPerPage: 16
  }
});

search.addWidget(instantsearch.widgets.searchBox({
  container: '#searchbox',
  placeholder: 'Search in Solr documentation',
  cssClasses: {
    root: 'max-w-100'
  }
}));

search.addWidget(instantsearch.widgets.hits({
  container: '#hits',
  cssClasses: {
    root: 'flrw flspa'
  },
  templates: {
    allItems: function allItems(response) {
      return _.map(response.hits, function (hit) {
        var paddedId = ('' + hit.pageId).padStart(4, '0');
        var png = './png/' + paddedId + '.png';
        var content = hit._snippetResult.content.value;
        var title = '';
        if (hit._highlightResult.hierarchy) {
          title = hit._highlightResult.hierarchy[0].value;
        }
        var page = hit.pageId - 5;
        return '\n        <div class="fln p-0+ mb-1 border-1 cursor-pointer" data-zoom-target="' + png + '">\n          <div class="bg-cover bg-no-repeat w-page h-page flcnw" style="background-image:url(' + png + ');">\n            <div class="fla flcnw">\n              <div class="fln text-red font-bold bg-white-75 py-1 px-0+">\n                <div>' + title + '</div>\n              </div>\n              <div class="fla flrnw flc">\n                <div class="text-grey-darkest text-1 italic max-w-page overflow-hidden mx-1 p-0+ rounded bg-white-75">' + content + '</div>\n              </div>\n            </div>\n            <div class="fln text-right p-0+ italic text--1 bg-white-75">Page ' + page + '</div>\n          </div>\n\n        </div>\n          ';
      }).join(' ');
    }
  }
}));

search.start();

$('#hits').on('click', '[data-zoom-target]', function (event) {
  var element = event.currentTarget;
  var png = $(element).data('zoom-target');
  $zoomImg.attr('src', png);
  zoom.show();
  return false;
});
