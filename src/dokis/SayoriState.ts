// // TODO: Remove this the next pdate if refactor goes well.

// import sayoriProperties from '../data/sayori.json';

// export class SayoriState {
//     pose: string;
//     poseItems: Record<string, string[]>;
//     state: Record<string, string>;
//     stateIndex: Record<string, number>;
//     poses: string[];

//     constructor() {
//         // NOTE: Not sure if i ever need to change this.
//         this.poses = ['tap', 'turned'];
//         this.pose = '';
//         this.poseItems = {};
//         this.state = {};
//         this.stateIndex = {};

//         this.changePose('turned');
//     }

//     changePose(pose: 'tap' | 'turned') {
//         this.pose = pose;
//         this.poseItems = sayoriProperties[pose];
//         this.state = {};

//         Object.keys(this.poseItems).forEach((group) => {
//             this.stateIndex[group] = 0;

//             this.updateState(group);
//         });
//     }
//     // NOTE: Deprecating this!
//     updateAttribute(group: string, attr: string) {
//         // Attr can almost never be wrong, except maybe if the images doesn't exist, but that's on the user.
//         // NOTE: Maybe write validation?
//         this.state[group] = attr;
//     }

//     // Pagination functionality
//     cycleNextAttribute(group: string) {
//         const groupIndex = this.stateIndex[group];
//         const assetLength = this.poseItems[group].length;

//         if (groupIndex !== assetLength) {
//             this.stateIndex[group]++;
//         }
//         this.updateState(group);
//     }
//     cyclePrevAttribute(group: string) {
//         const groupIndex = this.stateIndex[group];

//         if (groupIndex !== 0) {
//             this.stateIndex[group]--;
//         }

//         this.updateState(group);
//     }
//     updateState(group: string) {
//         this.state[group] = this.poseItems[group][this.stateIndex[group]];
//     }
// }
