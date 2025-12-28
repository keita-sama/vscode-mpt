import * as vscode from 'vscode';

export class DokiPreview {
    public static currentPanel: DokiPreview | undefined;
    readonly _panel: vscode.WebviewPanel;
    protected _disposables: vscode.Disposable[] = [];

    constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        this._panel = panel;

        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

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
                        data: this.getAssetUri().toString(),
                    });
                    break;
            }
        });
    }
    protected getAssetUri() {
        return this._panel.webview.asWebviewUri(
            vscode.Uri.file(vscode.workspace.getConfiguration('vscode-mpt').workingMPTPath)
        );
    }

    public createUriResolver(webview: vscode.Webview) {
        return function (path: string) {
            webview.asWebviewUri(vscode.Uri.parse(path));
        };
    }

    public dispose() {
        DokiPreview.currentPanel = undefined;
        this._panel.dispose();

        while (this._disposables.length) {
            const disposable = this._disposables.pop();
            if (disposable) {
                disposable.dispose();
            }
        }
    }
}
