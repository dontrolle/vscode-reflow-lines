"use strict";
import * as vscode from "vscode";

/* TODOS
* configurable:     
    * insert linebreaks as-you-type
*/

export function reflow() {

    let editor = vscode.window.activeTextEditor;
    if (!editor) {
        return; // No open text editor
    }

    let wsConfig = vscode.workspace.getConfiguration("reflowMarkdown");

    let wrapAt = GetPreferredLineLength(wsConfig);

    const selection = editor.selection;
    const position = editor.selection.active;
    let sei = GetStartEndInfo(editor);

    let maxLineNo = editor.document.lineCount;
    let len = editor.document.lineAt(sei.lineEnd).text.length;
    let range = new vscode.Range(sei.lineStart, 0, sei.lineEnd, len);
    let text = editor.document.getText(range);

    // if we are in a blockQuote (or nested blockQuote), then remove the line-feeds and greater-than signs
    // a the beginning of each line and replace them with spaces.  we will restore them afterwards...
    if (sei.indents.blockQuoteLevel > 0) {
        text = text.replace(/(^|\n)\s*(>\s*)+/g, " ");
    }

    // replace spaces within link text (in square brackets) with another charcter that is highly unlikely to be present
    // the \x08 (backspace) character is a good candidate...
    text = text.replace(/\[.*?\s.*?]/g, (substr, ...args) => {
        return substr.replace(/\s/g, "\x08"); // x08 is hex ascii code for the 'backspace' character
    });

    let words = text.split(/\s/);

    let newLines: string[] = [];
    let curLine = sei.indents.firstLine;
    let curMaxLineLength = wrapAt;

 
    
    words.forEach((word, i) => {
        if (word !== "") {

            // if the current line length is already longer than the max length, push it to the new lines array
            // OR if our word does NOT start with a left square bracket (i.e. is not a .md hyperlink) AND
            // if adding it and a space would make the line longer than the max length, also push it to the new lines array
            if (curLine.length >= curMaxLineLength || (word[0] != "[" && curLine.length + 1 + word.length >= curMaxLineLength)) {
                newLines.push(curLine.replace(/\s*$/, ''));  //remove trailing whitespace
                curLine = sei.indents.otherLines;
            } 
            
            curLine = curLine.concat(word).concat(" ");            
        }
    });

    curLine = curLine.replace(/\s*$/, '');  //remove trailing whitespace

    // if the original text ended with 2 spaces, restore it
    if (text.endsWith("  ")) {
        curLine += "  ";
    }  


    // the final line will be in curLine
    if (curLine.length > 0) {
        newLines.push(curLine);
    }

    // newParagraph is constructed with \n for line-endings; 
    // textEditorEdit.replace will insert the correct environment-specific line-endings 
    let newParagraph = newLines.join("\n");

    // replace \x08 (backspace) characters within link text (in square brackets) with spaces
    newParagraph = newParagraph.replace(/\[.*?\x08.*?]/g, (substr, ...args) => {
        return substr.replace(/\x08/g, " "); // x08 is hex ascii code for the 'backspace' character
    });

    let applied = editor.edit(
        function (textEditorEdit) {
            textEditorEdit.replace(range, newParagraph);
        }
    );

    // reset selection (TODO may be contraintuitive... maybe rather reset to single position, always?)
    editor.selection = selection;

    return applied;
}

export function activate(context: vscode.ExtensionContext) {
    let disposable = vscode.commands.registerCommand("extension.reflowMarkdown", reflow);
    context.subscriptions.push(disposable);
}

export function deactivate() {
}

function GetPreferredLineLength(wsConfig: vscode.WorkspaceConfiguration): number {
    return wsConfig.get("preferredLineLength", 80);
}

function PreserveIndent(wsConfig: vscode.WorkspaceConfiguration): boolean {
    return wsConfig.get("preserveIndent", true);
}

function IsMarkdownHeadingHash(text: string): boolean {
    return text.startsWith("#");
}

function IsMarkdownHeadingDash(text: string): boolean {
    return text.startsWith("==") || text.startsWith("--");
}

function IsMarkdownListStart(text: string): RegExpMatchArray {

    // this will match on...
    // zero or more spaces + [ (1 or more digits + 1 decimal) OR (1 dash or asterick) ] + 1 or more spaces    
    return text.match(/^\s*((\d+\.)|([-\*]))\s+/);        
}

function IsMarkdownBlockQuote(text: string): RegExpMatchArray {

    // this will match on...
    // line beginning + [zero or more spaces + 1 greater than sign](one-or-more) + 1 or more spaces        
    return text.match(/^(\s*>)+\s*/);       
}

function MarkdownBlockQuoteLevelFromRegExMatch(matchArray: RegExpMatchArray): number {
    if (matchArray && matchArray.length)
        return matchArray[0].replace(/\s/g, "").length
    else
        return 0;
}

function MarkdownBlockQuoteLevelFromString(text: string): number {
    return MarkdownBlockQuoteLevelFromRegExMatch(IsMarkdownBlockQuote(text));    
}


//for testing
export function GoToLine(oneBasedLine: number, selectWholeLine: boolean) {
    let zeroBasedLine = oneBasedLine - 1
    let editor = vscode.window.activeTextEditor;
    let range = editor.document.lineAt(zeroBasedLine).range;
    
    editor.selection = selectWholeLine 
                     ? new vscode.Selection(range.start, range.end) 
                     : new vscode.Selection(zeroBasedLine, 0, zeroBasedLine, 0);

    editor.revealRange(range);
}


