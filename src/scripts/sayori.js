const vscode = acquireVsCodeApi();

window.addEventListener('message', (event) => {
    const message = event.data;
    if (message.command === 'update_state') {
        window.state = JSON.parse(message.data);
    }
});

function getState() {
    vscode.postMessage({ command: 'fetch_state' });

    console.log(window.state);
}

function changePose() {
    let newPose = document.getElementById('pose-select').value;
    vscode.postMessage({
        command: 'change_pose',
        data: newPose,
    });
}

function createDropdown(category, assets) {
    // console.log(category);
    // console.log(assets);
    const dropdown = document.createElement('vscode-single-select');
    dropdown.id = 'character-attr'; // character attr
    dropdown.className = `${category}-select`; // For styling (maybe)

    assets.forEach((asset, index) => {
        const optionElement = document.createElement('vscode-option');
        optionElement.value = asset;
        optionElement.innerHTML = asset;
        if (!index) {
            optionElement.selected = true;
        }
        dropdown.appendChild(optionElement);
    });

    return dropdown;
}

function createPoseOptions() {
    getState();
    console.log(window.state);
    const poseOptionContainer = document.getElementById('pose-options');
    // console.log(poseOptionContainer, 'This is the value of the pose option container');
    // 1. Reset pose options;
    poseOptionContainer.innerHTML = '';

    for (const [category, assets] of state.poseItems) {
        poseOptionContainer.appendChild(createDropdown(category, assets));
    }
}

createPoseOptions();
// function thing() {
//     vscode.postMessage({
//         command: 'print_state',
//         text: 'mwahahaha im a genius',
//     });

//     console.log('this work!!');
// }
