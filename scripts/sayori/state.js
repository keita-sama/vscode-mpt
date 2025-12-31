/*
    NOTE: 'extensionUri' is defined in the script of the panel.
*/


const sayoriProperties = await fetch(`${extensionUri}/data/sayori.json`).then((res) => res.json());

export class SayoriState {
    constructor() {
        // NOTE: Not sure if i ever need to change this.
        this.poses = ['turned', 'tap'];
        this.pose = '';
        this.poseItems = {};
        this.state = {};
        this.stateIndex = {};

        this.changePose('turned');
    }

    changePose(pose) {
        this.pose = pose;
        this.poseItems = sayoriProperties[pose];
        this.state = {};

        Object.keys(this.poseItems).forEach((group) => {
            const outfit = this.stateIndex.outfit;

            this.stateIndex[group] = 0;
            
            if (outfit) {
                this.stateIndex.outfit = outfit;
            }

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

        return (this.stateIndex[group] === assetLength);
    }
    cyclePrevAttribute(group) {
        const groupIndex = this.stateIndex[group];

        if (groupIndex !== 0) {
            this.stateIndex[group]--;
        }

        this.updateGroup(group);

        return (this.stateIndex[group] === 0);
    }
    updateGroup(group) {
        this.state[group] = this.poseItems[group][this.stateIndex[group]];
    }
    getAttribute(group) {
        return this.state[group];
    }
}
