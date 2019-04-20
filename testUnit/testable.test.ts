import * as mocha from 'mocha';
import { expect } from 'chai';
import {    replaceSpacesInLinkTextWithBs,
            replaceSpacesInInlineCodeWithBs,
            getListStart,
            getBlockQuote,
            lineTooLong,
            getReflowedText,
            StartEndInfo,
            getLineIndent,
            getStartLine,
            getEndLine,
            Settings,
            getSettings,
            OtherInfo
        } from "../src/testable";
import { GetStartEndInfo, reflow } from '../src/extension';
import * as fs from 'fs';
import * as vscode from "vscode";


// Recall:  Need this to force the require('mocha') call in the transpiled code due to the way
//          tsc only generates if an implementation is called and not if it is just used for type references.
//          The rest of the type definitions are ok because of the way typescript looks for them in node_modules/@types.
let suite = mocha.suite;


suite("testable", () => {
    describe("replaceSpacesInLinkTextWithBs", () =>{
        it("passes", () => {
            expect(replaceSpacesInLinkTextWithBs("[abc]"             /**/)).to.equal("[abc]"                   /**/);
            expect(replaceSpacesInLinkTextWithBs("xxx[abc]xxx"       /**/)).to.equal("xxx[abc]xxx"             /**/);
            expect(replaceSpacesInLinkTextWithBs("[a b]"             /**/)).to.equal("[a\x08b]"                /**/);
            expect(replaceSpacesInLinkTextWithBs("asdf [a b a] asdf" /**/)).to.equal("asdf [a\x08b\x08a] asdf" /**/);
        })
    });
    describe("replaceSpacesInInlineCodeWithBs", () =>{
        it("passes", () => {
            expect(replaceSpacesInInlineCodeWithBs("`abc`"       /**/)).to.equal("`abc`"               /**/);
            expect(replaceSpacesInInlineCodeWithBs("`a b`"       /**/)).to.equal("`a\x08b`"            /**/);
            expect(replaceSpacesInInlineCodeWithBs("``abc``"     /**/)).to.equal("``abc``"             /**/);
            expect(replaceSpacesInInlineCodeWithBs("``a b``"     /**/)).to.equal("``a\x08b``"          /**/);
            expect(replaceSpacesInInlineCodeWithBs("``a ` b``"   /**/)).to.equal("``a\x08`\x08b``"     /**/);
        })
    });
    describe("getListStart", () => {
        it("passes", () => {
            expect(getListStart("1. "      /**/)).to.exist;
            expect(getListStart(" 1. "     /**/)).to.exist;
            expect(getListStart("  1. "    /**/)).to.exist;
            expect(getListStart("99. "     /**/)).to.exist;
            expect(getListStart(" 99. "    /**/)).to.exist;
            expect(getListStart("  99. "   /**/)).to.exist;
            expect(getListStart("* "       /**/)).to.exist;
            expect(getListStart("* abc"    /**/)).to.exist;
            expect(getListStart("*  "      /**/)).to.exist;
            expect(getListStart("*  abc"   /**/)).to.exist;
            expect(getListStart("- "       /**/)).to.exist;
            expect(getListStart("- abc"    /**/)).to.exist;
            expect(getListStart("-  "      /**/)).to.exist;
            expect(getListStart("-  abc"   /**/)).to.exist;
            expect(getListStart("  1."     /**/)).to.not.exist;
            expect(getListStart("  1.abc"  /**/)).to.not.exist;
            expect(getListStart("  99."    /**/)).to.not.exist;
            expect(getListStart("  99.abc" /**/)).to.not.exist;
            expect(getListStart("*"        /**/)).to.not.exist;
            expect(getListStart("*abc"     /**/)).to.not.exist;
            expect(getListStart("-"        /**/)).to.not.exist;
            expect(getListStart("-abc"     /**/)).to.not.exist;
        });
    });
    // line beginning + [zero or more spaces + 1 greater than sign](one-or-more) + 1 or more spaces
    describe("getBlockQuote", () =>{
        it("passes", () => {
            expect(getBlockQuote("> "      /**/)).to.exist;
            expect(getBlockQuote(">> "     /**/)).to.exist;
            expect(getBlockQuote(">>> "    /**/)).to.exist;
            expect(getBlockQuote(" >"      /**/)).to.exist;
            expect(getBlockQuote(" >>"     /**/)).to.exist;
            expect(getBlockQuote(" >>>"    /**/)).to.exist;
            expect(getBlockQuote(" > "     /**/)).to.exist;
            expect(getBlockQuote(" > > "   /**/)).to.exist;
            expect(getBlockQuote(" > > >"  /**/)).to.exist;
            expect(getBlockQuote(" >  x"   /**/)).to.exist;   //multiple spaces....bad but still treat as blockquote for now
            expect(getBlockQuote(" >  > "  /**/)).to.exist;   //multiple spaces....bad but still treat as blockquote for now
            expect(getBlockQuote(" >  >  >"/**/)).to.exist;   //multiple spaces....bad but still treat as blockquote for now
        });
    });
    describe("lineTooLong", () => {
        it("passes", () => {
            expect(lineTooLong('', 1)).to.be.false;
            expect(lineTooLong('', 0)).to.be.false;
            expect(lineTooLong('x', 1)).to.be.false;
            expect(lineTooLong('x', 0)).to.be.true;
        });
    });
    describe("getReflowedText_compare_before_and_after", () => {
        it("passes", () => {
            let debugg = false;
            //debugg = true;
            let fileSuffix = "";
            //fileSuffix = "Debug";

            let filePathBefor = `${process.cwd()}\\testUnit\\befor${fileSuffix}.md`; 
            let filePathAfter = `${process.cwd()}\\testUnit\\after${fileSuffix}.md`; 
            let linesBefor = fs.readFileSync(filePathBefor, "UTF-8").split(/\r\n|\n/);
            let linesAfter = fs.readFileSync(filePathAfter, "UTF-8").split(/\r\n|\n/);

            if (linesBefor.length == 0 && linesAfter.length == 0) {
                //nothing to test...before and after are equal
                return;
            } else {
                //otherwise both must have at least 1 line
                expect(linesBefor.length).to.be.greaterThan(0);
                expect(linesAfter.length).to.be.greaterThan(0);
            }

            let settings: Settings = getSettings();
            let updateSettings = (settingsLine: string) => {
               let modifications = JSON.parse(settingsLine.replace(/`/g, ""));
               settings.preferredLineLength         /**/ = modifications.settings.preferredLineLength         /**/ == undefined ? settings.preferredLineLength         /**/ : modifications.settings.preferredLineLength;         
               settings.doubleSpaceBetweenSentences /**/ = modifications.settings.doubleSpaceBetweenSentences /**/ == undefined ? settings.doubleSpaceBetweenSentences /**/ : modifications.settings.doubleSpaceBetweenSentences;
               settings.resizeHeaderDashLines       /**/ = modifications.settings.resizeHeaderDashLines       /**/ == undefined ? settings.resizeHeaderDashLines       /**/ : modifications.settings.resizeHeaderDashLines;
            };

            let nextAfterLineToTest = 0;
            let nextBeforLineToTest = 0;

            while (nextBeforLineToTest < linesBefor.length)
            {
                if (debugg) {
                    console.log("--------------------------------------------------------------");                   
                    console.log(`nextBeforLineToTest  : ${nextBeforLineToTest}`);
                }
                
                let mockTextLine = new MockTextLine(linesBefor, nextBeforLineToTest);

                // change the settings if we hit one of these lines...
                if (mockTextLine.text.startsWith("`{\"settings\":")) {
                    updateSettings(mockTextLine.text.replace(/`/g, ""));
                }
                
                if (debugg) {
                    console.log('settings:            : ' + JSON.stringify(settings));
                }

                let o = new OtherInfo();
                let s = getStartLine(mockTextLine.lineAtFunc, mockTextLine);
                let e = getEndLine(mockTextLine.lineAtFunc, mockTextLine, linesBefor.length - 1, o); //max line NUMBER is line COUNT minus 1
                o.indents = getLineIndent(s.firstNonWhitespaceCharacterIndex, s.text);
            
                let sei: StartEndInfo = {
                    lineStart: s.lineNumber,
                    lineEnd: e.lineNumber,
                    otherInfo: o
                }

                if (debugg) {
                    console.log(`sei                  : ${JSON.stringify(sei)}`);
                }

                let text = linesBefor.slice(sei.lineStart, sei.lineEnd + 1).join("\r\n");
                let reflowedText = getReflowedText(sei, text, settings);

                // now take the reflowed text, split it on the LF delimeters, and loop and compare with the lines after 
                let reflowedLines = reflowedText.split(/\n/);

                if (debugg) {
                    console.log(`reflowedLines.length : ${reflowedLines.length}`);
                }

                for (let i = 0; i < reflowedLines.length; i++)
                {
                    if (debugg) {
                        let iStr = "0".repeat(4 - i.toString().length) + i.toString();
                        let nStr = "0".repeat(4 - nextAfterLineToTest.toString().length) + nextAfterLineToTest.toString();
                        console.log(`nextAfterLineToTest  : ${nextAfterLineToTest}`);
                        console.log(`reflowedLines[${iStr}]+x: ${reflowedLines[i]}x`);
                        console.log(`linesAfter[${nStr}]+x   : ${linesAfter[nextAfterLineToTest]}x`);
                    }

                    expect(linesAfter[nextAfterLineToTest], "befor.md has more lines than expected...are there trailing CRLFs?").to.not.be.undefined;

                    expect(reflowedLines[i]).to.equal(linesAfter[nextAfterLineToTest], "LINES DON'T MATCH!");
                    nextAfterLineToTest++;
                }

                nextBeforLineToTest = sei.lineEnd + 1

            }


            if (debugg) {
                console.log("--------------------------------------------------------------");                   
            }
          
            expect(linesAfter.length, "after.md has more lines than expected...are there trailing CRLFs?").to.equal(nextAfterLineToTest);

        });
    });
});


// takes an array of lines and an index and turns it into a mock vscode text line
class MockTextLine implements vscode.TextLine {

    constructor(private lines: string[], private lineNum: number) {

    }

    lineAtFunc = (line: number): vscode.TextLine => {
        if (line < 0 || line > this.lines.length - 1) {
            throw("rut row!")
        }

        return new MockTextLine(this.lines, line);
    }
     /**
     * The zero-based line number.
     *
     * @readonly
     */
    get lineNumber(): number { return this.lineNum; }

    /**
     * The text of this line without the line separator characters.
     *
     * @readonly
     */
    get text(): string { return  this.lines[this.lineNumber]; }
     

    /**
     * The range this line covers without the line separator characters.
     *
     * @readonly
     */
    get range(): vscode.Range { return { } as vscode.Range; }

    /**
     * The range this line covers with the line separator characters.
     *
     * @readonly
     */
    get rangeIncludingLineBreak(): vscode.Range { return {} as vscode.Range; }

    /**
     * The offset of the first character which is not a whitespace character as defined
     * by `/\s/`. **Note** that if a line is all whitespaces the length of the line is returned.
     *
     * @readonly
     */
    get firstNonWhitespaceCharacterIndex(): number { 
        let firstNonWhitespaceCharacterMatch = this.text.match(/\S/);
        if (firstNonWhitespaceCharacterMatch) {
            return this.text.indexOf(firstNonWhitespaceCharacterMatch[0]);
        } else {
            return this.text.length;
        }
    }

    /**
     * Whether this line is whitespace only, shorthand
     * for [TextLine.firstNonWhitespaceCharacterIndex](#TextLine.firstNonWhitespaceCharacterIndex) === [TextLine.text.length](#TextLine.text).
     *
     * @readonly
     */
    get isEmptyOrWhitespace(): boolean {
        return this.firstNonWhitespaceCharacterIndex === this.text.length;
    }

};
 
 