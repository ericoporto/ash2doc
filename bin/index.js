#!/usr/bin/env node

const Parser = require('tree-sitter');
const AgsScript = require('tree-sitter-ags-script');
const Yargs = require("yargs");
const fs = require('fs');

const parser = new Parser();
parser.setLanguage(AgsScript);

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

var f = "";

function handleComment(cur, lastComment){
  if(cur.nodeType == 'comment'){
    lastComment = cur.nodeText;
    if(lastComment.startsWith('///')){
      const strlen = lastComment.length;
      lastComment = lastComment.substr(3,strlen-3);
    } else {
      lastComment = "";
    }
  }

  return lastComment;
}

// it's a method from a struct, so we handle it
function handleMethodDeclaration(cur, structName , lastComment){
  var func_text = "";
  var reportText = ""

  for(var notEnd = cur.gotoFirstChild();
      notEnd;
      notEnd = cur.gotoNextSibling()) {

      if(cur.nodeType == 'function_access_specifier') {
         if(cur.nodeText != 'import'){
           func_text = func_text + cur.nodeText + " ";
         }
      }

      if(cur.nodeType == 'type_identifier') {
         func_text = func_text + cur.nodeText + " ";
      }

      if(cur.nodeType == 'function_field_declarator') {
        var txt = cur.nodeText;
        var asterisk = "";

        if(txt.startsWith('* ')){
          const strlen = txt.length;
          txt = txt.substr(2,strlen-2);
          asterisk = "* ";
        }

        func_text = func_text + asterisk +
          structName + "." + txt + " ";
      }

  }

  reportText = reportText + "\n\n" + hl + "# " +
   func_text +
  "\n" + lastComment;
  return reportText;
}

// fields can be methods and properties
function handleFieldDeclarationList(cur, structName){
  var reportText = "";
  var lastComment = "";

  for(var notEnd = cur.gotoFirstChild();
      notEnd;
      notEnd = cur.gotoNextSibling()) {

      lastComment = handleComment(cur, lastComment);

      if(cur.nodeType == 'field_function_declaration'){

        reportText += handleMethodDeclaration(cur.currentNode.walk(),
                                structName,
                                lastComment);

        lastComment = "";
      }
  }

  return reportText;
}

// do parsing for the contents of a struct node
function handleStructDeclaration(cur){
  var reportText = "";
  var struct_name = "";

  for(var notEnd = cur.gotoFirstChild();
      notEnd;
      notEnd= cur.gotoNextSibling()) {

      if(cur.nodeType == 'type_identifier') {
         struct_name = cur.nodeText;
         reportText = reportText + "\n\n" + hl + " " + struct_name + "\n";
      }

      if(cur.nodeType == 'field_declaration_list') {

        reportText +=  handleFieldDeclarationList(cur.currentNode.walk(),
                                   struct_name);

      }
  }

  return reportText;
}

// traverse the script header for the interesting nodes
function handleScriptHeader(cur){
  let lastComment = "";
  let reportText = "";

  for(var notEnd = cur.gotoFirstChild();
      notEnd;
      notEnd = cur.gotoNextSibling()) {

      lastComment = handleComment(cur, lastComment);

      if(cur.nodeType == 'import_declaration'){
        var func_text = cur.nodeText;
        func_text = func_text.replace('import', '');
        func_text = func_text.replace(';', '');

        reportText = reportText + "\n\n" + hl + " " + func_text +
        "\n" + lastComment;

        lastComment = "";
      }

      if(cur.nodeType == 'struct_declaration'){

        reportText += handleStructDeclaration(cur.currentNode.walk());

        lastComment = "";
      }
  }

  return reportText;
}

// parse a sring as ash AGS Script Header file
function parseStringAsASH(ashstring){
  const cursor = parser.parse(ashstring).walk();

  return reportText = handleScriptHeader(cursor);
}

const file = fs.readFileSync(argv.file);

var reportText = parseStringAsASH(file.toString());

console.log(reportText);
