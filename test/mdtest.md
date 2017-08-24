mdtest.md 
=========
 
This is a markdown file for testing the ReflowMarkdown extension and this first paragraph starts on line 4 and ends on line 7. Line 4 should be a
paragraph start line, line 7 should be a paragraph end line, and lines 5 and 6
should be neither because it is in the middle.

BlockQuotes
-----------
  > This is a markdown blockquote that begins on line 11 and ends on line 13. When reflow is applied to
  > blockquotes, the blockquote syntax is  first removed and then restored after reflowing.  The indentation 
  > that is used on the first line of the blockquote is used for the other lines in the blockquote. 
  > > This is a blockquote nested
  > > inside of another blockquote.
  
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


This is for testing a line that has a long inline link at the end such as [link](http://www.somelonglink.com/a/b/c/1/2/3). 
In this case we do not want the long link to be at the start of a new line. 
Instead, we would rather just have the link extend beyond the max length 
setting. This is an exception because it improves readability. 

TODO:
-----
Here is a similar paragraph to the one above but the link text has contains [A space](http://www.somelonglink.com/a/b/c/1/2/3). 
The line break will be between the 'A' and the 'space' and this is not wanted.
This is something that will be fixed in a later release.
