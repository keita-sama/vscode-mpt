// TODO: if i get there, implement custom outfits/attributes via json

/*

How I'm gonna handle updating

Write all this shit in typescript

Use post message system to communicate (this allows users)
to add custom stuff and gives me access to vscode api directly
*/

type sayori = Record<'tap' | 'turned', Record<string, string[]>>;

const sayoriProperties: sayori = {
    tap: {
        outfit: ['uniform', 'casual'],
        blush: ['nobl', 'awkw', 'blus', 'blaw'],
        mouth: ['m1', 'm2', 'm3', 'm4'],
        eyes: ['e1', 'e2', 'e3', 'e4', 'e5', 'e6'],
        eyebrows: ['b1', 'b2', 'b3'],
    },
    turned: {
        outfit: ['uniform', 'casual'],
        left: ['lup', 'ldown'],
        right: ['rup', 'rdown'],
        nose: ['nobl', 'awkw', 'blus', 'blaw'],
        mouth: [
            'ma',
            'mb',
            'mc',
            'md',
            'me',
            'mf',
            'mg',
            'mh',
            'mi',
            'mj',
            'mk',
            'ml',
            'mm',
            'mn',
            'mo',
            'mp',
            'mq',
            'mr',
        ],
        eyes: [
            'e1a',
            'e1b',
            'e1c',
            'e1d',
            'e1e',
            'e1f',
            'e1g',
            'e1h',
            'e2a',
            'e2b',
            'e2c',
            'e2d',
            'e3a',
            'e3b',
            'e4a',
            'e4b',
            'e4c',
            'e4d',
            'e4e',
            'e0a',
            'e0b',
        ],
        eyebrows: [
            'b1a',
            'b1b',
            'b1c',
            'b1d',
            'b1e',
            'b1f',
            'b2a',
            'b2b',
            'b2c',
            'b3a',
            'b3b',
            'b3c',
        ],
    },
};

export class SayoriState {
    pose: string;
    poseItems: Record<string, string[]>;
    state: Record<string, string>;

    constructor() {
        this.pose = '';
        this.poseItems = {};
        this.state = {};

        this.changePose('turned');
        // this.updateAttribute('outfit', 'uniform');
    }

    changePose(pose: 'tap' | 'turned') {
        this.pose = pose;
        this.poseItems = sayoriProperties[pose];
        this.state = {};

        Object.keys(this.poseItems).forEach((key) => {
            this.state[key] = this.poseItems[key][0];
        });

        return this;
    }
    updateAttribute(group: string, attr: string) {
        // Attr can almost never be wrong, except maybe if the images doesn't exist, but that's on the user.
        // NOTE: Maybe write validation?
        this.state[group] = attr;
    }
}