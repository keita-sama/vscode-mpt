const vscode = acquireVsCodeApi();

function getState() {
    vscode.postMessage({
        command: 'fetch_state',
    });
}

function changePose() {
    let newPose = document.getElementById('pose-select').value;
    vscode.postMessage({
        command: 'change_pose',
        data: newPose,
    });
}



function thing() {
    vscode.postMessage({
        command: 'print_state',
        text: 'mwahahaha im a genius',
    });

    console.log('this work!!');
}
