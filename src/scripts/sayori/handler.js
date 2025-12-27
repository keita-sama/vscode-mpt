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

const getAsset = (asset) => `${window.ASSET_URI}/sayori_${asset}.png`;

import { SayoriState } from './state.js';

const sayori = new SayoriState();

console.log(sayori);

// 1. Generate Pose Buttons.
const poseButtonContainer = document.getElementById('pose-wrapper');

sayori.poses.forEach((pose) => {
    const poseButton = document.createElement('vscode-button');
    poseButton.innerHTML = pose;

    poseButtonContainer.appendChild(poseButton);
});

// 2. Generate Attribute Buttons based on Pose.
const poseOptionContainer = document.getElementById('pose-attribute-wrapper');

for (const [group, _attributes] of Object.entries(sayori.poseItems)) {
    const optionContainer = document.createElement('div');


    const leftButton = document.createElement('vscode-button');
    const rightButton = document.createElement('vscode-button');
    const attributeLabel = document.createElement('span');

    optionContainer.setAttribute('class', 'pose-attribute')
    leftButton.setAttribute('icon', 'chevron-left');
    rightButton.setAttribute('icon', 'chevron-right');

    leftButton.setAttribute('id', `left-${group}`);
    rightButton.setAttribute('id', `right-${group}`);

    rightButton.setAttribute('secondary', '');
    leftButton.setAttribute('secondary', '');

    // TODO: Make this do something.
    attributeLabel.innerHTML = sayori.getAttribute(group);

    optionContainer.appendChild(leftButton);
    optionContainer.appendChild(attributeLabel);
    optionContainer.appendChild(rightButton);

    poseOptionContainer.appendChild(optionContainer);
}
