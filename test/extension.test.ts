// <reference path="./mocha.d.ts" />

// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//


// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as myExtension from '../src/extension';
import * as testable from '../src/testable';
import * as chai from 'chai';

let assert = chai.assert;




let setDocText = (txt: string) => {
    return vscode.window.activeTextEditor.edit((tee: vscode.TextEditorEdit) => {
        let s = new vscode.Position(0, 0);
        let e = vscode.window.activeTextEditor.document.lineAt(vscode.window.activeTextEditor.document.lineCount - 1).range.end;
        let r = new vscode.Range(s, e);
        tee.replace(r, txt);
    }).then(success => {
          if (!success) { assert.fail('', '', 'edit failed', ''); }
    })
}



suite("integrationTests", () => {
 



});



