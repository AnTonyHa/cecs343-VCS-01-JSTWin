const path = require('path');
const fs = require('fs');
const repo = require('./scratch');

const create_repo = (fArray) => {
    srcDir = global.userInput[1];

    // IF '.JSTWepo' FOLDER DOESN'T EXIST, '.man' ALSO SHOULD NOT EXIST, THEREFORE
    // CREATE BOTH
    if (!fs.existsSync(path.join(srcDir, '.JSTWepo'))) {
        fs.mkdirSync(path.join(srcDir, '.JSTWepo'));
        fs.mkdirSync(path.join(srcDir, '.JSTWepo', '.man'));
    }

    // 'fileKeeper()' PARSES '{source path}' FOR ARCHIVABLE CONTENT
    // arg 1: 'fArray' will be populated with valid files
    repo.fileKeeper(srcDir, fArray);

    repo.commitFiles(fArray);

    // 'makeManifestFile()' GENERATES MANIFEST FILE AND NECESSARY ARTIFACT IDs
    repo.makeManifestFile(fArray);
}

module.exports = {
    create_repo
}