const path = require('path');
const fs = require('fs');
const repo = require('./scratch');

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

module.exports = {
    create_repo
}