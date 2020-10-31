/**
 * Team members: 
 * Jacob Azevedo Jr. - jacobazevedojr@gmail.com
 * Stephanie Lim - hynglim@gmail.com
 * Tony Ha - tony.ha@student.csulb.edu
 * William Duong - wxduong@gmail.com
 * 
 * Program Description: Implementation files for JSTWepo functions. 
 */

const path = require('path');
const fs = require('fs-extra');
const repo = require('./scratch');
const readline = require('readline');
const { maroon } = require('color-name');
const { realpath } = require('fs');

// returns whether the repo can update the repo or not with the given repo path
const boolUpdate = () => {
    dstDir = global.userInput[2];
    if (!fs.existsSync(path.join(dstDir, '.JSTWepo'))) {
        return false;
    }
    return true;
}
// updates the repository with a new snapshot
const update = (fArray) => {
    srcDir = global.userInput[1];

    // 'fileKeeper()' PARSES '{source path}' FOR ARCHIVABLE CONTENT
    // arg 1: 'fArray' will be populated with valid files
    repo.fileKeeper(srcDir, fArray);

    // check for only NEW files in source that are NOT already in repo
    let keptArray = repo.crossReference(fArray);

    // if no new files, skip copy process
    if (keptArray.size != 0)
        repo.commitFiles(keptArray);

    // new manifest file always generated, even if no new files added to repo
    repo.makeManifestFile(fArray);
}

const check_out = () => {
    let pathToMan = path.join(global.userInput[1], '.JSTWepo', '.man', global.userInput[3]);
    // CREATE INTERFACE TO READ FILE LINE BY LINE USING 'readStream' CLASS
    let readAPI = readline.createInterface({
        input: fs.createReadStream(pathToMan)
    });

    let fileMap = new Map();
    var lineCount = 1;

    // 'readAPI' EMITS 'line' SIGNAL EVERY TIME A NEW LINE CHARACTER PRESENT, I.E.
    // HAPPENS ONCE THE INTERFACE FINISHES CONSUMING ONE LINE. ON 'emit' SIGNAL, 
    // RESPONSE = SPLIT LINE INTO ART-ID AND PATH TO FILE, THEN ADD TO 'fileMap'
    readAPI.on('line', line => {
        // SKIP HEADER INFO OF '.man' FILE
        if (lineCount > 3 && line.length != 0) {
            let contents = line.split('@');

            // ADD NEW ENTRY TO 'fileMap' WHERE:
            // 'key'   = artifact-ID (first half of line read)
            // 'value' = relative path of file (second half of line read)
            fileMap.set(contents[0].trim(), contents[1].trim());
        }

        lineCount++;
    }).on('close', () => { // 'close' signal emitted once 'readAPI' reaches end of file
        repo.recreator(fileMap);
    });
}

const create_repo = (fArray) => {
    srcDir = global.userInput[1];
    dstDir = global.userInput[2];
    
    // IF FOLDER FOR MANIFEST COPIES DOESN'T PREVIOUSLY EXIST, CREATE HERE
    fs.ensureDirSync(path.join(srcDir, '.man'));

    // IF '.JSTWepo' FOLDER DOESN'T EXIST, '.man' ALSO SHOULD NOT EXIST, THEREFORE
    // CREATE BOTH
    fs.ensureDirSync(path.join(dstDir, '.JSTWepo', '.man'));

    // 'fileKeeper()' PARSES '{source path}' FOR ARCHIVABLE CONTENT
    // arg 1: 'srcDir': path to root of project tree to be archived
    // arg 2: 'fArray': hash-map with key = artifactID and value = abs. path to saved file
    repo.fileKeeper(srcDir, fArray);

    // 'commitFiles()' COPIES VALID SOURCE FILES TO DESTINATION
    // arg 1: 'fArray': hash-map with key = artifactID and value = abs. path to saved file
    repo.commitFiles(fArray);

    // 'makeManifestFile()' GENERATES MANIFEST FILE AND NECESSARY ARTIFACT IDs
    repo.makeManifestFile(fArray);   
}

/**
 * This function outputs the date and the manifest files from the newest to oldest
 * @returns an array of file paths
 */
