import * as vscode from 'vscode';
import { DokiPreview } from './DokiPreview';

export class NatsukiPreview extends DokiPreview {
    constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        super(panel, extensionUri);

        this._panel.webview.html = this._getWebviewContent(this._panel.webview, extensionUri);
    }
    public static render(context: vscode.ExtensionContext) {
        const { extensionUri } = context;

        if (NatsukiPreview.currentPanel) {
            NatsukiPreview.currentPanel._panel.reveal(vscode.ViewColumn.Two);
        } else {
            const panel = vscode.window.createWebviewPanel(
                'natsuki-preview',
                'Previewing: Natsuki',
                vscode.ViewColumn.Two,
                {
                    enableScripts: true,
                }
            );

            NatsukiPreview.currentPanel = new NatsukiPreview(panel, extensionUri);
        }
    }

    private _getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri) {
        const uriParser = this.createUriResolver(webview);

        const codiconsUri = uriParser(`${extensionUri}/node_modules/@vscode/codicons/dist/codicon.css`);
        const elementsUri = uriParser(`${extensionUri}/node_modules/@vscode-elements/elements/dist/bundled.js`);
        const stylesUri = uriParser(`${extensionUri}/src/styles/previewer.css`);
        const stateUri = uriParser(`${extensionUri}/src/scripts/natsuki/state.js`);
        const handlerUri = uriParser(`${extensionUri}/src/scripts/natsuki/handler.js`);
        const srcUri = uriParser(`${extensionUri}/src/`);

        return /*html*/ `
        <!DOCTYPE html>
        <html lang='en'>
        <head>
            <meta charset='UTF-8'>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>natsuki</title>
            
            <link href="${codiconsUri}" rel="stylesheet" id="vscode-codicon-stylesheet"/>
            <link rel="stylesheet" href="${stylesUri}">

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
                <span id='syntax' class='syntax-text'>natsuki</span>
            </div>
            <div id='render-container' class='layered'></div>
            <div id='pose-controls' class='pose-controls'>
                <div id='face-wrapper' class='wrapper'></div>
                <div id='pose-wrapper' class='wrapper'></div>
                <div id='pose-attribute-wrapper' class='attribute-wrapper'></div>
                <div class='separator'></div>
                <div id='face-attribute-wrapper' class='attribute-wrapper'></div>
            </div>
            </div>

            <script src="${stateUri}" type='module'></script>
            <script src="${handlerUri}" type='module'></script>
        </body>
        </html>
        `;
    }
}
