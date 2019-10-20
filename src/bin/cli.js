#!/usr/bin/env node

const Parser = require('tree-sitter');
const AgsScript = require('tree-sitter-ags-script');
const Yargs = require("yargs");
const fs = require('fs');

const ash2doc = require('../ash2doc.js');

const argv = Yargs.scriptName("ash2doc")
    .usage('Usage: $0 <command> [options]')
    .command('mark', 'Extract .ash comments to Markdown')
    .example('$0 mark -f foo.ash', 'Turns comments in the given .ash file to markdown')
    .alias('f', 'file')
    .nargs('f', 1)
    .describe('f', 'Load a file')
    .alias('l', 'level')
    .nargs('l', 1)
    .describe('l', 'Initial header level')
    .demandOption(['f'])
    .help('h')
    .alias('h', 'help')
    .epilog('copyright 2019')
    .argv;

// identifier for header level
const hl = (() => {
  switch (argv.level) {
    case '1':
      return "#";
      break;
    case '2':
      return "##";
      break;
    case '3':
      return "###"
      break;
    default:
      return "###"
      break;
  }
})();

const file = fs.readFileSync(argv.file);

const parser = new Parser();
parser.setLanguage(AgsScript);

var reportText = ash2doc.parseStringAsASH(file.toString(), hl, parser);

console.log(reportText);
