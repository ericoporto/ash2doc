#!/usr/bin/env node

const Parser = require('tree-sitter');
const AgsScript = require('tree-sitter-ags-script');
const Yargs = require("yargs");

const parser = new Parser();
parser.setLanguage(AgsScript);

Yargs.scriptName("ash2doc")
    .usage('Usage: $0 <command> [options]')
    .command('mark', 'Extract .ash comments to Markdown')
    .example('$0 mark -f foo.ash', 'Turns comments in the given .ash file to markdown')
    .alias('f', 'file')
    .nargs('f', 1)
    .describe('f', 'Load a file')
    .demandOption(['f'])
    .help('h')
    .alias('h', 'help')
    .epilog('copyright 2019')
    .argv;

var fs = require('fs');
var s = fs.createReadStream(argv.file);

var lines = 0;
s.on('data', function (buf) {
    lines += buf.toString().match(/\n/g).length;
});

s.on('end', function () {
    console.log(lines);
});
