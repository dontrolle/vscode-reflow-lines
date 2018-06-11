import * as mocha from 'mocha';
import { expect } from 'chai';
import {    replaceSpacesInLinkTextWithBs, 
            replaceSpacesInInlineCodeWithBs,
            getListStart, 
            getBlockQuote } from "../src/testable";


// Recall:  Need these to force the require('mocha') call in the transpiled code due to the way
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
});