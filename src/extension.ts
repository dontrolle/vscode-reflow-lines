"use strict";
import * as vscode from "vscode";

/* TODOS
* configurable:
    * insert linebreaks as-you-type
*/

export function activate(context: vscode.ExtensionContext) {

    let disposable = vscode.commands.registerCommand("extension.reflowParagraph", async () => {

        let editor = vscode.window.activeTextEditor;
        if (!editor) {
            return; // No open text editor
        }

        let wsConfig = vscode.workspace.getConfiguration("reflow");

        let wrapAt = GetPreferredLineLength(wsConfig);

        const selection = editor.selection;
        const position = editor.selection.active;

        let paragraphStartLineNo = position.line;
        while (paragraphStartLineNo - 1 > 0 && !editor.document.lineAt(paragraphStartLineNo - 1).isEmptyOrWhitespace) {
            paragraphStartLineNo -= 1;
        }
        // paragraphStartLineNo now points to the first line of the paragraph or the first line in the document

        let maxLineNo = editor.document.lineCount;

        let paragraphEndLineNo = position.line;
        while (paragraphEndLineNo + 1 < maxLineNo && !editor.document.lineAt(paragraphEndLineNo + 1).isEmptyOrWhitespace) {
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

        // the final line will be in curLine
        if (curLine.length > 0) {
            newLines.push(curLine);
        }

        // newParagraph is constructed with \n for line-endings; 
        // textEditorEdit.replace will insert the correct environment-specific line-endings 
        let newParagraph = newLines.join("\n");

        let applied = await editor.edit(
            function (textEditorEdit) {
                textEditorEdit.replace(range, newParagraph);
            }
        );

        const lastReplacedLine = editor.document.lineAt(range.start.line + newLines.length - 1);
        editor.selection = new vscode.Selection(lastReplacedLine.range.end, lastReplacedLine.range.end);
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