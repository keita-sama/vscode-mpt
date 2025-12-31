const vscode = acquireVsCodeApi();
window.ASSET_URI = await getAssetUri();

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

const getAsset = (asset) => `${window.ASSET_URI}/natsuki_${asset}.png`;

import { NatsukiState } from './state.js';

const natsuki = new NatsukiState();

const faceButtonContainer = document.getElementById('face-wrapper');

function updateAttributeLabel(group, section) {
    const label = document.getElementById(`label-${group}`);

    console.log(natsuki.getFaceAttribute(group), natsuki.getPoseAttribute(group));

    switch (section) {
        case 'face':
            label.innerHTML = natsuki.getFaceAttribute(group);
            break;
        case 'pose':
            label.innerHTML = natsuki.getPoseAttribute(group);
            break;
    }

    createSyntax();
    renderCharacter();
}

// 1. Generate Face Buttons

natsuki.faces.forEach((face) => {
    const faceButton = document.createElement('vscode-button');
    faceButton.innerHTML = face;
    faceButton.setAttribute('id', face);

    faceButton.onclick = () => {
        natsuki.changeFace(face);
        createFaceAttributeOptions();
        createSyntax();
        renderCharacter();
    };

    faceButtonContainer.appendChild(faceButton);
});

const poseButtonContainer = document.getElementById('pose-wrapper');

// 2. Generate Pose Buttons

natsuki.poses.forEach((pose) => {
    const poseButton = document.createElement('vscode-button');
    poseButton.innerHTML = pose;
    poseButton.setAttribute('id', pose);

    poseButton.onclick = () => {
        natsuki.changePose(pose);
        createPoseAttributeOptions();
        createSyntax();
        renderCharacter();
    };

    poseButtonContainer.appendChild(poseButton);
});

// 3. Generate Face Attributes based on face;

function createFaceAttributeOptions() {
    const faceAttributeContainer = document.getElementById('face-attribute-wrapper');

    faceAttributeContainer.innerHTML = '';

    for (const [group, _attributes] of Object.entries(natsuki.faceItems)) {
        const optionContainer = document.createElement('div');

        const leftButton = document.createElement('vscode-button');
        const rightButton = document.createElement('vscode-button');
        const attributeLabel = document.createElement('span');

        // TODO: i guess attributes and pose attributes are the same thing; ggive generic class later.
        optionContainer.setAttribute('class', 'pose-attribute');

        leftButton.setAttribute('icon', 'chevron-left');
        rightButton.setAttribute('icon', 'chevron-right');

        leftButton.setAttribute('id', `prev-${group}`);
        rightButton.setAttribute('id', `next-${group}`);

        rightButton.setAttribute('secondary', '');
        leftButton.setAttribute('secondary', '');

        function updateButtons() {
            document.getElementById(leftButton.id).disabled = natsuki.faceStateIndex[group] === 0;
            document.getElementById(rightButton.id).disabled =
                natsuki.faceStateIndex[group] === natsuki.faceItems[group].length - 1;
        }

        rightButton.onclick = () => {
            natsuki.cycleNextFaceAttribute(group);
            updateButtons();
            updateAttributeLabel(group, 'face');
        };

        leftButton.onclick = () => {
            natsuki.cyclePrevFaceAttribute(group);
            updateButtons();
            updateAttributeLabel(group, 'face');
        };

        attributeLabel.innerHTML = natsuki.getFaceAttribute(group);
        attributeLabel.setAttribute('id', `label-${group}`);

        optionContainer.appendChild(leftButton);
        optionContainer.appendChild(attributeLabel);
        optionContainer.appendChild(rightButton);

        optionContainer.addEventListener('wheel', (ev) => {
            const direction = ev.deltaY > 0 ? 'down' : 'up';

            // NOTE: These simulate the buttons since the event can't read the group.
            switch (direction) {
                case 'down':
                    rightButton.onclick();
                    break;
                case 'up':
                    leftButton.onclick();
                    break;
                default:
                    break;
            }
        });

        faceAttributeContainer.appendChild(optionContainer);

        updateButtons();
    }
}

createFaceAttributeOptions();

// 4. Generate Pose Attributes based on Pose

