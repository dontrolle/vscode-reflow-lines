"use strict";
import * as vscode from "vscode";

/* TODOS
* configurable:
    * insert linebreaks as-you-type
*/

export function activate(context: vscode.ExtensionContext) {

    let disposable = vscode.commands.registerCommand("extension.reflowParagraph", () => {

        let editor = vscode.window.activeTextEditor;
        if (!editor) {
            return; // No open text editor
        }

        let wsConfig = vscode.workspace.getConfiguration("reflow");

        let wrapAt = GetPreferredLineLength(wsConfig);

        const selection = editor.selection;
        const position = editor.selection.active;

        let paragraphStartLineNo = position.line;
        while (!IsParagraphStart(editor, paragraphStartLineNo)) {
            paragraphStartLineNo -= 1;
        }
        // paragraphStartLineNo now points to the first line of the paragraph or the first line in the document

        let maxLineNo = editor.document.lineCount;

        let paragraphEndLineNo = position.line;
        while (!IsParagraphEnd(editor, maxLineNo, paragraphEndLineNo)) {
            paragraphEndLineNo += 1;
        }
        // paragraphEndLineNo now points to the last line or the last line of the paragraph

        let indentLength = 0;
        if (PreserveIndent(wsConfig)) {
            // work to preserve indents - if all lines are at same indent, preserve that indent
            let indentLengths: number[] = [];
            for (let i = paragraphStartLineNo; i <= paragraphEndLineNo; i++) {
                let line = editor.document.lineAt(i);
                indentLengths.push(line.firstNonWhitespaceCharacterIndex);
            }

            // TODO - allow some fuzz in detecting the indent that the user is aiming for; if a single line
            //         is off, e.g.; in that case, we want to set the indent based on the other lines.
            indentLength = indentLengths[0];
            if (!indentLengths.every(i => indentLength === i)) {
                indentLength = 0;
            }
        }

        let len = editor.document.lineAt(paragraphEndLineNo).text.length;
        let range = new vscode.Range(paragraphStartLineNo, 0, paragraphEndLineNo, len);
        let text = editor.document.getText(range);

        let words = text.split(/\s/);

        let newLines: string[] = [];
        let indent = " ".repeat(indentLength);
        let curLine = indent;
        let curMaxLineLength = wrapAt;

        words.forEach(word => {
            if (word !== "") {
                if (curLine.length + 1 + word.length >= curMaxLineLength) {
                    newLines.push(curLine);
                    curLine = indent;
                }

                if (curLine.length > indentLength)
                    curLine = curLine.concat(" ");

                curLine = curLine.concat(word);
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

function IsParagraphStart(editor: vscode.TextEditor, lineNo: number): boolean {
  
    if (lineNo - 1 <= 0) {
        return true;
    }

    let currLine = editor.document.lineAt(lineNo);
    let prevLine = editor.document.lineAt(lineNo - 1);

    if (prevLine.isEmptyOrWhitespace) {
        return true;
    }

    // if we are not in a markdown file, bail out
    if (!editor.document.fileName.endsWith(".md")) {
        return false;
    }    

    // BEGIN MARKDOWN SPECIFIC CHECKS   

    // If the current line is empty, it is a start point
    if (currLine.isEmptyOrWhitespace) {
        return true;
    }

    // If the current line is a hash heading, the current line is a start point
    if (IsMarkdownHeadingHash(currLine.text)) {
        return true;
    }

    // If the previous line is a hash or dash heading, the current line is a start point
    if (IsMarkdownHeadingHash(prevLine.text) || IsMarkdownHeadingDash(prevLine.text)) {
        return true;
    }

    // If the previous line ends with two, spaces, it is a start point    
    if (prevLine.text.endsWith("  ")) {
        return true;
    }

    return false;
}

function IsParagraphEnd(editor: vscode.TextEditor, maxLineNo: number, lineNo: number): boolean {
    if (lineNo + 1 > maxLineNo) {
        return true;
    }
    
    let currLine = editor.document.lineAt(lineNo);
    let nextLine = editor.document.lineAt(lineNo + 1);

    if (nextLine.isEmptyOrWhitespace) {
        return true;
    }

    // if we are not in a markdown file, bail out
    if (!editor.document.fileName.endsWith(".md")) {
        return false;
    }    

    // BEGIN MARKDOWN SPECIFIC CHECKS 

    // If the current line is empty, it is an end point
    if (currLine.isEmptyOrWhitespace) {
        return true;
    }

    // If the current line is a hash or dash heading, it is a end point
    if (IsMarkdownHeadingHash(currLine.text) || IsMarkdownHeadingDash(currLine.text)) {
        return true;
    }

    // If the next line is a hash heading, the current line is an endpoint
    if (IsMarkdownHeadingHash(nextLine.text)) {
        return true;
    }

    // If the current line ends with two, spaces, it is an end point    
    if (currLine.text.endsWith("  ")) {
        return true;
    }

    return false;

}
function IsMarkdownHeadingHash(text: string): boolean {
    return text.startsWith("#");
}

function IsMarkdownHeadingDash(text: string): boolean {
    return text.startsWith("==") || text.startsWith("--");
}