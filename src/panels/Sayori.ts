import * as vscode from 'vscode';
// import { getUri } from "../utilities/getUri";
import * as fs from 'fs';

import { Sayori as SayoriState } from '../dokis/sayori';

export class SayoriPreviewPanel {
    public static currentPanel: SayoriPreviewPanel | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private _disposables: vscode.Disposable[] = [];
    // private _extensionUri: vscode.Uri;
    private _state: SayoriState;

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        this._state = new SayoriState();
        
        // this._extensionUri = extensionUri;
        this._panel = panel;
        
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
        this._panel.webview.html = this._getWebviewContent(
            this._panel.webview,
            extensionUri
        );

        this._panel.webview.onDidReceiveMessage((message) => {
            if (message.command === 'print_state') {
                console.log(this._state);
            }
            // ! TODO: EXPIREMENT WITH panel.postMessage()
            // you can send JSON data back to update state and shit.
            else if (message.command === 'change_pose') {
                this._state.changePose(message.data);
            }
        });
    }

    public static render(extensionUri: vscode.Uri) {
        if (SayoriPreviewPanel.currentPanel) {
            SayoriPreviewPanel.currentPanel._panel.reveal(
                vscode.ViewColumn.Two
            );
        } else {
            const panel = vscode.window.createWebviewPanel(
                'sayori-preview',
                'Previewing: Sayori',
                vscode.ViewColumn.Two,
                {
                    enableScripts: true,
                }
            );

            SayoriPreviewPanel.currentPanel = new SayoriPreviewPanel(
                panel,
                extensionUri
            );
        }
    }

    public dispose() {
        SayoriPreviewPanel.currentPanel = undefined;

        this._panel.dispose();

        while (this._disposables.length) {
            const disposable = this._disposables.pop();

            if (disposable) {
                disposable.dispose();
            }
        }
    }

    private _getWebviewContent(
        webview: vscode.Webview,
        extensionUri: vscode.Uri
    ) {
        
        const scriptUri = webview.asWebviewUri(vscode.Uri.parse(`${extensionUri}/src/scripts/sayori.js`));
        const elementsUri = webview.asWebviewUri(vscode.Uri.parse(`${extensionUri}/node_modules/@vscode-elements/elements/dist/bundled.js`));

        return /*html*/ `
        <!DOCTYPE html>
        <html lang='en'>
        <head>
            <meta charset='UTF-8'>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Sayori</title>
            <script src="${scriptUri}"></script>
        </head>
        <body>
        <script src="${elementsUri}" type="module"></script>
        
        <h1>Hi</h1>
        <vscode-single-select id="pose-select" onchange="changePose(); thing();">
            <vscode-option selected value="turned">turned</vscode-option>
            <vscode-option value="tap">tap</vscode-option>
        </vscode-single-select>
        </body>
        
        </html>
        `;
    }
}
