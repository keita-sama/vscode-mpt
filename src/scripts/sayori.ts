
// ! TODO: IF I GET TO THAT POINT, IMPLEMENT CUSTOM OUTFITS VIA 
// CONFIG and OBJECT MERGING

const sayori: Object = {
    tap: {
        outfit: ['uniform', 'casual'],
        blush: ['nobl', 'awkw', 'blus', 'blaw'],
        mouth: ['m1', 'm2', 'm3', 'm4'],
        eyes: ['e1', 'e2', 'e3', 'e4', 'e5', 'e6'],
        eyebrows: ['b1', 'b2', 'b3']
    },
    turned: {
        outfit: ['uniform', 'casual'],
        left: ['lup', 'ldown']
    }
};

class Sayori {
    pose?: Object;
    state?: Object;

    constructor() {
        this.pose;
        this.state;
    }
    changePose(pose: string)  {

    }
}