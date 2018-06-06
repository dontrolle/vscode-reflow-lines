mdtest.md
=========

This is a markdown file for testing the ReflowMarkdown extension.  When ReflowMarkdown is applied it should discover that this first line is the 'start'
and then it should discover that this line is a 'middle' line,
and that this line is a 'middle' line too,
as well as this one.
This last line it should see as the 'end' line.  The start, middle, and end lines help it determine where to start and stop reflowing since we only want to reflow one 'paragraph' at a time.

Identifying sentence endings is part of the logic too.  Normally a single space separates reflowed words but because some writing styles dictate two spaces after the end of a sentenace we want
to follow the user's preference for this.    Sentenaces can end with a period, a question mark, or an exclamation mark! Punctuation marks that appear within a "quotation should also end a sentence."
If `reflowMarkdown.doubleSpaceBetweenSentences` is `true` then there should be two spaces between each sentence after a reflow.

BlockQuotes
-----------

  > This is a markdown blockquote that begins on line 12 and ends on line 14. When reflow is applied to
  > blockquotes, the blockquote syntax is  first removed and then restored after reflowing.  The indentation
  > that is used on the first line of the blockquote is used for the other lines in the blockquote.
  > > This is a blockquote nested
  > > inside of another blockquote.

> This is a markdown blockquote that begins on line 18 and ends on line 19. The indentation level of the first line should not be changed when reflow is applied to
> blockquotes,  The indentation that is used on the first line of the blockquote is used for the other lines in the blockquote.
> > This is a blockquote nested
> > inside of another blockquote.




Number Lists
------------

1. This is the first list item.

2. This is the second list item and it is very long. When reflow is applied,
   the lines that follow the first line will all be indented such that they
   start at the same place that the text starts fort on the first line, rather
   than starting right under the number.

3. This is the third list item.

4. This is the fourth list item.

5. This is yet another item.

6. This is yet another item.

7. This is yet another item.

8. This is yet another item.

9. This is yet another item.

10. This is yet another item.

11. This is yet another item.

12. TODO: Make the numbers auto-renumber

List Formats
------------

The indentation and spaces around the list marker in the first line should
remain unchanged, and the following lines should continue the indentation of
the text following the list marker.

1.  Numbered list with double spaces after list marker.  This format can be used to make sure the text following the list marker is always aligned even if the list contains 10 or more items.
2.  This is the second list item and it is very long. When reflow is applied,
    the lines that follow the first line will all be indented such that they
    start at the same place that the text starts on the first line, rather
    than starting right under the number.
3.  This is the third list item.
4.  This is the fourth list item.
5.  This is yet another item.
6.  This is yet another item.
7.  This is yet another item.
8.  This is yet another item.
9.  This is yet another item.
10. This is yet another item.
11. This is yet another item.
12. This is yet another item.

Bulleted lists can also be indented to provide a consistent level of indentation for continued lines.

  - Bulleted list with double spaces before the list marker.  Using this format aligns the text to the same indentation label as the numbered list in the previous example.
  - This is the second list item.
  - This is the third list item.

Hyperlinks (where the text does not have white space in it)
-----------------------------------------------------------

This is for testing a line that has a long inline link at the end such as [link](http://www.somelonglink.com/a/b/c/1/2/3).
In this case we do not want the long link to be at the start of a new line.
Instead, we would rather just have the link extend beyond the max length
setting. This is an exception because it improves readability.

Hyperlinks (where the text has white space in it)
-------------------------------------------------

Here is a similar paragraph to the one above but the link text has contains [A space](http://www.somelonglink.com/a/b/c/1/2/3).
Again in this case we do not want the long link to be at the start of a new
line. Because there is whitespace within the square brackets we have to first
replace that whitespace with a character that is not likely to occur (for now
we are using the \x08 (backspace) character). After the reflow, we restore the
spaces.

Hyperlinks (multiple)
-------------------------------------------------

Here is a similar paragraph to the one above but there are [multiple hyperlinks in it](http://www.somelonglink.com/a/b/c/1/2/3).
The first line should not be wrapped but this one should because the link starts [after the max length](http://www.somelonglink.com/a/b/c/1/2/3).

Inline Code
-----------

Inline code is surrounded by `back-ticks`.  Long spans of code `should not be split into multiple lines`.
Inline code can be delimited by either `one` or ``two`` back-ticks.

When started with two back-ticks, a single back-tick will not end the code span so that code containing back-ticks does not need to be escaped.
Long spans of code should not be split into multiple lines when ``enclosed ` within two back-ticks``.

Preformatted Text
-----------------

    Preformatted paragraphs can either be indented by four spaces or fenced by adding ` ``` ` before the first line and after the last.

```
Preformatted paragraphs can either be indented by four spaces or fenced by adding ` ``` ` before the first line and after the last.

Paragraphs within the ``` fences should be reflowed separately.
```

```javascript
// Preformatted paragraphs can also have a language keyword to indicate the language to use for syntax highlighting.
let a = 1;
let b = 2;
// TODO: Only wrap comments within comment blocks based on syntax highlighting.
```
