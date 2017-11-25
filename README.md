# Reflow paragraph

Format the current paragraph to have lines no longer than your preferred line length, using `alt+q` (may be overriden in user-specific keyboard-bindings.)

This extension defaults to reflowing lines to be no more than 80 characters long. The preferred line length may be overriden using the config value of `reflow.preferredLineLength`. 

By default, preserves indent for paragraph, when reflowing. This behavior may be switched off, by setting the configuration option `reflow.preserveIndent` to `false`.  

## Extension Settings

This extension contributes the following settings:

* `reflow.preferredLineLength`: Set the preferred line length for reflowing paragraph (default: `80`).
* `reflow.preserveIndent`: Preserve paragraph indent when reflowing paragraph (default `true`).
* `reflow.setSelectionToEndOfRewrapped`: Reset cursor-position to the end of reflowed paragraph (default `true`).

## keyboard shortcuts

Invoke reflow paragraph using `alt+q` (default).

## Known Issues

None.

## Release Notes

### 1.2.0

Reset cursor-position to end of reflowed paragraph, by default - mimicking behavior from emacs and vim (thanks @hstuart). If you prefer the old behavior set the user setting `reflow.setSelectionToEndOfRewrapped` to `false`.

### 1.1.0

Preserve indent for paragraph, when reflowing by default. Configurable as per above using `reflow.preserveIndent`.

### 1.0.0

Initial release.