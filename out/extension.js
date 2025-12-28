"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.activate = activate;
exports.deactivate = deactivate;
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const path_1 = __importDefault(require("path"));
const vscode = __importStar(require("vscode"));
const fs_1 = __importDefault(require("fs"));
const SayoriPreview_1 = require("./panels/SayoriPreview");
const NatsukiPreview_1 = require("./panels/NatsukiPreview");
function activate(context) {
    let foundMPTInstallation = false;
    let mptInstallationPath = '';
    let rootFolder = vscode.workspace.workspaceFolders?.at(0)?.uri.fsPath;
    if (rootFolder) {
        // 0. Check if the user isn't in their project folder
        console.log('Checking if user is in project folder...');
        if (fs_1.default.existsSync(path_1.default.join(rootFolder, 'game'))) {
            console.log('[TRUE] Shifting root folder to game directory.');
            rootFolder = path_1.default.join(rootFolder, 'game');
        }
        // 1. Search for mod_assets
        // 2. Search for MPT folder
        console.log('Looking for mod_assets...');
        const modAssetsPath = path_1.default.join(rootFolder, 'mod_assets');
        if (fs_1.default.existsSync(modAssetsPath)) {
            console.log('[FOUND!] -> ' + modAssetsPath);
            console.log('Looking for MPT installation...');
            const mptPath = path_1.default.join(modAssetsPath, 'MPT');
            if (fs_1.default.existsSync(mptPath)) {
                console.log('[FOUND!] -> ' + mptPath);
                foundMPTInstallation = true;
                mptInstallationPath = mptPath;
            }
        }
    }
    // 3. Update MPT path
    const config = vscode.workspace.getConfiguration('vscode-mpt');
    if (foundMPTInstallation && mptInstallationPath) {
        config.update('workingMPTPath', mptInstallationPath);
    }
    // 4. Notify user that we've found their installation (or not.)
    vscode.window.showInformationMessage(foundMPTInstallation
        ? 'MPT installation found!'
        : 'MPT installation not found.');
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    const sayori = vscode.commands.registerCommand('vscode-mpt.preview-sayori', () => SayoriPreview_1.SayoriPreview.render(context));
    const natsuki = vscode.commands.registerCommand('vscode-mpt.preview-natsuki', () => NatsukiPreview_1.NatsukiPreview.render(context));
    context.subscriptions.push(sayori);
    context.subscriptions.push(natsuki);
}
// This method is called when your extension is deactivated
function deactivate() { }
//# sourceMappingURL=extension.js.map