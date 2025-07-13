const vscode = acquireVsCodeApi();

function copySyntax() {
    const text = document.getElementById('syntax').innerHTML;

    vscode.postMessage({
        command: 'copy_pose',
        data: text
    });
}

// function resetSyntax(pose) {
//     document.getElementById('syntax').innerHTML = `sayori ${pose}`;
// }

function changePose() {
    let newPose = document.getElementById('pose-select').value;
    vscode.postMessage({
        command: 'change_pose',
        data: newPose,
    });

    // resetSyntax(newPose);
}

function createDropdown(category, assets) {
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

function getState() {
    return new Promise((resolve) => {
        vscode.postMessage({ command: 'fetch_state' });
        window.addEventListener(
            'message',
            (event) => {
                const message = event.data;
                if (message.command === 'update_state') {
                    const parsed = JSON.parse(message.data);
                    resolve(parsed);
                }
            },
            { once: true }
        );
    });
}

function createPoseOptions() {
    getState().then((state) => {
        console.log(state);
        const poseOptionContainer = document.getElementById('pose-options');
        poseOptionContainer.innerHTML = '';

        for (const [category, assets] of Object.entries(state.poseItems)) {
            poseOptionContainer.appendChild(createDropdown(category, assets));
        }
    });
}

createPoseOptions();
