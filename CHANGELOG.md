Change Log
==========

1.2.0
-----
- When a line ends with a word that begins with a left square bracket 
  ReflowMarkdown will assume it is the beginning of a hyperlink and ignore the 
  max length setting so the link text and link url stay at the end of that 
  line instead of beginning a new line. This exceptional case will improve 
  overall readability because most URLs are very long and verbose and readers 
  are mostly concerned with the link text and not the link url. Currently this 
  will only work however when the link text is a single word.   If the link text
  has spaces in it, it will break at the space and this is something that will be
  fixed in a later release.
- Fix the reflow not working sometimes due to the blockquote logic.

1.0.0
-----
- Initial release after forking from [Reflow paragraph](https://marketplace.visualstudio.com/items?itemName=TroelsDamgaard.reflow-paragraph)
- Support for Markdown lists and blockquotes, including nested blockquotes.