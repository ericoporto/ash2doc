
const ash2doc = require('./ash2doc');
const Parser = require('web-tree-sitter');

var asyncParseAsh = async function(ashstring) {
  await Parser.init();
  const parser = new Parser();
  const AgsScript = await Parser.Language.load('tree-sitter-ags-script.wasm');
  parser.setLanguage(AgsScript);
  const cursor = parser.parse(ashstring).walk();
  return reportText = ash2doc.handleScriptHeader(cursor, '###');
};

global.AsyncParseAsh = asyncParseAsh;
