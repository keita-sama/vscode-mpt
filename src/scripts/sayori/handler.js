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
const createImg = (path) => {
    const img = document.createElement('img');
    img.src = getAsset(path);

    return img;
};
import { SayoriState } from './state.js';

const sayori = new SayoriState();

console.log(sayori);

// 1. Generate Pose Buttons.
const poseButtonContainer = document.getElementById('pose-wrapper');

sayori.poses.forEach((pose) => {
    const poseButton = document.createElement('vscode-button');
    poseButton.innerHTML = pose;
    poseButton.setAttribute('id', pose);

    poseButton.onclick = () => {
        sayori.changePose(pose);
        createAttributeOptions();

        renderCharacter();
        createSyntax();
    };

    poseButtonContainer.appendChild(poseButton);
});

// 2. Generate Attribute Options based on Pose.

function updateAttributeLabel(group) {
    const label = document.getElementById(`label-${group}`);
    label.innerHTML = sayori.getAttribute(group);

    renderCharacter();
    createSyntax();
}

function createAttributeOptions() {
    const attributeOptionContainer = document.getElementById(
        'pose-attribute-wrapper'
    );

    attributeOptionContainer.innerHTML = '';

    for (const [group, _attributes] of Object.entries(sayori.poseItems)) {
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

        rightButton.onclick = () => {
            sayori.cycleNextAttribute(group);
            updateAttributeLabel(group);
        };

        leftButton.onclick = () => {
            sayori.cyclePrevAttribute(group);
            updateAttributeLabel(group);
        };

        attributeLabel.innerHTML = sayori.getAttribute(group);
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
    }
}

createAttributeOptions();

// 3. Render the character.

function renderCharacter() {
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

renderCharacter();

// 4. Generate the Syntax

function createSyntax() {
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