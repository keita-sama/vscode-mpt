import vscode from 'vscode';

type Doki = 'monika' | 'natsuki' | 'yuri' | 'sayori';

export function messageHandler(_panel: vscode.WebviewPanel) {
    return {
        for: function (doki: Doki) {
            return _panel.webview.onDidReceiveMessage((message) => {
                switch (message.command) {
                    case 'copy_pose':
                        vscode.env.clipboard.writeText(message.data).then(() => {
                            vscode.window.showInformationMessage('Pose copied!');
                        });
                        break;
                    case 'image_path':
                        _panel.webview.postMessage({
                            command: 'return_image_path',
                            data: _panel.webview
                                .asWebviewUri(
                                    vscode.Uri.file(
                                        vscode.workspace.getConfiguration('vscode-mpt').workingMPTPath + `/${doki}`,
                                    ),
                                )
                                .toString(),
                        });
                        break;
                }
            });
        },
    };
}
