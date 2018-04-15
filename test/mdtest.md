mdtest.md
=========

This is a markdown file for testing the ReflowMarkdown extension and this first paragraph starts on line 4 and ends on line 7. Line 4 should be a
paragraph start line, line 7 should be a paragraph end line, and lines 5 and 6
should be neither because
they are is in the middle.

BlockQuotes
-----------

  > This is a markdown blockquote that begins on line 11 and ends on line 13. When reflow is applied to
  > blockquotes, the blockquote syntax is  first removed and then restored after reflowing.  The indentation
  > that is used on the first line of the blockquote is used for the other lines in the blockquote.
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

5. This is yet antother item.

6. This is yet antother item.

7. This is yet antother item.

8. This is yet antother item.

9. This is yet antother item.

10. This is yet antother item.

11. This is yet antother item.

12. TODO: Make the numbers auto-renumber

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

[Marvin.Henry], but after a few users adopted it for their various needs we wanted to migrate it to a more general [GitLab Group].