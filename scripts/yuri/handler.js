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

const getAsset = (asset) => `${window.ASSET_URI}/yuri_${asset}.png`;
// cheap workaround for compatibility
const createImg = (path, hidden=false) => {
    const img = document.createElement('img');
    img.src = getAsset(path);
    if (hidden) img.style = 'visibility: hidden';
    return img;
};

import { YuriState } from './state.js';

const yuri = new YuriState();

console.log(yuri);

// 1. Generate Pose Buttons.
const poseButtonContainer = document.getElementById('pose-wrapper');

yuri.poses.forEach((pose) => {
    const poseButton = document.createElement('vscode-button');
    poseButton.innerHTML = pose;
    poseButton.setAttribute('id', pose);

    poseButton.onclick = () => {
        yuri.changePose(pose);
        createAttributeOptions();

        renderCharacter();
        createSyntax();
    };

    poseButtonContainer.appendChild(poseButton);
});

// 2. Generate Attribute Options based on Pose.

function updateAttributeLabel(group) {
    const label = document.getElementById(`label-${group}`);
    label.innerHTML = yuri.getAttribute(group);

    renderCharacter();
    createSyntax();
}

function createAttributeOptions() {
    const attributeOptionContainer = document.getElementById('pose-attribute-wrapper');

    attributeOptionContainer.innerHTML = '';

    for (const [group, _attributes] of Object.entries(yuri.poseItems)) {

        // give yuri's arm cut for turned pose (only right is needed for the check technically)

        const optionContainer = document.createElement('div');

        const leftButton = document.createElement('vscode-button');
        const rightButton = document.createElement('vscode-button');
        const attributeLabel = document.createElement('span');

        optionContainer.setAttribute('class', 'pose-attribute');

        leftButton.setAttribute('icon', 'chevron-left');
        rightButton.setAttribute('icon', 'chevron-right');

        leftButton.setAttribute('id', `prev-${group}`);
        rightButton.setAttribute('id', `next-${group}`);

        rightButton.setAttribute('secondary', '');
        leftButton.setAttribute('secondary', '');

        function updateButtons() {
            document.getElementById(leftButton.id).disabled = yuri.stateIndex[group] === 0;
            document.getElementById(rightButton.id).disabled =
                yuri.stateIndex[group] === yuri.poseItems[group].length - 1;
        }

        rightButton.onclick = () => {
            yuri.cycleNextAttribute(group);
            updateAttributeLabel(group);
            updateButtons();
        };

        leftButton.onclick = () => {
            yuri.cyclePrevAttribute(group);
            updateAttributeLabel(group);
            updateButtons();
        };

        attributeLabel.innerHTML = yuri.getAttribute(group);
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

        attributeOptionContainer.appendChild(optionContainer);

        updateButtons();
    }
}

createAttributeOptions();

// 3. Render the character.

function renderCharacter() {
    const armMap = {
        rup: 'up',
        rcut: 'cut',
        lup: 'up',
        rdown: 'down',
        ldown: 'down',
    };

    const body = document.getElementById('render-container');
    const items = [];

    const { outfit, nose, blush, mouth, eyes, eyebrows } = yuri.state;

    if (yuri.pose === 'shy') {
        items.push(createImg(`shy_${outfit}_bodybase`));
        items.push(createImg('shy_facebase'));
        items.push(createImg(`shy_nose_${nose}`)); 
        items.push(createImg(`shy_mouth_${mouth}`));
        items.push(createImg(`shy_eyes_${eyes}`, nose === 'n5'));
        items.push(createImg(`shy_eyebrows_${eyebrows}`, nose === 'n5'));
    } else if (yuri.pose === 'turned') {
        const { left, right } = yuri.state;

        // TODO: Probably implement a better way to handle incompats.
        // Workaround for now.

        items.push(createImg('turned_facebase'));

        // draw left first if both up, otherwise right first to preventing clipping
        if (left === 'lup' && ['rup', 'rcut'].includes(right)) {
            items.push(createImg(`turned_${outfit}_left_${armMap[left]}`));
            items.push(createImg(`turned_${outfit}_right_${armMap[right]}`));
        }
        else {
            items.push(createImg(`turned_${outfit}_right_${armMap[right]}`));
            items.push(createImg(`turned_${outfit}_left_${armMap[left]}`));
        }
        items.push(createImg(`turned_nose_${nose}`));
        items.push(createImg(`turned_mouth_${mouth}`));
        items.push(createImg(`turned_eyes_${eyes}`));
        items.push(createImg(`turned_eyebrows_${eyebrows}`));
    }

    body.innerHTML = '';
    items.forEach((thing) => {
        body.appendChild(thing);
    });
}

renderCharacter();

// 4. Generate the Syntax

function createSyntax() {
    let syntax = ['yuri'];

    syntax.push(yuri.pose);
    syntax.push(yuri.state.outfit);

    if (yuri.pose === 'turned') {
        syntax.push(yuri.state.left); // left arm
        syntax.push(yuri.state.right); // right arm
    }

    syntax.push(yuri.state.nose); // nose
    syntax.push(yuri.state.mouth); // mouth
    syntax.push(yuri.state.eyes); // eyes
    syntax.push(yuri.state.eyebrows); // eyebrows

    document.getElementById('syntax').innerHTML = syntax.filter((x) => x).join(' ');
}

createSyntax();

// 5. Additional Functionalities

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

