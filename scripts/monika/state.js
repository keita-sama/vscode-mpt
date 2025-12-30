/*
    NOTE: 'extensionUri' is defined in the script of the panel.
*/

const monikaProperties = await fetch(`${extensionUri}/data/monika.json`).then((res) => res.json());

export class MonikaState {
    constructor() {
        // NOTE: Not sure if i ever need to change this.
        this.poses = ['forward', 'lean'];
        this.pose = '';
        this.poseItems = {};
        this.state = {};
        this.stateIndex = {};

        this.changePose('forward');
    }

    changePose(pose) {
        this.pose = pose;
        this.poseItems = monikaProperties[pose];
        this.state = {};

        Object.keys(this.poseItems).forEach((group) => {
            this.stateIndex[group] = 0;

            this.updateGroup(group);
        });
    }
    cycleNextAttribute(group) {
        const groupIndex = this.stateIndex[group];
        const assetLength = this.poseItems[group].length - 1;

        if (groupIndex !== assetLength) {
            this.stateIndex[group]++;
        }
        this.updateGroup(group);

        return this.stateIndex[group] === assetLength;
    }
    cyclePrevAttribute(group) {
        const groupIndex = this.stateIndex[group];

        if (groupIndex !== 0) {
            this.stateIndex[group]--;
        }

        this.updateGroup(group);

        return this.stateIndex[group] === 0;
    }
    updateGroup(group) {
        this.state[group] = this.poseItems[group][this.stateIndex[group]];
    }
    getAttribute(group) {
        return this.state[group];
    }
}
