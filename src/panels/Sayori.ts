import * as vscode from 'vscode';
// import { getUri } from "../utilities/getUri";
import * as fs from 'fs';

export class SayoriPreviewPanel {
    public static currentPanel: SayoriPreviewPanel | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private _disposables: vscode.Disposable[] = [];

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        this._panel = panel;
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        this._panel.webview.html = this._getWebviewContent(this._panel.webview, extensionUri);
    }

    public static render(extensionUri: vscode.Uri) {
        if (SayoriPreviewPanel.currentPanel) {
            SayoriPreviewPanel.currentPanel._panel.reveal(vscode.ViewColumn.Two);
        }
        else {
            const panel = vscode.window.createWebviewPanel('sayori-preview', "Previewing: Sayori", vscode.ViewColumn.Two, {
                enableScripts: true
            });

            SayoriPreviewPanel.currentPanel = new SayoriPreviewPanel(panel, extensionUri);
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

    private _getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri) {
        // const webviewUri = getUri(webview, extensionUri, ["out", "webview.js"]);
        // const sayoriStyleSheet = getUri(webview, extensionUri, ['src', 'styles', 'Sayori.css']);
        // const sayoriPreviewScripts = getUri(webview, extensionUri, ['src', 'scripts', 'SayoriPoseHandler.js']);
        // const sayoriAssetsUri = getUri(webview, extensionUri, ['src', 'MPT', 'sayori']);

        return /*html*/`
        <!DOCTYPE html>
        <html lang='en'>
        <head>
            <meta charset='UTF-8'>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Sayori</title>   
        </head>
        <body>
            <h1>Hi</h1>
        </body>
        </html>
        `;
    }
}