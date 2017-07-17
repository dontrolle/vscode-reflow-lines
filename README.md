Reflow Markdown
=================

Reflow Markdown is a Visual Studio Code Extension originally forked from the
[Reflow paragraph](https://marketplace.visualstudio.com/items?itemName=TroelsDamgaard.reflow-paragraph) extension
by [Troels Damgaard](https://github.com/dontrolle/vscode-reflow-lines).  Instead of targeting any line of text, however it focuses on Markdown files only and the specific formatting constructs specific to it such as paragraphs, headings, block quotes, and lists.  Testing of this extension is performed against  [GitLab Flavored Markdown](https://docs.gitlab.com/ce/user/markdown.html)

Format the current heading, paragraph, list, or blockquote to have lines no longer than your preferred line length, using the `alt+q` shortcut or your own user-specific keyboard-binding.

This extension defaults to reflowing lines to be no more than 80 characters long. The preferred line length may be overriden using the config value of `reflowMarkdown.preferredLineLength`. 

By default, it preserves indent for paragraph, when reflowing. This behavior may be switched off, by setting the configuration option `reflowMarkdown.preserveIndent` to `false`.  

## Extension Settings

This extension contributes the following settings:

* `reflow.preferredLineLength`: Set the preferred line length for reflowing paragraph (default: `80`).
* `reflow.preserveIndent`: Preserve paragraph indent when reflowing paragraph (default `true`).

## keyboard shortcuts

Invoke a reflow using `alt+q` (default).
