const vscode = acquireVsCodeApi();

let lastCopiedSyntax = [];
let ASSET_URI = '';
getAssetUri().then((uri) => (ASSET_URI = uri));

function copySyntax() {
    let textToCopy = document.getElementById('syntax').innerHTML.split(' ');

    if (!lastCopiedSyntax.length) {
        lastCopiedSyntax = textToCopy;
    } else {
        let temp = [];

        textToCopy.forEach((attr) => {
            if (!lastCopiedSyntax.includes(attr)) {
                temp.push(attr);
            }
        });

        console.log(textToCopy, temp, lastCopiedSyntax);
        lastCopiedSyntax = textToCopy;
        textToCopy = temp;
    }

    vscode.postMessage({
        command: 'copy_pose',
        data: textToCopy.join(' '),
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

    // Reset this
    lastCopiedSyntax = [];

    vscode.postMessage({
        command: 'change_pose',
        data: newPose,
    });

    generateSyntax();
    render();
}

function createDropdown(category, assets) {
    const dropdown = document.createElement('vscode-single-select');
    dropdown.className = 'character-attr'; // character attr
    dropdown.id = `${category}-select`; // For styling (maybe)

    dropdown.onchange = function () {
        updatePose(this.id, this.value);
        generateSyntax();
        render();
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
            const optionContainer = document.createElement('div');
            
            const leftButton = document.createElement('vscode-button');
            const rightButton = document.createElement('vscode-button');

            leftButton.icon = 'chevron-left';
            rightButton.icon = 'chevron-right';

            leftButton.setAttribute('secondary', '');
            rightButton.setAttribute('secondary', '');
            leftButton.id = `left-${category}`;
            rightButton.id = `right-${category}`;

            optionContainer.appendChild(leftButton);
            optionContainer.appendChild(createDropdown(category, assets));
            optionContainer.appendChild(rightButton);

            poseOptionContainer.appendChild(optionContainer);
        }
    });
}

function getAsset(asset) {
    return `${ASSET_URI}/sayori_${asset}.png`;
}

createPoseOptions();
generateSyntax();

function createImg(path) {
    const img = document.createElement('img');
    img.src = getAsset(path);

    return img;
}

async function render() {
    const armMap = {
        rup: 'up',
        lup: 'up',
        rdown: 'down',
        ldown: 'down',
    };

    const noseMap = {
        nobl: 'n1',
        awkw: 'n2',
        blus: 'n3',
        blaw: 'n4',
    };

    const sayori = await getState();
    const uri = await getAssetUri();

    const body = document.getElementById('render-container');
    const items = [];

    const { outfit, nose, blush, mouth, eyes, eyebrows } = sayori.state;

    if (sayori.pose === 'tap') {
        items.push(createImg(`tapping_${outfit}_bodybase`));
        items.push(createImg('tapping_facebase'));
        // console.log(noseMap[nose], nose);
        items.push(createImg(`tapping_nose_${noseMap[blush]}`)); // CREATE CONSISTENCY <-- REMOVE BLUSH, MAKE IT "NOSE"
        items.push(createImg(`tapping_mouth_${mouth}`));
        items.push(createImg(`tapping_eyes_${eyes}`));
        items.push(createImg(`tapping_eyebrows_${eyebrows}`));
    } else if (sayori.pose === 'turned') {
        const { left, right } = sayori.state;

        items.push(createImg('turned_facebase'));

        items.push(createImg(`turned_${outfit}_left_${armMap[left]}`));
        items.push(createImg(`turned_${outfit}_right_${armMap[right]}`));

        items.push(createImg(`turned_nose_${noseMap[nose]}`));
        items.push(createImg(`turned_mouth_${mouth}`));
        items.push(createImg(`turned_eyes_${eyes}`));
        items.push(createImg(`turned_eyebrows_${eyebrows}`));
    }

    // bodybase or left arm/rightarm
    // facebase

    // nose
    // mouth
    // eyes
    // eyebrows
    body.innerHTML = '';
    items.forEach((thing) => {
        body.appendChild(thing);
    });
}

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

render();

// getAssetUri().then((uri) => {
//     const body = document.getElementById('render-container');
//     const img = document.createElement('img');
//     img.src = getAsset('turned_casual_left_down');

//     const img2 = document.createElement('img');
//     img2.src = uri + encodeURIComponent('/sayori_turned_casual_right_down.png');

//     const img3 = document.createElement('img');
//     img3.src = uri + encodeURIComponent('/sayori_turned_facebase.png');

//     body.appendChild(img);
//     body.appendChild(img2);
//     body.appendChild(img3);
// });
