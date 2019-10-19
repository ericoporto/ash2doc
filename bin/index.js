#!/usr/bin/env node

const Parser = require('tree-sitter');
const AgsScript = require('tree-sitter-ags-script');
const Yargs = require("yargs");

const parser = new Parser();
parser.setLanguage(AgsScript);

const argv = Yargs.scriptName("ash2doc")
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
var f = "";

fs.readFile(argv.file,function (err, data) {
  if(err) throw err;
  f = data.toString();
  const tree = parser.parse(f);
  const cursor = tree.walk();

  var lastComment = "";

  var reportText = "";

  for(var notEnd = cursor.gotoFirstChild();
      notEnd;
      notEnd = cursor.gotoNextSibling()) {

      if(cursor.nodeType == 'comment'){
        lastComment = cursor.nodeText;
        if(lastComment.startsWith('///')){
          const strlen = lastComment.length;
          lastComment = lastComment.substr(3,strlen-3);
        } else {
          lastComment = "";
        }
      }

      if(cursor.nodeType == 'import_declaration'){
        var func_text = cursor.nodeText;
        func_text = func_text.replace('import', '');
        func_text = func_text.replace(';', '');

        reportText = reportText + "\n\n## " + func_text +
        "\n" + lastComment;

        lastComment = "";
      }

      if(cursor.nodeType == 'struct_declaration'){

        const c1 = cursor.currentNode.walk();
        var struct_name = "";

        for(var notEnd_c1 = c1.gotoFirstChild();
            notEnd_c1;
            notEnd_c1 = c1.gotoNextSibling()) {

            if(c1.nodeType == 'type_identifier') {
               struct_name = c1.nodeText;
               reportText = reportText + "\n\n# " + struct_name + "\n";
            }

            if(c1.nodeType == 'field_declaration_list') {

              const c2 = c1.currentNode.walk();

              for(var notEnd_c2 = c2.gotoFirstChild();
                  notEnd_c2;
                  notEnd_c2 = c2.gotoNextSibling()) {


                  if(c2.nodeType == 'comment'){
                    lastComment = c2.nodeText;
                    if(lastComment.startsWith('///')){
                      const strlen = lastComment.length;
                      lastComment = lastComment.substr(3,strlen-3);
                    } else {
                      lastComment = "";
                    }
                  }

                  if(c2.nodeType == 'field_function_declaration'){

                    const c3 = c2.currentNode.walk();
                    var func_text = "";

                    for(var notEnd_c3 = c3.gotoFirstChild();
                        notEnd_c3;
                        notEnd_c3 = c3.gotoNextSibling()) {

                        if(c3.nodeType == 'function_access_specifier') {
                           if(c3.nodeText != 'import'){
                             func_text = func_text + c3.nodeText + " ";
                           }
                        }

                        if(c3.nodeType == 'type_identifier') {
                           func_text = func_text + c3.nodeText + " ";
                        }

                        if(c3.nodeType == 'function_field_declarator') {
                          var txt = c3.nodeText;
                          var asterisk = "";

                          if(txt.startsWith('* ')){
                            const strlen = txt.length;
                            txt = txt.substr(2,strlen-2);
                            asterisk = "* ";
                          }

                          func_text = func_text + asterisk +
                            struct_name + "." + txt + " ";
                        }

                    }

                    reportText = reportText + "\n\n## " +
                     func_text +
                    "\n" + lastComment;

                    lastComment = "";
                  }
              }
            }
        }
      }
  }
  console.log(reportText);
});
