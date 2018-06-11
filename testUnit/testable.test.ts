import * as mocha from 'mocha';
import * as chai from 'chai';
import {    replaceSpacesInLinkTextWithBs, 
            replaceSpacesInInlineCodeWithBs,
            getListStart, 
            getBlockQuote } from "../src/testable";


// Recall:  Need these to force the require('mocha') and require('chai') calls in the transpiled code due to the way
//          tsc only generates if an implementation is called and not if it is just used for type references. 
//          Also need a should variable to be able to call should.exist and should.not.exist.
//          The rest of the type definitions are ok because of the way typescript looks for them in node_modules/@types.
let should = chai.should();
let suite = mocha.suite;

suite("testable", () => {
    describe("replaceSpacesInLinkTextWithBs", () =>{
        it("passes", () => {
            replaceSpacesInLinkTextWithBs("[abc]"             /**/).should.equal("[abc]"                   /**/);
            replaceSpacesInLinkTextWithBs("xxx[abc]xxx"       /**/).should.equal("xxx[abc]xxx"             /**/);
            replaceSpacesInLinkTextWithBs("[a b]"             /**/).should.equal("[a\x08b]"                /**/);
            replaceSpacesInLinkTextWithBs("asdf [a b a] asdf" /**/).should.equal("asdf [a\x08b\x08a] asdf" /**/);
        })
    });
    describe("replaceSpacesInInlineCodeWithBs", () =>{
        it("passes", () => {
            replaceSpacesInInlineCodeWithBs("`abc`"       /**/).should.equal("`abc`"               /**/);
            replaceSpacesInInlineCodeWithBs("`a b`"       /**/).should.equal("`a\x08b`"            /**/);
            replaceSpacesInInlineCodeWithBs("``abc``"     /**/).should.equal("``abc``"             /**/);
            replaceSpacesInInlineCodeWithBs("``a b``"     /**/).should.equal("``a\x08b``"          /**/);
            replaceSpacesInInlineCodeWithBs("``a ` b``"   /**/).should.equal("``a\x08`\x08b``"     /**/);
        })
    });
    describe("getListStart", () => {
        it("passes", () => {
            getListStart("1. ").should.exist;
            getListStart(" 1. ").should.exist;
            getListStart("  1. ").should.exist;
            getListStart("99. ").should.exist;
            getListStart(" 99. ").should.exist;
            getListStart("  99. ").should.exist;
            getListStart("* ").should.exist;
            getListStart("* abc").should.exist;
            getListStart("*  ").should.exist;
            getListStart("*  abc").should.exist;
            getListStart("- ").should.exist;
            getListStart("- abc").should.exist;
            getListStart("-  ").should.exist;
            getListStart("-  abc").should.exist;
            should.not.exist(getListStart("  1."));
            should.not.exist(getListStart("  1.abc"));
            should.not.exist(getListStart("  99."));
            should.not.exist(getListStart("  99.abc"));
            should.not.exist(getListStart("*"));
            should.not.exist(getListStart("*abc"));
            should.not.exist(getListStart("-"));
            should.not.exist(getListStart("-abc"));
        });
    });
    // line beginning + [zero or more spaces + 1 greater than sign](one-or-more) + 1 or more spaces    
    describe("getBlockQuote", () =>{
        it("passes", () => {
            getBlockQuote("> ").should.exist;
            getBlockQuote(">> ").should.exist;
            getBlockQuote(">>> ").should.exist;
            getBlockQuote(" >").should.exist;
            getBlockQuote(" >>").should.exist;
            getBlockQuote(" >>>").should.exist;
            getBlockQuote(" > ").should.exist;
            getBlockQuote(" > > ").should.exist;
            getBlockQuote(" > > >").should.exist;
            getBlockQuote(" >  x").should.exist;      //multiple spaces....bad but still treat as blockquote for now    
            getBlockQuote(" >  > ").should.exist;     //multiple spaces....bad but still treat as blockquote for now
            getBlockQuote(" >  >  >").should.exist;   //multiple spaces....bad but still treat as blockquote for now  
        });
    });
});