interface Indents {
    firstLine: string;
    otherLines: string;
    blockQuoteLevel: number;
}

interface StartEndInfo {
    lineStart: number;
    lineEnd: number;
    indents: Indents;
}

export function GetStartEndInfo(editor: vscode.TextEditor): StartEndInfo {

    const midLineNum = editor.selection.active.line;
    let midLine = editor.document.lineAt(midLineNum);
    let maxLineNum = editor.document.lineCount - 1; //line NUMBER is line COUNT minus 1

    let s = GetStartLine(editor, midLine);
    let e = GetEndLine(editor, midLine, maxLineNum);
    let i = GetLineIndent(s);

    return  {
        lineStart: s.lineNumber,
        lineEnd: e.lineNumber,
        indents: i        
    };

}

function GetStartLine(editor: vscode.TextEditor, midLine: vscode.TextLine): vscode.TextLine {

    // If we are at line 0, the middleLine is the start line
    if (midLine.lineNumber == 0) { 
        return midLine;
    }
      
    // If the current line is empty, it is a start line
    if (midLine.isEmptyOrWhitespace ) {
        return midLine;        
    }

    // If the current line is a hash heading, the current line is a start point
    if (IsMarkdownHeadingHash(midLine.text) || IsMarkdownHeadingDash(midLine.text)) {
        return midLine;
    }

    if (IsMarkdownListStart(midLine.text)) {
        return midLine;
    }

    let prevLine = editor.document.lineAt(midLine.lineNumber - 1);
    
    // If the prev line is empty, this line is the start
    if (prevLine.isEmptyOrWhitespace) {
        return midLine;
    }

    // If the prev line is a hash or dash heading, this line is the start
    if (IsMarkdownHeadingHash(prevLine.text) || IsMarkdownHeadingDash(prevLine.text)) {
        return midLine;
    }

    // If the current line ends with two, spaces, it is an end point    
    if (prevLine.text.endsWith("  ")) {
        return midLine;
    }

    // in [gitlab flavored] markdown, once blockQuotes nesting begins into a deeper level, it doesn't 
    // back out into a shallower level.  Therefore, the start is only when the prevLine is lower than this line.
    var bqLevelMid = MarkdownBlockQuoteLevelFromString(midLine.text);
    var bqLevelPrv = MarkdownBlockQuoteLevelFromString(prevLine.text);
    if (bqLevelMid != bqLevelPrv) {
        return midLine;
    }
    
    return GetStartLine(editor, prevLine);
}

function GetEndLine(editor: vscode.TextEditor, midLine: vscode.TextLine, maxLineNum: number): vscode.TextLine {

    // if midLine is the last line it is the end 
    if (midLine.lineNumber == maxLineNum) {
        return midLine;
    }

    // If the current line is empty, it is an end point
    if (midLine.isEmptyOrWhitespace) {
        return midLine;
    }

    // If the current line is a hash or dash heading, it is a end point
    if (IsMarkdownHeadingHash(midLine.text) || IsMarkdownHeadingDash(midLine.text)) {
        return midLine;
    }

    // If the current line ends with two, spaces, it is an end point    
    if (midLine.text.endsWith("  ")) {
        return midLine;
    }
    
    let nextLine = editor.document.lineAt(midLine.lineNumber + 1);

    // if the next line is empty, this line is the end
    if (nextLine.isEmptyOrWhitespace) {
        return midLine;
    }

    // If the next line is a hash heading, this line is the end
    if (IsMarkdownHeadingDash(nextLine.text)) {
        return midLine;
    }

    // if the next line starts a list, this line is the end
    if (IsMarkdownListStart(nextLine.text)) {
        return midLine;
    }

    // in [gitlab flavored] markdown, once blockQuotes nesting begins into a deeper level, it doesn't 
    // back out into a shallower level.  Therefore, the end is only when the nextLine level is greater than this line level.
    var bqLevelMid = MarkdownBlockQuoteLevelFromString(midLine.text);
    var bqLevelNxt = MarkdownBlockQuoteLevelFromString(nextLine.text);
    if (bqLevelMid > 0 && (bqLevelNxt == 0 || bqLevelNxt > bqLevelMid)) {
            return midLine;
    }

    return GetEndLine(editor, editor.document.lineAt(midLine.lineNumber + 1), maxLineNum);
}

function GetLineIndent(startLine: vscode.TextLine): Indents {
    
    let startLnSpaces = " ".repeat(startLine.firstNonWhitespaceCharacterIndex);

    let regExMatches = IsMarkdownListStart(startLine.text);
    if (regExMatches) {        
        return {
            firstLine: startLnSpaces,
            otherLines: " ".repeat(regExMatches[0].length),
            blockQuoteLevel: 0
        }
    }
    
    regExMatches = IsMarkdownBlockQuote(startLine.text)
    if (regExMatches) {
        var level =  MarkdownBlockQuoteLevelFromRegExMatch(regExMatches);
        var indent = "  " + ">".repeat(level) + " ";
        return {
            firstLine: indent,
            otherLines: indent,
            blockQuoteLevel: level
        }        
    }
    
    return {
        firstLine: startLnSpaces,
        otherLines: startLnSpaces,
        blockQuoteLevel: 0
    }
}