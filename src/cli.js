#!/usr/bin/env node

const program = require("commander");
const chalk = require("chalk");
const { Processor } = require("./processor");

program.version("0.15.0");

program
  .name("mdtodoc")
  .arguments("<path...>")
  .description("Compile Markdown files into HTML documents")
  .option("-d, --dest [value]", "destination path (default: next to .md files)")
  .option("-j, --join", "concatenate all files before compilation")
  .option("-l, --layout [value]", "HTML layout")
  .option("-t, --theme [value]", "CSS theme")
  .option("-s, --highlight-style [value]", "syntax highlighting style")
  .option("-n, --numbered-headings", "enable numbered headings")
  .option("-c, --code-copy", "enable copy code button")
  .option("-m, --mermaid", "enable mermaid")
  .option(
    "-e, --embed-mode [value]",
    "embed external resources: light, default or full",
    /^(light|default|full)$/,
    "default"
  )
  .option("-w, --watch", "watch input files and compile on change")
  .action(function (path, cmd) {
    const opts = {
      dest: cmd.dest,
      join: cmd.join,
      layout: cmd.layout,
      theme: cmd.theme,
      highlightStyle: cmd.highlightStyle,
      numberedHeadings: cmd.numberedHeadings,
      codeCopy: cmd.codeCopy,
      mermaid: cmd.mermaid,
      embedMode: cmd.embedMode,
      watch: cmd.watch,
    };
    const proc = new Processor(opts);
    proc.process(path).catch((err) => {
      console.error(chalk.redBright(err));
      process.exit(1);
    });
  });

program.parse(process.argv);
