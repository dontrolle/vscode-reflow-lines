//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from 'assert';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as myExtension from '../src/extension';

// Defines a Mocha test suite to group tests of similar kind together
suite("Extension Tests", () => {

    test("Set cursor to end of selection", async () => {
        const document = vscode.Uri.parse('untitled:summary.txt');
        const doc = await vscode.workspace.openTextDocument(document);
        const editor = await vscode.window.showTextDocument(doc, 1, false);
        const firstLine = editor.document.lineAt(0);
        const lastLine = editor.document.lineAt(editor.document.lineCount - 1);
        const textRange = new vscode.Range(0, firstLine.range.start.character, editor.document.lineCount - 1, lastLine.range.end.character);
        await editor.edit(e => e.replace(textRange, "This is a very long line of text that needs to be reflowed into multiple lines at interesting points"));
        const cursorPosition = new vscode.Position(0, 98);
        editor.selection.with(cursorPosition, cursorPosition);
        const context: any = { "subscriptions": [] };
        const v = await vscode.commands.executeCommand("extension.reflowParagraph");

        // we'll be lazy and depend on config in this little test (don't do this in code, you expect to be paid for...)
        let wsConfig = vscode.workspace.getConfiguration("reflow");
        let expectedCursorPosition = new vscode.Position(0, 78);
        if (wsConfig.get("setSelectionToEndOfRewrapped")) {
            expectedCursorPosition = new vscode.Position(1, 21);
        }

        assert.equal(editor.selection.active.line, expectedCursorPosition.line);
        assert.equal(editor.selection.active.character, expectedCursorPosition.character);
    });
});