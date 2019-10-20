// comment is the content text when documenting methods, properties and functions
exports.handleComment = function(cur, hl, lastComment){
  if (lastComment === undefined || lastComment === null) {
    lastComment = "";
  }

  if(cur.nodeType == 'comment'){
    lastComment = String(cur.nodeText);

    if(lastComment.startsWith('///')){
      const strlen = lastComment.length;
      lastComment = lastComment.substr(3,strlen-3);
    } else {
      lastComment = "";
    }
  }

  return lastComment;
}
var handleComment = exports.handleComment;

// it's a method from a struct, so we handle it
exports.handleMethodDeclaration = function(cur, hl, structName , lastComment){
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
var handleMethodDeclaration = exports.handleMethodDeclaration;

// fields can be methods and properties
exports.handleFieldDeclarationList = function(cur, hl, structName){
  var reportText = "";
  var lastComment = "";

  for(var notEnd = cur.gotoFirstChild();
      notEnd;
      notEnd = cur.gotoNextSibling()) {

      lastComment = handleComment(cur, hl, lastComment);

      if(cur.nodeType == 'field_function_declaration'){

        reportText += handleMethodDeclaration(cur.currentNode.walk(),
                                hl,
                                structName,
                                lastComment);

        lastComment = "";
      }
  }

  return reportText;
}
var handleFieldDeclarationList = exports.handleFieldDeclarationList;

// do parsing for the contents of a struct node
exports.handleStructDeclaration = function(cur, hl){
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
                                   hl,
                                   struct_name);

      }
  }

  return reportText;
}
var handleStructDeclaration = exports.handleStructDeclaration;

// traverse the script header for the interesting nodes
exports.handleScriptHeader = function(cur, hl){
  let lastComment = "";
  let reportText = "";

  for(var notEnd = cur.gotoFirstChild();
      notEnd;
      notEnd = cur.gotoNextSibling()) {

      lastComment = handleComment(cur, hl, lastComment);

      if(cur.nodeType == 'import_declaration'){
        var func_text = cur.nodeText;
        func_text = func_text.replace('import', '');
        func_text = func_text.replace(';', '');

        reportText = reportText + "\n\n" + hl + " " + func_text +
        "\n" + lastComment;

        lastComment = "";
      }

      if(cur.nodeType == 'struct_declaration'){

        reportText += handleStructDeclaration(cur.currentNode.walk(),
                                              hl);

        lastComment = "";
      }
  }

  return reportText;
}
var handleScriptHeader = exports.handleScriptHeader;

// parse a sring as ash AGS Script Header file
exports.parseStringAsASH = function(ashstring, hl, parser){
  const cursor = parser.parse(ashstring).walk();

  return reportText = handleScriptHeader(cursor, hl);
}
var parseStringAsASH = exports.parseStringAsASH;
