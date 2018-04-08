// const entities = new (require('html-entities')).AllHtmlEntities();


const extractor = require('./extractor');
const testFile = './src/html/0102.html';

console.info(extractor.init(testFile).getRecords());
process.exit();

function forceContentAsArray(allLines) {
  return _.map(allLines, line => {
    if (!_.isArray(line.content)) {
      line.content = [line.content];
    }
    return line;
  });
}
function cleanHTMLEntities(input) {
  if (_.isPlainObject(input)) {
    return {
      ...input,
      content: _.map(input.content, cleanHTMLEntities),
    };
  }

  if (_.isString(input)) {
    return entities.decode(input).replace('’', "'");
  }

  return 'NOT FOUND';
}

function replaceInlineCode(lines) {
  return _.map(lines, line => {
    const newContent = _.map(line.content, initialContent => {
      const $ = cheerio.load(`<div class="root">${initialContent}</div>`);
      const root = $('.root');

      // Code examples
      $('.ff3').each((index, node) => {
        const $node = $(node);
        $node.replaceWith(`<code>${$node.html()}</code>`);
      });

      // Bold elements
      $('.ff1').each((index, node) => {
        const $node = $(node);
        $node.replaceWith(`<em>${$node.html()}</em>`);
      });

      // Links
      $('.fc2').each((index, node) => {
        const $node = $(node);
        $node.replaceWith(`<span class="link">${$node.html()}</span>`);
      });

      // Leftovers after a code
      $('.ff2').each((index, node) => {
        const $node = $(node);
        $node.replaceWith($node.html());
      });

      return root.html();
    });

    return {
      ...line,
      content: newContent,
    };
  });
}

loadHTML(testFile)
  .then(getAllLines)
  .then(removeFooter)
  .then(removeHeader)
  .then(groupParagraphs)
  .then(groupCode)
  .then(forceContentAsArray)
  .then(replaceInlineCode)
  .then(allLines => _.map(allLines, cleanHTMLEntities))
  .then(result => console.info(result));
