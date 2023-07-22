#!/usr/bin/env node

import { Option, program } from "commander";

import { Processor } from "./processor.js";

program
  .name("mdtodoc")
  .version("0.28.0")
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
  .addOption(
    new Option("-e, --embed-mode [value]", "embed external resources")
      .default("default")
      .choices(["light", "default", "full"])
  )
  .option("-x, --extension [value...]", "extension scripts")
  .option("-w, --watch", "watch input files and compile on change")
  .action(function (path, options) {
    const proc = new Processor(options);
    proc.process(path).catch((err) => {
      console.error(err);
      process.exit(1);
    });
  });

program.parse(process.argv);
