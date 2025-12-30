/*

I should probably learn how to properly bundle.

This runs after "vscode:prepublish" aka the compile command.

It copies in the styles, JSON data and relevant scripts for the extension.
I will most likely fix this in a later iteration.

*/

const fs = require('node:fs');

['data', 'scripts', 'styles'].forEach((folder) => {
    fs.cpSync(`${folder}`, `dist/${folder}`, { recursive: true });
});
