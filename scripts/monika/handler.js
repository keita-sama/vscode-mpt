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

const getAsset = (asset) => `${window.ASSET_URI}/monika_${asset}.png`;

// cheap workaround for compatibility
const createImg = (path, hidden=false) => {
    const img = document.createElement('img');
    img.src = getAsset(path);
    if (hidden) img.style = 'visibility: hidden';
    return img;
};
import { MonikaState } from './state.js';

const monika = new MonikaState();

console.log(monika);

// 1. Generate Pose Buttons.
const poseButtonContainer = document.getElementById('pose-wrapper');

monika.poses.forEach((pose) => {
    const poseButton = document.createElement('vscode-button');
    poseButton.innerHTML = pose;
    poseButton.setAttribute('id', pose);

    poseButton.onclick = () => {
        monika.changePose(pose);
        createAttributeOptions();

        renderCharacter();
        createSyntax();
    };

    poseButtonContainer.appendChild(poseButton);
});

// 2. Generate Attribute Options based on Pose.

function updateAttributeLabel(group) {
    const label = document.getElementById(`label-${group}`);
    label.innerHTML = monika.getAttribute(group);

    renderCharacter();
    createSyntax();
}

function createAttributeOptions() {
    const attributeOptionContainer = document.getElementById('pose-attribute-wrapper');

    attributeOptionContainer.innerHTML = '';

    for (const [group, _attributes] of Object.entries(monika.poseItems)) {
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
            document.getElementById(leftButton.id).disabled = monika.stateIndex[group] === 0;
            document.getElementById(rightButton.id).disabled =
                monika.stateIndex[group] === monika.poseItems[group].length - 1;
        }

        rightButton.onclick = () => {
            monika.cycleNextAttribute(group);
            updateAttributeLabel(group);
            updateButtons();
        };

        leftButton.onclick = () => {
            monika.cyclePrevAttribute(group);
            updateAttributeLabel(group);
            updateButtons();
        };

        attributeLabel.innerHTML = monika.getAttribute(group);
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
        rdown: 'down',
        ldown: 'down',
        rhip: 'hip',
        lpoint: 'point',
    };


    const body = document.getElementById('render-container');
    const items = [];

    const { outfit, nose, mouth, eyes, eyebrows } = monika.state;

    if (monika.pose === 'lean') {
        items.push(createImg(`lean_${outfit}_bodybase`));
        items.push(createImg(`lean_${outfit}_facebase`));
        // console.log(noseMap[nose], nose);
        items.push(createImg(`lean_mouth_${mouth}`));
        items.push(createImg(`lean_nose_${nose}`));
        items.push(createImg(`lean_eyes_${eyes}`, nose === 'n5'));
        items.push(createImg(`lean_eyebrows_${eyebrows}`, nose === 'n5'));
    } else if (monika.pose === 'forward') {
        const { left, right } = monika.state;

        items.push(createImg('forward_facebase'));

        items.push(createImg(`forward_${outfit}_left_${armMap[left]}`));
        items.push(createImg(`forward_${outfit}_right_${armMap[right]}`));

        items.push(createImg(`forward_mouth_${mouth}`));
        items.push(createImg(`forward_nose_${nose}`));
        items.push(createImg(`forward_eyes_${eyes}`));
        items.push(createImg(`forward_eyebrows_${eyebrows}`));
    }

    body.innerHTML = '';
    items.forEach((thing) => {
        body.appendChild(thing);
    });
}

renderCharacter();

// 4. Generate the Syntax

function createSyntax() {
    let syntax = ['monika'];

    syntax.push(monika.pose);
    syntax.push(monika.state.outfit);

    if (monika.pose === 'forward') {
        syntax.push(monika.state.left); // left arm
        syntax.push(monika.state.right); // right arm
    }

    syntax.push(monika.state.nose); // mouth
    syntax.push(monika.state.mouth); // mouth
    syntax.push(monika.state.eyes); // eyes
    syntax.push(monika.state.eyebrows); // eyebrows

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
