import * as vscode from 'vscode';

// import { SayoriState } from '../dokis/SayoriState';

export class SayoriPreviewPanel {
    public static currentPanel: SayoriPreviewPanel | undefined;
    private readonly _panel: vscode.WebviewPanel;
    private _disposables: vscode.Disposable[] = [];
    // private _state: SayoriState;

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        // this._state = new SayoriState();
        this._panel = panel;

        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);
        this._panel.webview.html = this._getWebviewContent(
            this._panel.webview,
            extensionUri
        );

        this._panel.webview.onDidReceiveMessage((message) => {
            switch (message.command) {
                // case 'print_state':
                //     console.log(this._state);
                //     break;
                // case 'fetch_state':
                //     this._panel.webview.postMessage({
                //         command: 'update_state',
                //         data: JSON.stringify(this._state),
                //     });
                //     break;
                // case 'update_pose':
                //     const { group, attr } = message.data;
                //     this._state.updateAttribute(group, attr);
                //     break;
                // case 'change_pose':
                //     this._state.changePose(message.data);
                //     break;
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
                                    vscode.workspace.getConfiguration(
                                        'vscode-mpt'
                                    ).workingMPTPath + '/sayori'
                                )
                            )
                            .toString(),
                    });
                    break;
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
        const codiconsUri = webview.asWebviewUri(
            vscode.Uri.parse(
                `${extensionUri}/node_modules/@vscode/codicons/dist/codicon.css`
            )
        );
        const elementsUri = webview.asWebviewUri(
            vscode.Uri.parse(
                `${extensionUri}/node_modules/@vscode-elements/elements/dist/bundled.js`
            )
        );

        const stylesUri = webview.asWebviewUri(
            vscode.Uri.parse(`${extensionUri}/src/styles/sayori.css`)
        );

        const stateUri = webview.asWebviewUri(
            vscode.Uri.parse(`${extensionUri}/src/scripts/sayori/state.js`)
        );
        const handlerUri = webview.asWebviewUri(
            vscode.Uri.parse(`${extensionUri}/src/scripts/sayori/handler.js`)
        );

        const srcUri = webview.asWebviewUri(
            vscode.Uri.parse(`${extensionUri}/src/`)
        );

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
                <vscode-button icon='copy' class='syntax-copy-button' secondary onclick='copySyntax();'></vscode-button>
                </div>
                <h3 id='syntax'>sayori</h3>
            </div>
            <div id='render-container' class='layered'></div>
            <div id='pose-controls' class='pose-controls'>
                <div id='pose-wrapper' class='pose-wrapper'></div>
                <div id='pose-attribute-wrapper' class='pose-attribute-wrapper'></div>
            </div>
            </div>

            <script src="${stateUri}" type='module'></script>
            <script src="${handlerUri}" type='module'></script>
        </body>
        </html>
        `;
    }
}