function createPoseAttributeOptions() {
    const poseAttributeContainer = document.getElementById('pose-attribute-wrapper');

    poseAttributeContainer.innerHTML = '';

    for (const [group, _attributes] of Object.entries(natsuki.poseItems)) {
        const optionContainer = document.createElement('div');

        const leftButton = document.createElement('vscode-button');
        const rightButton = document.createElement('vscode-button');
        const attributeLabel = document.createElement('span');

        optionContainer.setAttribute('class', 'pose-attribute'); // TODO: i guess attributes and pose attributes are the same thing; ggive generic class later.

        leftButton.setAttribute('icon', 'chevron-left');
        rightButton.setAttribute('icon', 'chevron-right');

        leftButton.setAttribute('id', `prev-${group}`);
        rightButton.setAttribute('id', `next-${group}`);

        rightButton.setAttribute('secondary', '');
        leftButton.setAttribute('secondary', '');

        function updateButtons() {
            document.getElementById(leftButton.id).disabled = natsuki.poseStateIndex[group] === 0;
            document.getElementById(rightButton.id).disabled =
                natsuki.poseStateIndex[group] === natsuki.poseItems[group].length - 1;
        }

        rightButton.onclick = () => {
            natsuki.cycleNextPoseAttribute(group);
            updateButtons();
            updateAttributeLabel(group, 'pose');
            createSyntax();
            renderCharacter();
        };

        leftButton.onclick = () => {
            natsuki.cyclePrevPoseAttribute(group);
            updateButtons();
            updateAttributeLabel(group, 'pose');
            createSyntax();
            renderCharacter();
        };

        attributeLabel.innerHTML = natsuki.getPoseAttribute(group);
        attributeLabel.setAttribute('id', `label-${group}`);

        optionContainer.appendChild(leftButton);
        optionContainer.appendChild(attributeLabel);
        optionContainer.appendChild(rightButton);

        optionContainer.addEventListener('wheel', (ev) => {
            const direction = ev.deltaY > 0 ? 'down' : 'up';

            // NOTE: These simulate the buttons since the event can't read the group.
            switch (direction) {
                case 'down':
                    rightButton.onclick();
                    break;
                case 'up':
                    leftButton.onclick();
                    break;
                default:
                    break;
            }
        });

        poseAttributeContainer.appendChild(optionContainer);

        updateButtons();
    }
}

createPoseAttributeOptions();
// 5. Render character

const armMap = {
    rhip: 'hip',
    lhip: 'hip',
    rdown: 'down',
    ldown: 'down',
};

const body = document.getElementById('render-container');

function renderCharacter() {
    const items = [];
    const { outfit } = natsuki.poseState;
    const { eyes, mouth, eyebrows, nose } = natsuki.faceState;

    function addAttribute(path, offset) {
        const img = document.createElement('img');
        img.setAttribute('src', getAsset(path));

        if (offset) {
            // NOTE: This fixes the minor height adjust caused by cross pose.
            img.style = 'transform: translate(9px, 11px);';
        }

        items.push(img);
    }

    // a. Render her face

    const crossed = natsuki.pose === 'cross';

    if (natsuki.face !== 'fta') {
        const faceName = natsuki.face === 'ff' ? 'face_forward' : 'face_sad';

        addAttribute(faceName, crossed);
        addAttribute(`${natsuki.face}_eyes_${eyes}`, crossed);
        addAttribute(`${natsuki.face}_mouth_${mouth}`, crossed);
        addAttribute(`${natsuki.face}_eyebrows_${eyebrows}`, crossed);
        addAttribute(`${natsuki.face}_nose_${nose}`, crossed);
    } else if (natsuki.face === 'fta') {
        addAttribute('face_turnedaway', crossed);
    }

    // b. Render her body.
    if (natsuki.pose === 'turned') {
        const { left, right } = natsuki.poseState;

        addAttribute(`turned_${outfit}_right_${armMap[right]}`);
        addAttribute(`turned_${outfit}_left_${armMap[left]}`);
    } else if (natsuki.pose === 'cross') {
        addAttribute(`crossed(${natsuki.face === 'fta' ? 'fs' : natsuki.face})_${outfit}`);
    }

    body.innerHTML = '';
    items.forEach((thing) => {
        body.appendChild(thing);
    });
}

renderCharacter();

// 6. Generate the Syntax

function createSyntax() {
    let syntax = ['natsuki'];

    syntax.push(natsuki.pose);
    syntax.push(natsuki.face);
    syntax.push(natsuki.poseState.outfit);

    if (natsuki.pose === 'turned') {
        syntax.push(natsuki.poseState.left);
        syntax.push(natsuki.poseState.right);
    }

    if (natsuki.face !== 'fta') {
        syntax.push(natsuki.faceState.eyes);
        syntax.push(natsuki.faceState.mouth);
        syntax.push(natsuki.faceState.eyebrows);
        syntax.push(natsuki.faceState.nose);
    }

    document.getElementById('syntax').innerHTML = syntax.filter((x) => x).join(' ');
}

createSyntax();

// 7. Additional Functionalities

// a. Copy Syntax

function copySyntax() {
    const syntax = document.getElementById('syntax').innerHTML;

    vscode.postMessage({
        command: 'copy_pose',
        data: syntax,
    });
}

const copyButton = document.getElementById('copy-syntax');
copyButton.onclick = copySyntax;

