// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import path from "path";
import * as vscode from "vscode";
import fs from "fs";

export function activate(context: vscode.ExtensionContext) {

    let foundMPTInstallation = false;
    let mptInstallationPath = '';
    let rootFolder = vscode.workspace.workspaceFolders?.at(0)?.uri.fsPath;
    if (rootFolder) {
        // 0. Check if the user isn't in their project folder
        console.log("Checking if user is in project folder...");
        if (fs.existsSync(path.join(rootFolder, "game"))) {
            console.log('[TRUE] Shifting root folder to game directory.');
            rootFolder = path.join(rootFolder, "game");
        }
        // 1. Search for mod_assets
        // 2. Search for MPT folder
        console.log("Looking for mod_assets...");
        const modAssetsPath = path.join(rootFolder, "mod_assets");
        if (fs.existsSync(modAssetsPath)) {
            console.log("[FOUND!] -> " + modAssetsPath);
            console.log("Looking for MPT installation...");
            const mptPath = path.join(modAssetsPath, "MPT");
            if (fs.existsSync(mptPath)) {
                console.log("[FOUND!] -> " + mptPath);
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
    vscode.window.showInformationMessage(
        foundMPTInstallation
            ? "MPT installation found!"
            : "MPT installation not found."
    );

    
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    const disposable = vscode.commands.registerCommand(
        "vscode-mpt.helloWorld",
        () => {
            // The code you place here will be executed every time your command is executed
            // Display a message box to the user
            vscode.window.showInformationMessage("hello world");
        }
    );

    context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
