import * as vscode from 'vscode';
import path from 'path';
import { DokiPreview } from './DokiPreview';

export class SayoriPreview extends DokiPreview {
    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        super(panel, extensionUri);
        this._panel.webview.html = this._getWebviewContent(this._panel.webview, extensionUri);
    }

    public static render(context: vscode.ExtensionContext) {
        const { extensionUri } = context;

        if (SayoriPreview.currentPanel) {
            SayoriPreview.currentPanel._panel.reveal(vscode.ViewColumn.Two);
        } else {
            const panel = vscode.window.createWebviewPanel(
                'sayori-preview',
                'Previewing: Sayori',
                vscode.ViewColumn.Two,
                {
                    enableScripts: true,
                }
            );

            panel.iconPath = vscode.Uri.file(path.join(context.extensionPath, 'assets', 'cookieIcon.svg'));

            SayoriPreview.currentPanel = new SayoriPreview(panel, extensionUri);
        }
    }

    private _getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri) {
        const uriParser = this.createUriResolver(webview);
        
        const codiconsUri = uriParser(`${extensionUri}/node_modules/@vscode/codicons/dist/codicon.css`);
        const elementsUri = uriParser(`${extensionUri}/node_modules/@vscode-elements/elements/dist/bundled.js`);
        const stylesUri = uriParser(`${extensionUri}/src/styles/previewer.css`);
        const stateUri = uriParser(`${extensionUri}/src/scripts/sayori/state.js`);
        const handlerUri = uriParser(`${extensionUri}/src/scripts/sayori/handler.js`);
        const srcUri = uriParser(`${extensionUri}/src/`);

        return /*html*/ `
        <!DOCTYPE html>
        <html lang='en'>
        <head>
            <meta charset='UTF-8'>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Sayori</title>
            
            <link href="${codiconsUri}" rel="stylesheet" id="vscode-codicon-stylesheet"/>
            <link rel="stylesheet" href="${stylesUri}">
            <link rel="icon" href="${srcUri}/assets/cookieIcon.svg">
            <script src="${elementsUri}" type="module"></script>
            </head>

        <style>

        </style>
        <script>
            const extensionUri = "${srcUri}";
        </script>
        <body>
            <div id='syntax-container' class='syntax-container'>
                <div id='btn-holder'>
                <vscode-button icon='copy' class='syntax-copy-button' secondary id='copy-syntax'></vscode-button>
                </div>
                <span id='syntax' class='syntax-text'>sayori</span>
            </div>
            <div id='render-container' class='layered'></div>
            <div id='pose-controls' class='pose-controls'>
                <div id='pose-wrapper' class='wrapper'></div>
                <div id='pose-attribute-wrapper' class='attribute-wrapper'></div>
            </div>
            </div>

            <script src="${stateUri}" type='module'></script>
            <script src="${handlerUri}" type='module'></script>
        </body>
        </html>
        `;
    }
}