const log = () => {
    let logResults = [];
    let absPath = global.userInput[1];
    // Map of Key:manFileName Value:string of labels
    let manMap = repo.getManifestMap(absPath);
    try {
        console.log('Absolute path: ' + absPath);
        let repoPath = path.join(absPath, '.JSTWepo');
        // Fail-safe: Check if .JSTWepo existed
        if (fs.existsSync(repoPath)) {
            let manArray = [];
            let manFileNum = 1;
            let manFile = '.man-' + manFileNum + '.rc';
            let manPath = path.join(repoPath, '.man', manFile);
            // Push manifest path into manArray. Is it possible to store only the relative path?
            while (fs.existsSync(manPath)) {
                manArray.push(manPath);
                manFileNum++;
                manFile = '.man-' + manFileNum + '.rc';
                manPath = path.join(repoPath, '.man', manFile);
            }         
            // Output Manifest contents from most current to oldest
            while (manArray.length != 0) {
                /* This part is left for the purpose of making a commit where log needs to access the file
                 * to find the commit and output it */
                // bigString store contents inside the manifest file into a single string
                // let bigString = fs.readFileSync(manArray.pop(), 'utf-8');
                //////////////////////////////////////////////////////////////////////////////////////////
                let mPath = manArray.pop();
                // TODO push file created date
                let manDateTime = fs.statSync(mPath).birthtime.toDateString() + ", " + 
                    fs.statSync(mPath).birthtime.toTimeString();
                logResults.push(manDateTime);
                // push labels
                logResults.push(manMap.get(path.basename(mPath, ".rc") + '.rc'));
                // push a new line
                logResults.push("-------------------------------------------------------");
            }
            // logResults now contains all the info of manifests in a form of 
            // [dataTime(N), man-N, \n, dateTime(N-1), man-N(-1), \n, ..., dataTime(1), man-1, \n]
            return logResults;
        } else {
            console.log('Error! No JSTWepo, use create command.');
        }
    } catch (err) {
        console.error(err);
    }
}

/**
 * Create and write to .labels a new and unique label associates with an existed manifest file.
 * @param {String} labelsMap Map of labels
 */
const createLabel = (labelsMap) => {
    // user input arguments: 1 = JSTWepo's path, 2 = manifest file name or "existed label", 3 = "new label"
    // Assume user will always create a UNIQUE label that is no longer than 20 characters included space
    // Assume user knows exactly the JSTWepo's folder path
    let newLabel = '';
    let targetManifest = '';
    let newLabelIndex = 3;
    // Step 1: Check if user's input of index 2 is a manifest or a label
    if (global.userInput[2].startsWith('"')) {
        // Grab existed label wrapped in double quotes
        let existedLabel = repo.constructInputLabel(2);
        // Check if the label of second argument existed in labelsMap 
        if (labelsMap.has(existedLabel)) {
            targetManifest = labelsMap.get(existedLabel);
        } else {
            // FAIL case: targetManifest is empty
            console.log('Label "' + existedLabel + '" does not exist.');
        }
    } else {
        // Default case: user specified manifest file name
        targetManifest = userInput[2];
    }

    // Step 2: Acquire new label
    // Iterate to look for new at index 3 or index n < userInput.length
    while (!userInput[newLabelIndex].startsWith('"')) {newLabelIndex++};
    newLabel = repo.constructInputLabel(newLabelIndex);
    
    // Step 3: Write new label into .labels
    let manifestPath = path.join(global.userInput[1], '.JSTWepo', '.man', targetManifest);
    // Ensure user specified manifest is an existed manifest
    if (fs.existsSync(manifestPath)) {
        // labelsMap.set(newLabel, targetManifest);
        // This do 2 things: 1. If .labels is not exist then make a .labels and write the line
        // 2. If .labels existed then append new line
        try {
            fs.appendFileSync(path.join(global.userInput[1], '.JSTWepo', '.labels'), newLabel.trim() + ' ' + targetManifest.trim() + '\n');
        } catch (err) {
            console.error(err.message);
        }
    } else {
        console.log('The Manifest file does not exist. No label created!');
    }
}

/**
 * Generate a map contains pairs of value = manifest as key = value
 * @param {String} usrRepoPath JSTWepo's file path
 */
const generateLabelsMap = (usrRepoPath) => {
    result = new Map();
    let labelsPath = path.join(usrRepoPath, '.JSTWepo', '.labels.txt');
    let readLabels = fs.readFileSync(labelsPath, 'utf-8').split('\n');
    for (i = 0; i < readLabels.length - 1; i++) {
        let labelManifest = readLabels[i].split(' ');
        result.set(labelManifest[0].trim(), labelManifest[1].trim());
    }
    return result;
}

module.exports = {
    create_repo,
    log,
    boolUpdate,
    update,
    check_out,
    createLabel,
    generateLabelsMap
}