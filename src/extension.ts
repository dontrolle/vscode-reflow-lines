"use strict";
import * as vscode from "vscode";

/* TODOS
* configurable:     
    * insert linebreaks as-you-type
*/

export function activate(context: vscode.ExtensionContext) {

    let disposable = vscode.commands.registerCommand("extension.reflowMarkdown", () => {

        let editor = vscode.window.activeTextEditor;
        if (!editor) {
            return; // No open text editor
        }

// GoToLine(-1, true);
// if (1 === 1) { return ;}


        let wsConfig = vscode.workspace.getConfiguration("reflowMarkdown");

        let wrapAt = GetPreferredLineLength(wsConfig);

        const selection = editor.selection;
        const position = editor.selection.active;

        //let paragraphStartLineNo = position.line;
        //let currLine = editor.document.lineAt(paragraphStartLineNo);
        //let prevLine = editor.document.lineAt(paragraphStartLineNo - 1);

        let sei = GetStartEndInfo(editor);

        // while (!IsParagraphStart(editor, paragraphStartLineNo)) {
        //     paragraphStartLineNo -= 1;
        //     //currLine = editor.document.lineAt(paragraphStartLineNo);
        //     //prevLine = editor.document.lineAt(paragraphStartLineNo - 1);            
        // }
        // // paragraphStartLineNo now points to the first line of the paragraph or the first line in the document

        let maxLineNo = editor.document.lineCount;

        // let paragraphEndLineNo = position.line;
        // while (!IsParagraphEnd(editor, paragraphEndLineNo)) {
        //     paragraphEndLineNo += 1;
        // }
        // paragraphEndLineNo now points to the last line or the last line of the paragraph

        //let indentLength = sei.indent;
        // if (PreserveIndent(wsConfig)) {
        //     // work to preserve indents - if all lines are at same indent, preserve that indent
        //     let indentLengths: number[] = [];
        //     //for (let i = paragraphStartLineNo; i <= paragraphEndLineNo; i++) {
        //     for (let i = sei.lineStart; i <= sei.lineEnd; i++) {
        //         let line = editor.document.lineAt(i);
        //         indentLengths.push(line.firstNonWhitespaceCharacterIndex);
        //     }

        //     // TODO - allow some fuzz in detecting the indent that the user is aiming for; if a single line
        //     //         is off, e.g.; in that case, we want to set the indent based on the other lines.
        //     indentLength = indentLengths[0];
        //     if (!indentLengths.every(i => indentLength === i)) {
        //         indentLength = 0;
        //     }
        // }

        //let len = editor.document.lineAt(paragraphEndLineNo).text.length;
        let len = editor.document.lineAt(sei.lineEnd).text.length;
        //let range = new vscode.Range(paragraphStartLineNo, 0, paragraphEndLineNo, len);
        let range = new vscode.Range(sei.lineStart, 0, sei.lineEnd, len);
        let text = editor.document.getText(range);

        if (sei.indents.blockQuoteLevel > 0) {
            text = text.replace(/(^|\n)\s*(>\s*)+/g, " ");
        }


        let words = text.split(/\s/);

        let newLines: string[] = [];
        let curLine = sei.indents.firstLine;
        let curMaxLineLength = wrapAt;

        words.forEach(word => {
            if (word !== "") {

                // if the current line length is already longer than the max length, push it to the new lines array
                // OR if our word does NOT start with a left square bracket (i.e. is not a .md hyperlink) AND
                // if adding it and a space would make the line longer than the max length, also push it to the new lines array
                if (curLine.length >= curMaxLineLength || (word[0] != "[" && curLine.length + 1 + word.length >= curMaxLineLength)) {
                    newLines.push(curLine);
                    curLine = sei.indents.otherLines;
                }

                // if (curLine.length > indentLength)
                //     curLine = curLine.concat(" ");

                curLine = curLine.concat(word).concat(" ");
            }
        });


        // if we are in a markdown file, and the original text ended with 2 spaces, restore it
        if (editor.document.fileName.endsWith(".md") && text.endsWith("  ")) {
            curLine += "  ";
        }  


        // the final line will be in curLine
        if (curLine.length > 0) {
            newLines.push(curLine);
        }

        // newParagraph is constructed with \n for line-endings; 
        // textEditorEdit.replace will insert the correct environment-specific line-endings 
        let newParagraph = newLines.join("\n");

        let applied = editor.edit(
            function (textEditorEdit) {
                textEditorEdit.replace(range, newParagraph);
            }
        );

        // reset selection (TODO may be contraintuitive... maybe rather reset to single position, always?)
        editor.selection = selection;
    });

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

// export function IsParagraphStart(editor: vscode.TextEditor, lineNo: number): boolean {
  
//     if (lineNo - 1 <= 0) {
//         return true;
//     }

//     let currLine = editor.document.lineAt(lineNo);

//     // If the current line is empty, it is a start point
//     if (currLine.isEmptyOrWhitespace) {
//         return true;
//     }

//     // If the current line is a hash heading, the current line is a start point
//     if (IsMarkdownHeadingHash(currLine.text)) {
//         return true;
//     }

//     // LOOK AT THE PREVIOUS LINE, IF IT IS AND END, THEN THIS IS A START

//     return IsParagraphEnd(editor, lineNo - 1);
// }

// export function IsParagraphEnd(editor: vscode.TextEditor, lineNo: number): boolean {
    
//     let maxLineNo = editor.document.lineCount;
    
//     if (lineNo + 1 >= maxLineNo) {
//         return true;
//     }
    
//     let currLine = editor.document.lineAt(lineNo);

//     // if we are not in a markdown file, bail out
//     if (!editor.document.fileName.endsWith(".md")) {
//         return false;
//     }    

//     // If the current line is empty, it is an end point
//     if (currLine.isEmptyOrWhitespace) {
//         return true;
//     }

//     // If the current line is a hash or dash heading, it is a end point
//     if (IsMarkdownHeadingHash(currLine.text) || IsMarkdownHeadingDash(currLine.text)) {
//         return true;
//     }

//     // If the current line ends with two, spaces, it is an end point    
//     if (currLine.text.endsWith("  ")) {
//         return true;
//     }

//     // LOOK AT THE NEXT LINE

//     let nextLine = editor.document.lineAt(lineNo + 1);

//     if (nextLine.isEmptyOrWhitespace) {
//         return true;
//     }

//     // If the next line is a hash heading, the current line is an endpoint
//     if (IsMarkdownHeadingDash(nextLine.text)) {
//         return true;
//     }


//     return false;
// }

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