/* global instantsearch, _, $, mediumZoom  */

const $zoomImg = $('#zoom');
const zoom = mediumZoom('#zoom');
$('#hits').on('click', '[data-zoom-target]', event => {
  const element = event.currentTarget;
  const png = $(element).data('zoom-target');
  $zoomImg.attr('src', png);
  zoom.show();
  return false;
});

const currentUrl = window.location.href;
const isLocalhost = currentUrl === 'http://127.0.0.1:8080/';

function allItemsTemplate(response) {
  return _.map(response.hits, hit => {
    const paddedId = `${hit.pageId}`.padStart(4, '0');
    const sourcePng = `${currentUrl}png/${paddedId}.png`;
    let backgroundPng = sourcePng;
    let zoomPng = sourcePng;
    if (!isLocalhost) {
      backgroundPng = cloudinary(sourcePng, {
        width: 265,
        height: 345,
        quality: 70,
        format: 'auto',
      });
      zoomPng = cloudinary(sourcePng, {
        width: 1575,
        height: 1650,
        quality: 80,
        format: 'auto',
      });
    }
    const content = hit._snippetResult.content.value;
    let title = '';
    if (hit._highlightResult.hierarchy) {
      title = hit._highlightResult.hierarchy[0].value;
    }
    const page = hit.pageId - 5;
    return `
  <div class="fln p-0+ mb-1 border-1 relative cursor-pointer" data-zoom-target="${zoomPng}">
    <div class="absolute pin hover:bg-red-25"></div>
    <div class="bg-cover bg-no-repeat w-page h-page flcnw" style="background-image:url(${backgroundPng});">
      <div class="fla flcnw">
        <div class="fln text-red font-bold bg-white-75 py-1 px-0+">
          <div>${title}</div>
        </div>
        <div class="fla flrnw flc">
          <div class="text-grey-darkest text-1 italic max-w-page overflow-hidden mx-1 p-0+ rounded bg-white-75">${content}</div>
        </div>
      </div>
      <div class="fln text-right p-0+ italic text--1 bg-white-75">Page ${page}</div>
    </div>

  </div>
    `;
  }).join(' ');
}

function cloudinary(sourceUrl, options) {
  const baseUrl = 'https://res.cloudinary.com/hilnmyskv/image/fetch/';
  const stringOptions = [];

  // Handle common Cloudinary options
  if (options.width) {
    stringOptions.push(`w_${options.width}`);
  }
  if (options.height) {
    stringOptions.push(`h_${options.height}`);
  }
  if (options.quality) {
    stringOptions.push(`q_${options.quality}`);
  }
  if (options.crop) {
    stringOptions.push(`c_${options.crop}`);
  }
  if (options.format) {
    stringOptions.push(`f_${options.format}`);
  }
  if (options.colorize) {
    stringOptions.push(`e_colorize:${options.colorize}`);
  }
  if (options.color) {
    stringOptions.push(`co_rgb:${options.color}`);
  }
  if (options.gravity) {
    stringOptions.push(`g_${options.gravity}`);
  }

  // Fix remote urls
  const url = sourceUrl.replace(/^\/\//, 'http://');

  return `${baseUrl}${stringOptions.join(',')}/${url}`;
}

const search = instantsearch({
  appId: 'MXM0JWJNIW',
  apiKey: 'fb1b0d41de5d1a9d24727d6d85b6b375',
  indexName: 'solr',
  searchParameters: {
    highlightPreTag: '<span class="text-blue font-bold">',
    highlightPostTag: '</span>',
    hitsPerPage: 16,
  },
});

search.addWidget(
  instantsearch.widgets.searchBox({
    container: '#searchbox',
    placeholder: 'Search in Solr documentation',
    cssClasses: {
      root: 'max-w-100',
    },
  })
);

search.addWidget(
  instantsearch.widgets.hits({
    container: '#hits',
    cssClasses: {
      root: 'flrw flspa',
    },
    templates: {
      allItems: allItemsTemplate,
    },
  })
);

search.start();
