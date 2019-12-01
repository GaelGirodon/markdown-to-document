#!/usr/bin/env node

const program = require("commander");
const chalk = require("chalk");
const { Processor } = require("./processor");

program.version("0.8.0");

program
  .arguments("<path...>")
  .description("Compile Markdown files into HTML documents")
  .option("-d, --dest [value]", "destination path (default: next to .md files)")
  .option("-l, --layout [value]", "HTML layout")
  .option("-t, --theme [value]", "CSS theme")
  .option("-s, --highlight-style [value]", "syntax highlighting style")
  .option("-n, --numbered-headings", "enable numbered headings")
  .option("-c, --code-copy", "enable copy code button")
  .option(
    "-e, --embed-mode [value]",
    "embed external resources: none, light or full",
    /^(none|light|full)$/,
    "light"
  )
  .option("-w, --watch", "watch input files and compile on change")
  .action(function(path, cmd) {
    const opts = {
      layout: cmd.layout,
      theme: cmd.theme,
      highlightStyle: cmd.highlightStyle,
      numberedHeadings: cmd.numberedHeadings,
      codeCopy: cmd.codeCopy,
      embedMode: cmd.embedMode,
    };
    const proc = new Processor(opts);
    proc.process(path, cmd.dest, cmd.watch).catch(err => {
      console.error(chalk.redBright(err));
      process.exit(1);
    });
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.help();
}
