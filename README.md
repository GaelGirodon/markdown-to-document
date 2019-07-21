# Power Markdown

A Markdown CLI to easily generate HTML documents from Markdown files.

> The original purpose of this tool was to provide an alternative to using
> Word to write and share technical documents.

## Install

Install the CLI globally using NPM:

```shell
npm i power-markdown -g
```

## Usage

Compile Markdown files (`path`) into HTML files.

```shell
pmd [options] <path...>
```

### Options

| Option                          | Description                                   |
| ------------------------------- | --------------------------------------------- |
| `-V, --version`                 | Output the version number                     |
| `-d, --dest [value]`            | Destination path (default: next to .md files) |
| `-l, --layout [value]`          | HTML layout                                   |
| `-t, --theme [value]`           | CSS theme                                     |
| `-h, --highlight-style [value]` | Syntax highlighting style                     |
| `-n, --numbered-headings`       | Enable numbered headings                      |
| `-c, --code-copy`               | Enable copy code button                       |
| `-e, --embed`                   | Embed external resources                      |
| `-w, --watch`                   | Watch input files and compile on change       |
| `-h, --help`                    | Output usage information                      |

### Examples

**Compile a single Markdown file (`doc.md`) into HTML (`doc.html`)**

```shell
pmd doc.md
```

**Watch and compile multiple Markdown files using glob syntax**

```shell
pmd *.md --watch
```

**Improve the HTML output with a layout and embedded styles**

```shell
pmd doc.md --layout "page" --theme "github" --highlight-style "atom-one-light" --embed
```

> The compiled Markdown is now included into the predefined layout `page`
> and some CSS styling is added directly into the HTML file.

**Enable additional extensions**

```shell
pmd doc.md -l "page" -t "github" -h "atom-one-light" -e --numbered-headings --code-copy
```

> HTML headings are now automatically numbered and a button <kbd>Copy</kbd>
> is added in each code block `<pre>` to copy the content.

## Development

- Link the `pmd` command for development: `npm link`
  - Unlink: `npm unlink`
- Format code with Prettier: `npm run format[:check]`
- Lint code with ESLint : `npm run lint`

## Resources

### Markdown compiler

**Power Markdown** uses the [Markdown.it](https://github.com/markdown-it/markdown-it)
compiler and the following plugins to generate HTML code from Markdown:

- `markdown-it-abbr` - Abbreviation (`<abbr>`) tag support
- `markdown-it-container` - Custom block containers support
- `markdown-it-deflist` - Definition list (`<dl>`) tag support
- `markdown-it-footnote` - Footnotes support
- `markdown-it-ins` - Inserted (`<ins>`) tag support
- `markdown-it-mark` - Marked (`<mark>`) tag support
- `markdown-it-sub` - Subscript (`<sub>`) tag support
- `markdown-it-sup` - Superscript (`<sup>`) tag support
- `markdown-it-anchor` - Header anchors (permalinks) support
- `markdown-it-toc-done-right` - Table of contents support

Additional features also use the following packages:

- [highlight.js](https://highlightjs.org/) - Javascript syntax highlighter
- [clipboard.js](https://clipboardjs.com/) - A modern approach to copy text to clipboard
- [cheerio](https://cheerio.js.org/) - Fast, flexible, and lean implementation of core
  jQuery designed specifically for the server
- [chokidar](https://github.com/paulmillr/chokidar) - A neat wrapper around node.js
  fs.watch / fs.watchFile / FSEvents.
- [clean-css](https://github.com/jakubpawlowicz/clean-css) - Fast and efficient
  CSS optimizer for node.js and the Web

Open [package.json](package.json) to see the full list of dependencies.

### Useful links

- [A guide to creating a NodeJS command-line package](https://medium.com/netscape/a-guide-to-create-a-nodejs-command-line-package-c2166ad0452e)
- [Building a Node JS interactive CLI](https://codeburst.io/building-a-node-js-interactive-cli-3cb80ed76c86)
- [Numbered Headings in Markdown via CSS](https://gist.github.com/patik/89ee6092c72a9e39950445c01598517a)

## License

**Power Markdown** is licensed under the GNU General Public License.
