/// <reference path="../node_modules/@types/jasmine/index.d.ts" />

import { replaceSpacesWithinLinkTextWithSomethingVeryRare, isListStart, isBlockQuote } from "../src/testable";

describe("replaceSpacesWithinLinkTextWithSomethingVeryRare", () =>{
    it("should pass these tests", () => {
        expect(replaceSpacesWithinLinkTextWithSomethingVeryRare("[abc]")).toEqual("[abc]");
        expect(replaceSpacesWithinLinkTextWithSomethingVeryRare("xxx[abc]xxx")).toEqual("xxx[abc]xxx");
        expect(replaceSpacesWithinLinkTextWithSomethingVeryRare("[a b]")).toEqual("[a\x08b]");
        expect(replaceSpacesWithinLinkTextWithSomethingVeryRare("asdf [a b a] asdf")).toEqual("asdf [a\x08b\x08a] asdf");
    })
})

describe("isListStart", () =>{
    it("should pass these tests", () => {
        expect(isListStart("1. ")).toBeTruthy();
        expect(isListStart(" 1. ")).toBeTruthy();
        expect(isListStart("  1. ")).toBeTruthy();
        expect(isListStart("  1.")).toBeFalsy();
        expect(isListStart("  1.abc")).toBeFalsy();
        expect(isListStart("99. ")).toBeTruthy();
        expect(isListStart(" 99. ")).toBeTruthy();
        expect(isListStart("  99. ")).toBeTruthy();
        expect(isListStart("  99.")).toBeFalsy();
        expect(isListStart("  99.abc")).toBeFalsy();
        expect(isListStart("*")).toBeFalsy();
        expect(isListStart("*abc")).toBeFalsy();
        expect(isListStart("* ")).toBeTruthy();
        expect(isListStart("* abc")).toBeTruthy();
        expect(isListStart("*  ")).toBeTruthy();
        expect(isListStart("*  abc")).toBeTruthy();
        expect(isListStart("-")).toBeFalsy();
        expect(isListStart("-abc")).toBeFalsy();
        expect(isListStart("- ")).toBeTruthy();
        expect(isListStart("- abc")).toBeTruthy();
        expect(isListStart("-  ")).toBeTruthy();
        expect(isListStart("-  abc")).toBeTruthy();
    });
});

// line beginning + [zero or more spaces + 1 greater than sign](one-or-more) + 1 or more spaces    
describe("isBlockQuote", () =>{
    it("should pass these tests", () => {
        expect(isBlockQuote("> ")).toBeTruthy();
        expect(isBlockQuote(">> ")).toBeTruthy();
        expect(isBlockQuote(">>> ")).toBeTruthy();
        expect(isBlockQuote(" >")).toBeTruthy();
        expect(isBlockQuote(" >>")).toBeTruthy();
        expect(isBlockQuote(" >>>")).toBeTruthy();
        expect(isBlockQuote(" > ")).toBeTruthy();
        expect(isBlockQuote(" > > ")).toBeTruthy();
        expect(isBlockQuote(" > > >")).toBeTruthy();
        expect(isBlockQuote(" >  x")).toBeTruthy();      //multiple spaces....bad but still treat as blockquote for now    
        expect(isBlockQuote(" >  > ")).toBeTruthy();     //multiple spaces....bad but still treat as blockquote for now
        expect(isBlockQuote(" >  >  >")).toBeTruthy();   //multiple spaces....bad but still treat as blockquote for now  
    });
});