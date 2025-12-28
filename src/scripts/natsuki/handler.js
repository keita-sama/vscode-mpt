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
const createImg = (path) => {
    const img = document.createElement('img');
    img.src = getAsset(path);

    return img;
};

import { NatsukiState } from './state.js';

const natsuki = new NatsukiState();

const faceButtonContainer = document.getElementById('face-wrapper');

// 1. Generate Face Buttons
natsuki.faces.forEach((face) => {
    const faceButton = document.createElement('vscode-button');
    faceButton.innerHTML = face;
    faceButton.setAttribute('id', face);

    faceButtonContainer.appendChild(faceButton);
});

const poseButtonContainer = document.getElementById('pose-wrapper');

// 2. Generate Pose Buttons

natsuki.poses.forEach((pose) => {
    const poseButton = document.createElement('vscode-button');
    poseButton.innerHTML = pose;
    poseButton.setAttribute('id', pose);

    poseButtonContainer.appendChild(poseButton);
});

// 3. Generate Face Attributes based on face;

const faceAttributeContainer = document.getElementById(
    'face-attribute-wrapper'
);

for (const [group, _attributes] of Object.entries(natsuki.faceItems)) {
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

    attributeLabel.innerHTML = natsuki.getFaceAttribute(group);
    attributeLabel.setAttribute('id', `label-${group}`);

    optionContainer.appendChild(leftButton);
    optionContainer.appendChild(attributeLabel);
    optionContainer.appendChild(rightButton);

    faceAttributeContainer.appendChild(optionContainer);
}

// 4. Generate Pose Attributes based on Pose

const poseAttributeContainer = document.getElementById(
    'pose-attribute-wrapper'
);

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
    
    attributeLabel.innerHTML = natsuki.getPoseAttribute(group);
    attributeLabel.setAttribute('id', `label-${group}`);

    optionContainer.appendChild(leftButton);
    optionContainer.appendChild(attributeLabel);
    optionContainer.appendChild(rightButton);

    poseAttributeContainer.appendChild(optionContainer);
}
