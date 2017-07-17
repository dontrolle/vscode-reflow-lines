//
// Note: This example test is leveraging the Mocha test framework.
// Please refer to their documentation on https://mochajs.org/ for help.
//

// The module 'assert' provides assertion methods from node
import * as assert from 'assert-plus';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import * as myExtension from '../src/extension';

// NOTE: Lines are 0 based from the editors perspective, so we minus 1 so our
//       test output makes sense when we look at mdtest.md.

// Defines a Mocha test suite to group tests of similar kind together
// suite("#IsParagraphStart", () => {

//     test("should return true for lines 1, 2, 3, 4, 8, and 9", () => {
//         assert.equal(myExtension.IsParagraphStart(vscode.window.activeTextEditor, 1-1), true);
//         assert.equal(myExtension.IsParagraphStart(vscode.window.activeTextEditor, 2-1), true);
//         assert.equal(myExtension.IsParagraphStart(vscode.window.activeTextEditor, 3-1), true);
//         assert.equal(myExtension.IsParagraphStart(vscode.window.activeTextEditor, 4-1), true);
//         assert.equal(myExtension.IsParagraphStart(vscode.window.activeTextEditor, 8-1), true);
//         assert.equal(myExtension.IsParagraphStart(vscode.window.activeTextEditor, 9-1), true);
//     });
//     test("should return false for lines 5 and 6", () => {
//         assert.equal(myExtension.IsParagraphStart(vscode.window.activeTextEditor, 5-1), false);
//         assert.equal(myExtension.IsParagraphStart(vscode.window.activeTextEditor, 6-1), false);
//         assert.equal(myExtension.IsParagraphStart(vscode.window.activeTextEditor, 7-1), false);
//     });

// });

// suite("#IsParagraphEnd", () => {
        
//     test("should return true for lines 1, 2, 3, 7, 8, and 9", () => {
        
//        assert.equal(myExtension.IsParagraphEnd(vscode.window.activeTextEditor, 1-1), true);
//        assert.equal(myExtension.IsParagraphEnd(vscode.window.activeTextEditor, 2-1), true);
//        assert.equal(myExtension.IsParagraphEnd(vscode.window.activeTextEditor, 3-1), true);
//        assert.equal(myExtension.IsParagraphEnd(vscode.window.activeTextEditor, 7-1), true);
//        assert.equal(myExtension.IsParagraphEnd(vscode.window.activeTextEditor, 8-1), true);
//        assert.equal(myExtension.IsParagraphEnd(vscode.window.activeTextEditor, 9-1), true);
//     });
//     test("should return false for lines 4, 5, 6, and 8", () => {
//         assert.equal(myExtension.IsParagraphEnd(vscode.window.activeTextEditor, 4-1), false);
//         assert.equal(myExtension.IsParagraphEnd(vscode.window.activeTextEditor, 5-1), false);
//         assert.equal(myExtension.IsParagraphEnd(vscode.window.activeTextEditor, 6-1), false);
//     });

// });

suite("mytests", () => {

  myExtension.GoToLine(4, false);
  let sei = myExtension.GetStartEndInfo(vscode.window.activeTextEditor);
  
   test("#mytest", () =>{
       assert.equal(sei.lineStart, 4-1);
       assert.equal(sei.lineEnd, 7-1);       
   })

 


});