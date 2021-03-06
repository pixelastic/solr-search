const cheerio = require('cheerio');
const cssToObject = require('css-to-object');
const entities = new (require('html-entities')).AllHtmlEntities();
const _ = require('lodash');

module.exports = {
  init(htmlContent) {
    const $ = cheerio.load(htmlContent);
    const cssTree = this.getCSSTree($);

    return {
      getRawTextNodes() {
        return $('.t');
      },
      getTextNodes() {
        let rawNodes = this.getRawTextNodes();
        rawNodes = this.__removeNonIndexable(rawNodes);

        let nodes = this.__groupNodesByPosition(rawNodes);
        nodes = this.__cleanupContent(nodes);

        return nodes;
      },
      getNodeType(node) {
        const color = this.__getColor(node);
        const size = this.__getSize(node);
        const height = this.__getHeight(node);
        if (color === 'orange') {
          if (size === 84) {
            return 'h1';
          }
          if (size === 76) {
            return 'h2';
          }
          if (size === 64) {
            return 'h3';
          }
          if (size === 52) {
            return 'h4';
          }
          if (size === 40) {
            return 'h5';
          }
          if (size === 36) {
            return 'h6';
          }
        }

        if (color === 'gray') {
          if (size === 36 && height === 32) {
            return 'footer';
          }
          if (size === 40 && height === 30) {
            return 'header';
          }
          if (size === 40 && height === 27) {
            return 'code';
          }

          // Title of a code example
          if (size === 40 && height === 33) {
            return 'h7';
          }

          // Regular text
          if (size === 40 && height === 35) {
            return 'text';
          }
          // Last line of a text paragraph starting with some code
          if (size === 44) {
            return 'text';
          }
          // Page 126, the text uses those sizes...
          if (size === 52 && height === 46) {
            return 'text';
          }
        }

        if (color === 'blue') {
          // A line if text that starts with a blue word is still considered text
          if (size === 40) {
            return 'text';
          }
          if (size === 23) {
            return 'annotation';
          }
          // Blue and Code, at the start of a line. Let's simplify it to simple
          // text
          if (size === 44) {
            return 'text'
          }
        }

        // Image caption
        if (color === 'darkred') {
          return 'caption';
        }

        // Highlighted code example
        if (color === 'code') {
          return 'highlighted_code';
        }

        const content = $(node).html();
        if (content.match(/^&#xF0/)) {
          return 'icon';
        }
        if (content.match(/^&#x246/)) {
          return 'icon';
        }

        if (content.match(/^&#xCA;/)) {
          return 'highlighted_code';
        }

        console.info($(node).html(), color, size, height);

        return 'nope';
      },

      // Remove header, footers, icons
      __removeNonIndexable(rawNodes) {
        return _.reject(rawNodes, node =>
          _.includes(
            [
              'header',
              'footer',
              'icon',
              'caption',
              'highlighted_code',
              'annotation',
              'nope'
            ],
            this.getNodeType(node)
          )
        );
      },

      // Group nodes that are close together
      __groupNodesByPosition(rawNodes) {
        const nodes = [];
        let tmpStack = [];
        _.each(rawNodes, (rawNode, index) => {
          // Check current and next node position
          const $rawNode = $(rawNode);
          const currentNodePosition = this.__getBottomPosition($rawNode);
          let nextNodePosition = -9999;
          if (rawNodes[index + 1]) {
            nextNodePosition = this.__getBottomPosition(rawNodes[index + 1]);
          }

          const isListItem = this.__isListItem($rawNode);
          let gapThreshold = 20;
          if (isListItem) {
            gapThreshold = 15;
          }

          // Too far appart, we need to add them
          if (currentNodePosition - nextNodePosition > gapThreshold) {
            let content = $rawNode.html();

            // We have something in the stack, we need to add it
            if (tmpStack.length > 0) {
              tmpStack.push($rawNode);
              content = _.map(tmpStack, tmpNode => tmpNode.html()).join('\n');
              tmpStack = [];
            }

            nodes.push({ type: this.getNodeType($rawNode), content });
            return;
          }

          // Too close, we keep in the stack
          tmpStack.push($rawNode);
        });
        return nodes;
      },
      // Cleanup content by removing unused HTML
      __cleanupContent(nodes) {
        return _.map(nodes, node => {
          let content = node.content;
          content = this.__replaceBlueLink(content);

          // Removing list bullet point
          content = content.replace('&#x2022;', '');

          const $_ = cheerio.load(`<div class="root">${content}</div>`);
          const $root = $_('.root');

          // Remove spaces added around list items
          $_('._').remove();
          // Remove unused .ls0
          _.each($_('.ls0'), unusedNode => {
            const $unusedNode = $(unusedNode);
            $unusedNode.replaceWith($unusedNode.html());
          });
          // Replace inline code
          _.each($_('.ff3'), inlineCodeNode => {
            const $inlineCodeNode = $(inlineCodeNode);
            $inlineCodeNode.replaceWith(
              `<span class="code">${$inlineCodeNode.html()}</span>`
            );
          });

          // Finding the new element content
          content = $root.html();
          content = entities.decode(content).replace('’', "'");

          return {
            ...node,
            content,
          };
        });
      },
      __replaceBlueLink(initialContent) {
        // Creating a local context to find elements inside
        const $_ = cheerio.load(`<div class="root">${initialContent}</div>`);
        const root = $_('.root');
        // Finding all elements that change color, but only keeping the blue
        // ones
        _.each($_('.fc1,.fc2,.fc3,.fc4,.fc5', root), node => {
          const $node = $(node);
          const color = this.__getColor($node);
          if (color !== 'blue') {
            return;
          }

          // Replacing the content with the new one
          const content = $node.html();
          $node.replaceWith(`<span class="link">${content}</span>`);
        });

        return root.html();
      },

      // Given a node and a prefix, returns the classname that starts with this
      // prefix
      __getClassStartingWith(node, prefix) {
        return _.filter(
          $(node)
            .attr('class')
            .split(' '),
          className => _.startsWith(className, prefix)
        )[0];
      },
      // Converts a px value into an int
      __parseCSSValueToInt(value) {
        return _.parseInt(value.replace('px', ''));
      },
      // Returns the position from the bottom of a given node
      __getBottomPosition(node) {
        const positionClassName = this.__getClassStartingWith(node, 'y');
        return this.__parseCSSValueToInt(
          cssTree[`.${positionClassName}`].bottom
        );
      },
      // Returns the node color
      __getColor(node) {
        const colorClass = this.__getClassStartingWith(node, 'fc');
        const rgbColor = cssTree[`.${colorClass}`].color;
        const colorHash = {
          'rgb(217,65,30)': 'orange',
          'rgb(51,51,51)': 'gray',
          'rgb(66,139,202)': 'blue',
          'rgb(122,37,24)': 'darkred',
          'rgb(47,111,159)': 'code',
          'rgb(0,119,136)': 'code',
          'rgb(153,153,153)': 'code',
          'rgb(204,51,0)': 'code',
          'rgb(79,159,207)': 'code',
          'rgb(0,102,153)': 'code',
        };

        return colorHash[rgbColor];
      },
      // Returns the node font size
      __getSize(node) {
        const sizeClass = this.__getClassStartingWith(node, 'fs');
        const fontSize = this.__parseCSSValueToInt(
          cssTree[`.${sizeClass}`]['font-size']
        );
        return fontSize;
      },
      // Returns the node height
      __getHeight(node) {
        const heightClass = this.__getClassStartingWith(node, 'h');
        const height = this.__parseCSSValueToInt(
          cssTree[`.${heightClass}`].height
        );
        return height;
      },
      // Get the position from the left side
      __getLeftPosition(node) {
        const leftClass = this.__getClassStartingWith(node, 'x');
        const left = this.__parseCSSValueToInt(cssTree[`.${leftClass}`].left);
        return left;
      },
      __isListItem(node) {
        const left = this.__getLeftPosition(node);
        return left === 64 || left === 56;
      },
    };
  },

  getCSSTree($) {
    let cssTree = {};
    _.each($('style'), style => {
      let cssContent = $(style).html();
      cssContent = cssContent.replace(/@/g, '');
      cssTree = {
        ...cssTree,
        ...cssToObject(cssContent),
      };
    });
    return cssTree;
  },
};
