# Markdown To Document

[![npm version](https://img.shields.io/npm/v/markdown-to-document?color=informational&style=flat-square)](https://www.npmjs.com/package/markdown-to-document)
[![npm license](https://img.shields.io/npm/l/markdown-to-document?color=informational&style=flat-square)](https://raw.githubusercontent.com/GaelGirodon/markdown-to-document/master/LICENSE)
![node](https://img.shields.io/node/v/markdown-to-document?style=flat-square)
[![build](https://img.shields.io/azure-devops/build/gaelgirodon/markdown-to-document/9?style=flat-square)](https://gaelgirodon.visualstudio.com/markdown-to-document)
[![tests](https://img.shields.io/azure-devops/tests/gaelgirodon/markdown-to-document/9?style=flat-square)](https://gaelgirodon.visualstudio.com/markdown-to-document)
[![coverage](https://img.shields.io/azure-devops/coverage/gaelgirodon/markdown-to-document/9?style=flat-square)](https://gaelgirodon.visualstudio.com/markdown-to-document)

A Markdown CLI to easily generate HTML documents from Markdown files.

> The original purpose of this tool was to provide an alternative to using
> Microsoft Word to write and send technical documents.

## Install

Install the CLI globally using NPM ([Node.js](https://nodejs.org/) >= 10 required):

```shell
npm i markdown-to-document -g
```

> **Linux users:** `EACCES` permissions errors when installing packages globally?<br>
> → Follow [this guide](https://docs.npmjs.com/resolving-eacces-permissions-errors-when-installing-packages-globally)
> to resolve them.

## Usage

Compile Markdown files (`path`) into HTML documents.

```shell
mdtodoc [options] <path...>
```

Read [usage examples](#examples) to learn how to use the CLI.

### Options

| Option                          | Description                                   |
| ------------------------------- | --------------------------------------------- |
| `-V, --version`                 | Output the version number                     |
| `-d, --dest [value]`            | Destination path (default: next to .md files) |
| `-l, --layout [value]`          | HTML layout                                   |
| `-t, --theme [value]`           | CSS theme                                     |
| `-s, --highlight-style [value]` | Syntax highlighting style                     |
| `-n, --numbered-headings`       | Enable numbered headings                      |
| `-c, --code-copy`               | Enable copy code button                       |
| `-e, --embed-mode [value]`      | Embed external resources (default: `light`)   |
| `-w, --watch`                   | Watch input files and compile on change       |
| `-h, --help`                    | Output usage information                      |

#### Destination (`--dest`)

The destination path can be used to change where output HTML files are written.

#### Layout (`--layout`)

A layout is a HTML template used as a base for the output HTML file, e.g.:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <!--        ⬐ Markdown document title included here -->
  <title>{{ title }}</title>
  {{ styles }} <!-- ← CSS styles (theme, highlight styles, etc.) included here -->
</head>
<body>
{{ body }}     <!-- ← Compiled Markdown included here -->
</body>
{{ scripts }}  <!-- ← JS scripts included here -->
</html>
```

The `--layout` option can receive the name of a [preset](./assets/layouts/)
(e.g. `page` for `page.html`) or the path to a custom layout file
(`path/to/my-layout.html` or a HTTP URL).

#### Theme (`--theme`)

A theme is a CSS stylesheet included in the HTML layout.

The `--theme` option can receive the name of a [preset](./assets/themes/)
(e.g. `github`) or the path to a custom theme file (`path/to/my-theme.css`
or a HTTP URL).

#### Highlight style (`--highlight-style`)

A highlight style is a CSS stylesheet included in the HTML layout
to add a style to code blocks.

The `--highlight-style` option can receive the name of a
[Hightlight.js style](https://github.com/highlightjs/highlight.js/tree/master/src/styles)
(file name without extension, e.g. `solarized-dark`) or the path to a custom
style file (a local path or a HTTP URL).

#### Additional features

_Markdown To Document_ includes additional features:

- **Numbered headings** (`--numbered-headings`): enable automatic headings
  numbering (`h2` to `h6`, e.g. `1.1.1.`)
- **Code copy** (`--code-copy`): add a button <kbd>Copy</kbd> in each
  code block to easily copy the block content

#### Embed mode (`--embed-mode`)

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
mdtodoc doc.md -l "page" -t "github" -s "atom-one-light" --numbered-headings --code-copy
```

HTML headings are now automatically numbered and a button <kbd>Copy</kbd>
is added in each code block `<pre>` to copy the content.

**Embed all externally referenced resources**

```shell
mdtodoc doc.md -l "page" -t "github" -s "atom-one-light" -n -c --embed-mode "full"
```

All external resources (CSS, JS and images) referenced in the Markdown file
are now embedded into the output HTML file.

**Use a custom layout (local file) and a custom highlight style (URL)**

```shell
mdtodoc doc.md -l "./assets/layouts/page.html" -t "github" -s "https://raw.githubusercontent.com/highlightjs/highlight.js/master/src/styles/monokai.css" -n -c -e "full"
```

Read [options documentation](#options) for more information on how to use
`--layout`, `--theme` and `--highlight-style` options.

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

_Markdown To Document_ uses the [Markdown.it](https://github.com/markdown-it/markdown-it)
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

## Development

- Link the `mdtodoc` command for development: `npm link`
  - Unlink: `npm unlink`
- Format code with Prettier: `npm run format[:check]`
- Lint code with ESLint: `npm run lint`
- Build assets with Gulp: `npm run build:assets`

## License

**Markdown To Document** is licensed under the GNU General Public License.
