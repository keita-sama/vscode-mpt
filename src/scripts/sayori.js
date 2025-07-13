const vscode = acquireVsCodeApi();

function copySyntax() {
    const text = document.getElementById('syntax').innerHTML;

    vscode.postMessage({
        command: 'copy_pose',
        data: text,
    });
}

function generateSyntax() {
    return getState().then((sayori) => {
        let syntax = ['sayori'];

        syntax.push(sayori.pose);
        syntax.push(sayori.state.outfit);

        if (sayori.pose === 'turned') {
            syntax.push(sayori.state.left); // left arm
            syntax.push(sayori.state.right); // right arm
        }

        syntax.push(sayori.state[sayori.pose === 'tap' ? 'blush' : 'nose']); // nose
        syntax.push(sayori.state.mouth); // mouth
        syntax.push(sayori.state.eyes); // eyes
        syntax.push(sayori.state.eyebrows); // eyebrows

        document.getElementById('syntax').innerHTML = syntax
            .filter((x) => x)
            .join(' ');
    });
}

function updatePose(updatedGroup, updatedAttr) {
    const group = updatedGroup.split('-')[0];

    vscode.postMessage({
        command: 'update_pose',
        data: {
            group,
            attr: updatedAttr,
        },
    });
}

function changePose() {
    const newPose = document.getElementById('pose-select').value;

    vscode.postMessage({
        command: 'change_pose',
        data: newPose,
    });

    generateSyntax();
}

function createDropdown(category, assets) {
    const dropdown = document.createElement('vscode-single-select');
    dropdown.className = 'character-attr'; // character attr
    dropdown.id = `${category}-select`; // For styling (maybe)

    dropdown.onchange = function () {
        updatePose(this.id, this.value);
        generateSyntax();
    };

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
generateSyntax();
