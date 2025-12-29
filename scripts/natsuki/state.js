/*
    NOTE: 'extentionUri' is defined in the script of the panel.
*/

const natsukiProperties = await fetch(`${extensionUri}/data/natsuki.json`).then((res) => res.json());

export class NatsukiState {
    constructor() {
        this.faces = ['ff', 'fs', 'fta'];
        this.poses = ['turned', 'cross'];

        this.pose = '';
        this.poseItems = {};
        this.poseState = {};
        this.poseStateIndex = {};

        this.face = '';
        this.faceItems = {};
        this.faceState = {};
        this.faceStateIndex = {};

        this.changeFace('ff');
        this.changePose('turned');
    }

    changePose(pose) {
        this.pose = pose;
        this.poseItems = natsukiProperties[pose];
        this.poseState = {};

        Object.keys(this.poseItems).forEach((group) => {
            this.poseStateIndex[group] = 0;

            this.updatePoseGroup(group);
        });
    }

    cycleNextPoseAttribute(group) {
        const groupIndex = this.poseStateIndex[group];
        const assetLength = this.poseItems[group].length - 1;
        const isEnd = groupIndex === assetLength;

        if (!isEnd) {
            this.poseStateIndex[group]++;
        }
        this.updatePoseGroup(group);

        return (this.poseStateIndex[group] === assetLength);
    }

    cyclePrevPoseAttribute(group) {
        const groupIndex = this.poseStateIndex[group];

        if (this.poseStateIndex[group] !== 0) {
            this.poseStateIndex[group]--;
        }

        this.updatePoseGroup(group);

        return (this.poseStateIndex[group] === 0);
    }

    updatePoseGroup(group) {
        this.poseState[group] = this.poseItems[group][this.poseStateIndex[group]];
    }

    getPoseAttribute(group) {
        return this.poseState[group];
    }

    changeFace(face) {
        this.face = face;
        this.faceItems = natsukiProperties['faces'][face];
        this.faceState = {};

        console.log(this.faceItems);

        Object.keys(this.faceItems).forEach((group) => {
            this.faceStateIndex[group] = 0;

            this.updateFaceGroup(group);
        });
    }

    cycleNextFaceAttribute(group) {
        const groupIndex = this.faceStateIndex[group];
        const assetLength = this.faceItems[group].length - 1;

        if (groupIndex !== assetLength) {
            this.faceStateIndex[group]++;
        }
        this.updateFaceGroup(group);

        return (this.faceStateIndex[group] === assetLength);
    }

    cyclePrevFaceAttribute(group) {
        const groupIndex = this.faceStateIndex[group];

        if (groupIndex !== 0) {
            this.faceStateIndex[group]--;
        }

        this.updateFaceGroup(group);

        return (this.faceStateIndex[group] === 0);
    }

    updateFaceGroup(group) {
        this.faceState[group] = this.faceItems[group][this.faceStateIndex[group]];
    }

    getFaceAttribute(group) {
        return this.faceState[group];
    }
}
