#!/usr/bin/env node

const program = require("commander");
const chalk = require("chalk");
const pick = require("lodash/pick");
const package = require("../package.json");
const { Processor } = require("./processor");

program.version(package.version);

program
    .arguments("<path...>")
    .description("Compile Markdown files into HTML files")
    .option("-d, --dest [value]", "destination path (default: next to .md files)")
    .option("-l, --layout [value]", "HTML layout")
    .option("-t, --theme [value]", "CSS theme")
    .option("-h, --highlight-style [value]", "syntax highlighting style")
    .option("-n, --numbered-headings", "enable numbered headings")
    .option("-c, --code-copy", "enable copy code button")
    .option("-e, --embed", "embed external resources")
    .option("-w, --watch", "watch input files and compile on change")
    .action(function(path, cmd) {
        const opts = pick(cmd, [
            "layout",
            "theme",
            "highlightStyle",
            "numberedHeadings",
            "codeCopy",
            "embed"
        ]);
        const proc = new Processor(opts);
        proc.init()
            .then(() => proc.process(path, cmd.output, cmd.watch))
            .catch(err => console.error(chalk.redBright(err)));
    });

program.parse(process.argv);
