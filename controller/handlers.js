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
const fs = require('fs');
const repo = require('./scratch');
const { response } = require('express');
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
    dstDir = global.userInput[2];
    // 'fileKeeper()' PARSES '{source path}' FOR ARCHIVABLE CONTENT
    // arg 1: 'fArray' will be populated with valid files
    repo.fileKeeper(srcDir, fArray);

    // 'commitFiles()' COPIES VALID SOURCE FILES TO DESTINATION
    // arg 1: 'fArray' contains absolute paths to files in 'srcDir'
    repo.commitFiles(fArray);

    // 'makeManifestFile()' GENERATES MANIFEST FILE AND NECESSARY ARTIFACT IDs
    repo.makeManifestFile(fArray);
}
const create_repo = (fArray) => {
    srcDir = global.userInput[1];
    dstDir = global.userInput[2];

    // IF FOLDER FOR MANIFEST COPIES DOESN'T PREVIOUSLY EXIST, CREATE HERE
    if (!fs.existsSync(path.join(srcDir, '.man')))
        fs.mkdirSync(path.join(srcDir, '.man'));

    // IF '.JSTWepo' FOLDER DOESN'T EXIST, '.man' ALSO SHOULD NOT EXIST, THEREFORE
    // CREATE BOTH
    if (!fs.existsSync(path.join(dstDir, '.JSTWepo'))) {
        fs.mkdirSync(path.join(dstDir, '.JSTWepo'));
        fs.mkdirSync(path.join(dstDir, '.JSTWepo', '.man'));
    }

    // 'fileKeeper()' PARSES '{source path}' FOR ARCHIVABLE CONTENT
    // arg 1: 'fArray' will be populated with valid files
    repo.fileKeeper(srcDir, fArray);

    // 'commitFiles()' COPIES VALID SOURCE FILES TO DESTINATION
    // arg 1: 'fArray' contains absolute paths to files in 'srcDir'
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
    try {
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
                // push file name
                logResults.push(path.basename(mPath, ".rc"));
                // push a new line
                logResults.push("-------------------------------------------------------");
            }
            // logResults now contains all the info of manifests in a form of 
            // [dataTime(N), man-N, \n, dateTime(N-1), man-N(-1), \n, ..., dataTime(1), man-1, \n]
            return logResults;
        } else {
            console.log('Error! No JSTWepo, use create-repo command.');
        }
    } catch (err) {
        console.error(err);
    }
}

module.exports = {
    create_repo,
    log,
    update,
    boolUpdate
}