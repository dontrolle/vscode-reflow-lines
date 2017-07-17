mdtest.md 
=========
 
This is a markdown file for testing the ReflowMarkdown extension and this
first paragraph starts on line 4 and ends on line 7. Line 4 should be a
paragraph start line, line 7 should be a paragraph end line, and lines 5 and 6
should be neither because it is in the middle.

BlockQuotes
-----------
  > This is a markdown blockquote that begins on line 11 and ends on line 13. When reflow is applied to
  > blockquotes, the blockquote syntax is  first removed and then restored after reflowing.  The indentation 
  > that is used on the first line of the blockquote is used for the other lines in the blockquote. 
  
Number Lists
------------
01. This is the first list item.
02. This is the second list item and it is very long.  When reflow is applied, the lines that follow
the first line will all be indented such that they start at the same place that the text starts fort
on the first line, rather than starting right under the number.
02. This is the third list item.
03. This is the fourth list item.
04. This is yet antother item.
05. This is yet antother item.
06. This is yet antother item.
07. This is yet antother item.
08. This is yet antother item.
09. This is yet antother item. 
10. This is yet antother item.
11. TODO: Make the numbers auto-renumber

