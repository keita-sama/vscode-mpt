const vscode = acquireVsCodeApi();

let ASSET_URI;

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

    dropdown.addEventListener('wheel', (ev) => {
        const direction = ev.deltaY > 0 ? 'down' : 'up';
        const dropdownLength = dropdown.options.length - 1;

        if (ev.deltaY === 0) return;

        if (direction === 'down') {
            if (dropdownLength > dropdown.selectedIndex) {
                dropdown.selectedIndex++;
            }
        } else {
            if (dropdown.selectedIndex !== 0) {
                dropdown.selectedIndex--;
            }
        }

        dropdown.onchange();
    });
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

async function renderCharacter() {}
// UGLY TERSTING P{LEASE DON"T LOOK
function getAssetUri() {
    vscode.postMessage({ command: 'image_path' });
    return new Promise((resolve) => {
        window.addEventListener('message', (ev) => {
            const message = ev.data;
            if (message.command === 'return_image_path') {
                resolve(message.data);
            }
        });
    });
}

getAssetUri().then((uri) => {
    const body = document.getElementById('render-container');
    const img = document.createElement('img');
    img.src = uri + encodeURIComponent('/sayori_turned_casual_left_down.png');

    const img2 = document.createElement('img');
    img2.src = uri + encodeURIComponent('/sayori_turned_casual_right_down.png');

    const img3 = document.createElement('img');
    img3.src = uri + encodeURIComponent('/sayori_turned_facebase.png');

    body.appendChild(img);
    body.appendChild(img2);
    body.appendChild(img3);
});
