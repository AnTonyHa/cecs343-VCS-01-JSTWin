const path = require('path');
const fs = require('fs');
const repo = require('./scratch');

const create_repo = (fArray) => {
    srcDir = global.userInput[1];
    dstDir = global.userInput[2];

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
            while (fs.existsSync(manPath)) {
                manArray.push(manPath);
                manFileNum++;
                manFile = '.man-' + manFileNum + '.rc';
                manPath = path.join(repoPath, '.man', manFile);
            }         
            // Output Manifest contents from most current to oldest
            while (manArray.length != 0) {
                let bigString = fs.readFileSync(manArray.pop(), 'utf-8');
                console.log(bigString);
                logResults.push(bigString);
            }
            return logResults;
        } else {
            console.log('Error! No JSTWepo, use create command.');
        }
    } catch (err) {
        console.error(err);
    }
}

module.exports = {
    create_repo,
    log
}