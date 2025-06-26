// cross and left/right arms are mutually exclusive, but i can handle that within
// the logic of the renderer.
const natsuki = {
    body: ['turned', 'cross'],
    faces: ['ff', 'fs', 'fta'],
    left: ['lup', 'ldown'],
    right: ['rup', 'rdown'],
    eyes: {
        ff: [
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
        fs: ['e1', 'e2', 'e3', 'e4', 'e5', 'e6'],
    },
    mouth: {
        ff: [
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
        fs: ['m1', 'm2', 'm3', 'm4'],
    },
    eyebrows: {
        ff: [
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
        fs: ['b1', 'b2', 'b3'],
    },
    nose: {
        ff: ['n1', 'n2', 'n3', 'n4'],
        fs: ['n1', 'n2', 'n3', 'n4', 'n5'],
    },
};

class Natsuki {
    currentFace: string;
    currentBody: string;
    // poseItems: Record<string, string[]>;
    faceState: Record<string, string>;
    bodyState: Record<string, string>;
    bodyOptions: Record<string, string[]>;
    faceOptions: Record<string, string[]>;

    constructor() {
        this.currentFace = '';
        this.currentBody = '';
        // this.poseItems = {};
        this.bodyOptions = {};
        this.faceOptions = {};

        this.faceState = {};
        this.bodyState = {};
    }

    changeFace(face: 'ff' | 'fta' | 'fs') {
        if (face !== 'fta') {
            let { eyes, mouth, eyebrows, nose } = natsuki;

            this.faceOptions = {
                eyes: eyes[face],
                mouth: mouth[face],
                eyebrows: eyebrows[face],
                nose: nose[face],
            };

            Object.keys(this.faceOptions).forEach((key) => {
                this.faceState[key] = this.faceOptions[key][0];
            });
        } else {
            // FTA has no face options;
            this.faceOptions = {};
            this.faceState = {};
        }
    }

    changeBody(body: 'turned' | 'cross') {
        if (body !== 'cross') {
            let { left, right } = natsuki;
            this.bodyOptions = { left, right };

            Object.keys(this.bodyOptions).forEach((key) => {
                this.bodyState[key] = this.bodyOptions[key][0];
            });
        } else {
            // Cross has no body options.
            this.bodyOptions = {};
            this.bodyState = {};
        }
    }

    updateAttribute(
        part: 'body' | 'face',
        group: string,
        attr: string
    ) {
        if (part === 'body') {
            this.bodyState[group] = attr;
        }
        else if (part === 'face') {
            this.faceState[group] = attr;
        }
    }
}
