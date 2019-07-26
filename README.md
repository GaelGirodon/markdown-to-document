# Markdown To Document

A Markdown CLI to easily generate HTML documents from Markdown files.

> The original purpose of this tool was to provide an alternative to using
> Microsoft Word to write and share technical documents.

## Install

Install the CLI globally using NPM:

```shell
npm i markdown-to-document -g
```

## Usage

Compile Markdown files (`path`) into HTML documents.

```shell
mdtodoc [options] <path...>
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
| `-e, --embed-mode [value]`      | Embed external resources (default: `light`)   |
| `-w, --watch`                   | Watch input files and compile on change       |
| `-h, --help`                    | Output usage information                      |

#### About embed mode

The `--embed-mode` option allows to inline externally referenced resources
(JS, CSS and images) to output a single HTML file without external dependencies.

3 modes are available:

- `none`: disable inlining
- `light`: inline only scripts, stylesheets and light images
  (size < 8KB) (**default**)
- `full`: inline everything (this can lead to a large output file)

### Examples

**Compile a single Markdown file (`doc.md`) into HTML (`doc.html`)**

```shell
mdtodoc doc.md
```

**Watch and compile multiple Markdown files using glob syntax**

```shell
mdtodoc *.md --watch
```

**Improve the HTML output with a layout, a theme and a highlight style**

```shell
mdtodoc doc.md --layout "page" --theme "github" --highlight-style "atom-one-light"
```

The compiled Markdown is now included into the predefined layout `page`
and some CSS styling is added directly into the HTML file.

**Enable additional extensions**

```shell
mdtodoc doc.md -l "page" -t "github" -h "atom-one-light" --numbered-headings --code-copy
```

HTML headings are now automatically numbered and a button <kbd>Copy</kbd>
is added in each code block `<pre>` to copy the content.

**Embed all externally referenced resources**

```shell
mdtodoc doc.md -l "page" -t "github" -h "atom-one-light" -n -c --embed-mode "full"
```

All external resources (CSS, JS, images) referenced in the Markdown file
are now embedded into the output HTML file.

## Development

- Link the `mdtodoc` command for development: `npm link`
  - Unlink: `npm unlink`
- Format code with Prettier: `npm run format[:check]`
- Lint code with ESLint : `npm run lint`

## Resources

### Useful apps, packages & more

#### Code editors

Although Markdown documents are simple text files and can be written using
basic text editors, most code editors provide features and extensions to make
writing these documents easier, e.g.:

- [Markdown All in One](https://marketplace.visualstudio.com/items?itemName=yzhang.markdown-all-in-one)
  (Visual Studio Code)
- [Markdown-Writer](https://atom.io/packages/markdown-writer) (Atom)
- [Markdown​Editing](https://packagecontrol.io/packages/MarkdownEditing) (Sublime Text)

#### Formatting

Markdown files can be easily formatted with [code editors](#code-editors)
using built-in features or additional extensions but code formatters like
[Prettier](https://prettier.io/) also do a good job:

```shell
npm install --global prettier
prettier --check "*.md"
prettier --write "*.md"
```

### Markdown compiler

**Markdown To Document** uses the [Markdown.it](https://github.com/markdown-it/markdown-it)
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
- [web-resource-inliner](https://github.com/jrit/web-resource-inliner) - Brings
  externally referenced resources, such as js, css and images, into a single file
- [html-minifier](https://github.com/kangax/html-minifier) - Javascript-based
  HTML compressor/minifier
- [clipboard.js](https://clipboardjs.com/) - A modern approach to copy text to clipboard
- [cheerio](https://cheerio.js.org/) - Fast, flexible, and lean implementation
  of core jQuery designed specifically for the server
- [chokidar](https://github.com/paulmillr/chokidar) - A neat wrapper around
  node.js fs.watch / fs.watchFile / FSEvents

Open [package.json](package.json) to see the full list of dependencies.

### Useful links

- [A guide to creating a NodeJS command-line package](https://medium.com/netscape/a-guide-to-create-a-nodejs-command-line-package-c2166ad0452e)
- [Building a Node JS interactive CLI](https://codeburst.io/building-a-node-js-interactive-cli-3cb80ed76c86)
- [Numbered Headings in Markdown via CSS](https://gist.github.com/patik/89ee6092c72a9e39950445c01598517a)

## License

**Markdown To Document** is licensed under the GNU General Public License.
