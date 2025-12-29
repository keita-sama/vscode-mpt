import * as vscode from 'vscode';
import path from 'path';

export class SayoriPreview {
    public static currentPanel: SayoriPreview | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private _disposables: vscode.Disposable[] = [];

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        this._panel = panel;

        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
        this._panel.webview.html = this._getWebviewContent(this._panel.webview, extensionUri);

        this._panel.webview.onDidReceiveMessage((message) => {
            switch (message.command) {
                case 'copy_pose':
                    vscode.env.clipboard.writeText(message.data).then(() => {
                        vscode.window.showInformationMessage('Pose copied!');
                    });
                    break;
                case 'image_path':
                    this._panel.webview.postMessage({
                        command: 'return_image_path',
                        data: this._panel.webview
                            .asWebviewUri(
                                vscode.Uri.file(
                                    vscode.workspace.getConfiguration('vscode-mpt').workingMPTPath + '/sayori'
                                )
                            )
                            .toString(),
                    });
                    break;
            }
        });
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

            panel.iconPath = vscode.Uri.file(path.join(context.extensionPath, 'assets', 'preview.svg'));

            SayoriPreview.currentPanel = new SayoriPreview(panel, extensionUri);
        }
    }

    public dispose() {
        SayoriPreview.currentPanel = undefined;
        this._panel.dispose();

        while (this._disposables.length) {
            const disposable = this._disposables.pop();
            if (disposable) {
                disposable.dispose();
            }
        }
    }

    private _getWebviewContent(webview: vscode.Webview, extensionUri: vscode.Uri) {
        const codiconsUri = webview.asWebviewUri(
            vscode.Uri.parse(`${extensionUri}/node_modules/@vscode/codicons/dist/codicon.css`)
        );
        const elementsUri = webview.asWebviewUri(
            vscode.Uri.parse(`${extensionUri}/node_modules/@vscode-elements/elements/dist/bundled.js`)
        );

        const stylesUri = webview.asWebviewUri(vscode.Uri.parse(`${extensionUri}/styles/previewer.css`));

        const stateUri = webview.asWebviewUri(vscode.Uri.parse(`${extensionUri}/scripts/sayori/state.js`));
        const handlerUri = webview.asWebviewUri(vscode.Uri.parse(`${extensionUri}/scripts/sayori/handler.js`));

        const srcUri = webview.asWebviewUri(vscode.Uri.parse(`${extensionUri}`));

        return /*html*/ `
        <!DOCTYPE html>
        <html lang='en'>
        <head>
            <meta charset='UTF-8'>
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Sayori</title>
            
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
                <span id='syntax' class='syntax-text'>sayori</span>
            </div>
            <div id='render-wrapper' class='layered-window'>
                <div id='render-container' class='layered'></div>
            </div>
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
