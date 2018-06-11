import { TextEditor, Selection, Position } from "vscode";
//import * as vscode from "vscode";
 
export interface Indents {
    firstLine: string;
    otherLines: string;
    blockQuoteLevel: number;
}

export interface StartEndInfo {
    lineStart: number;
    lineEnd: number;
    indents: Indents;
}

// replaces spaces within link text (in square brackets) with another character
// that is highly unlikely to be present.  The \x08 (backspace) character is a
// good candidate...
export function replaceSpacesInLinkTextWithBs(txt: string): string {
    return txt.replace(/\[.*?\]/g, (substr, ...args) => {
        return substr.replace(/\s/g, "\x08"); // x08 is hex ascii code for the 'backspace' character
    });
   
}

// replaces spaces within inline code (surrounded by either one or two
// back-ticks) with the \0x08 (backspace) character
export function replaceSpacesInInlineCodeWithBs(txt: string): string {
    return txt.replace(/`(`([^`]|`[^`])*`|.*?)`/g, (substr, ...args) => {
        return substr.replace(/\s/g, "\x08"); // x08 is hex ascii code for the 'backspace' character
    });  
}

// true if text is zero or more spaces + [ (1 or more digits + 1 decimal) OR (1 dash or asterisk) ] + 1 or more spaces   
export function getListStart(text: string): RegExpMatchArray {
    return text.match(/^\s*((\d+\.)|([-\*]))(\s+)/);        
}

// line beginning + [zero or more spaces + 1 greater than sign](one-or-more)    
export function getBlockQuote(text: string): RegExpMatchArray {
    return text.match(/^(\s*>)+/);       
}

export function markdownBlockQuoteLevelFromRegExMatch(matchArray: RegExpMatchArray): number {
    if (matchArray && matchArray.length)
        return matchArray[0].replace(/\s/g, "").length
    else
        return 0;
}

export function isMarkdownHeadingHash(text: string): boolean {
    return text.startsWith("#");
}

export function isMarkdownHeadingDash(text: string): boolean {
    return text.startsWith("==") || text.startsWith("--");
}

export function markdownBlockQuoteLevelFromString(text: string): number {
    return markdownBlockQuoteLevelFromRegExMatch(getBlockQuote(text));    
}

export function isFencedCodeBlockDelimiter(text: string): RegExpMatchArray {
    return text.match(/^(\s*```)/);
}

export function getLineIndent(firstNonWhitespaceCharacterIndex: number, text: string): Indents {
    
    let startLnSpaces = " ".repeat(firstNonWhitespaceCharacterIndex);

    let regExMatches = getListStart(text);
    if (regExMatches) {        
        return {
            firstLine: startLnSpaces,
            otherLines: " ".repeat(regExMatches[0].length),
            blockQuoteLevel: 0
        }
    }
    
    regExMatches = getBlockQuote(text)
    if (regExMatches) {
        var level =  markdownBlockQuoteLevelFromRegExMatch(regExMatches);
        var indent = startLnSpaces + "> ".repeat(level);
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

// helper for integration testing....aygni?
export function goToLine(activeTextEditor: TextEditor, 
                         selectionCtor1: new (anchor: Position, active: Position) => Selection,
                         selectionCtor2: new (anchorLine: number, anchorCharacter: number, activeLine: number, activeCharacter: number) => Selection,
                         oneBasedLine: number, selectWholeLine: boolean) {
    let zeroBasedLine = oneBasedLine - 1
    let range = activeTextEditor.document.lineAt(zeroBasedLine).range;

    activeTextEditor.selection = selectWholeLine 
                     ? new selectionCtor1(range.start, range.end) 
                     : new selectionCtor2(zeroBasedLine, 0, zeroBasedLine, 0);

    activeTextEditor.revealRange(range);
}
