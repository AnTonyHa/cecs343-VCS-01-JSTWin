const path = require('path');
const fs = require('fs');

// GENERATES RELATIVE PATH TO A GIVEN FILE USING ITS ABSOLUTE PATH
// arg 1: absolute path to root folder of source
// arg 2: absolute path to file of interest
const absolute2Relative = (srcPath, fileName) => {
    let pathArray = srcPath.split('\\');
    let rootWord = pathArray[pathArray.length - 1];

    // EDGE CASE: IF ANY SUBFOLDERS SHARE THE SAME NAME AS ROOT-FOLDER.
    // WE ONLY WANT TO SPLIT AT ROOT FOLDER
    fileName = fileName.replace(rootWord, 'DELIMITER');

    let nameArray = fileName.split('DELIMITER');
    let relPath = rootWord + nameArray[1].replace(/\\/g, '/');

    return relPath;
}

// GENERATES _ONLY_ ROUTE TO A GIVEN FILE (I.E. FILE NAME EXCLUDED)
const pathIsolator = (relPath) => {
    let pathName = relPath.split('/');
    pathName.pop();

    return pathName.join('/') + '/';
}

// POPULATES 'fileArray' WITH VALID, ARCHIVABLE FILES
const fileKeeper = (srcDir, fileArray) => {
    // NODE SERVER READS THROUGH ALL OBJECTS OF SOURCE FOLDER INTO 'contents' ARRAY
    let contents = fs.readdirSync(srcDir);

    // FOR EACH OBJECT IN SOURCE FOLDER:
    // DECIDE IF OBJECT IS FILE OR FOLDER
    //   (1) IF FOLDER, RECURSIVELY CALL 'fileKeeper' TO GO ONE LEVEL DEEPER
    //   (2) IF FILE, PUSH OBJECT INTO 'fileArray' (ABSOLUTE PATH)
    contents.forEach((object) => {
        // NODEJS DOES NOT SAVE PATH TO 'contents' ARRAY, SO WE NEED TO 
        // APPEND THE PATH MANUALLY EACH TIME
        let newPath = path.join(srcDir, object);

        if (fs.statSync(newPath).isFile() && object.toString().charAt(0) != '.')
            fileArray.push(newPath);
        else if (fs.statSync(newPath).isDirectory())
            fileKeeper(newPath, fileArray)
    });
}

// GENERATES CHECKSUM FROM A GIVEN STRING PER PROJECT REQUIREMENT
// - uses ring-counter to iteratively progress through array of weights
// - modulo operation on final checksum to limit to 4 significant figures
const getChecksumFromString = (sumString) => {
    let weights = [1, 3, 7, 11];
    var checkSum = 0, index = 0;

    for (i = 0; i < sumString.length; i++) 
    {
        checkSum += sumString.charCodeAt(i) * weights[index];

        // ITERATE THROUGH RING-COUNTER
        index++;
        index %= weights.length;
    }

    return (checkSum % 10000);
}

const getArtifactID = (srcDir, srcFile) => {
    // 1. GET CHECKSUM USING CONTENTS OF FILE
    let a = ( () => {
        let bigString = fs.readFileSync(srcFile, 'utf-8');
        return getChecksumFromString (bigString);
    }) ();

    // 2. GET CHECKSUM USING FILE SIZE
    let b = fs.statSync(srcFile).size % 10000;

    // 3. ISOLATE FILE DIRECTORY, GET CHECKSUM USING THIS RELATIVE PATH
    let c = ( () => {
        let pathName = pathIsolator(absolute2Relative(srcDir, srcFile));
        return getChecksumFromString(pathName);
    }) ();

    let extension = path.extname(srcFile);

    return `P${a}-L${b}-C${c}${extension}`;
}

const commitFiles = (fileArray) => {
    // GET USER INPUT FROM BROWSER/'CLI'
    let userCMD = global.userInput;
    // directory of the new file
    let newDir = '.JSTWepo';

    fileArray.forEach((pathToFile) => {
        const pathToNewDestination = path.join(userCMD[1], newDir, getArtifactID(userCMD[1], pathToFile));

        fs.copyFileSync(pathToFile, pathToNewDestination);
    });
}

const makeManifestFile = (fileArray) => {
    let userCMD = global.userInput;
    // FORMAT FOR MANIFEST FILES: .manifest-{iteration}.rc
    var iteration = 1;
    // NODE SERVER SEARCHES FOR '.git/.man' DIRECTORY AND COLLECTS ALL FILES INTO 'manDir' ARRAY
    let manDir = fs.readdirSync(path.join(userCMD[1], '.JSTWepo', '.man'));

    let timestamp = new Date();
    let manifestHeader = `"${userCMD}"\n${timestamp.toDateString()} @ ${timestamp.toTimeString()}\n\n`;

    // SINCE 'manDir' WILL _ONLY_ CONSIST OF MANIFEST FILES, INCREMENT 'iteration' BY
    // COUNT OF MANIFEST FILES
    iteration += manDir.length;

    let manifestFile = path.join(userCMD[1], '.JSTWepo', '.man', `.man-${iteration}.rc`);

    fileArray.forEach((file) => {
        let relPath = absolute2Relative(userCMD[1], file);
        let artID = getArtifactID(userCMD[1], file);

        fs.appendFileSync(manifestFile, `${artID} @ ${relPath}\n`);
    });
}

const consoleEcho = (userCMD) => {
    console.log('User input > ' + userCMD);
}

const rootDir = path.dirname(process.mainModule.filename);

const log = (absPath) => {
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
                console.log(fs.readFileSync(manArray.pop(), 'utf-8'));
            }
        } else {
            console.log('Error! No JSTWepo, use create-repo command.');
        }
    } catch (err) {
        console.error(err);
    }
}

// BUNDLE ALL MISC FUNCTIONS INTO ARRAY AND EXPORT
module.exports = {
    fileKeeper,
    getChecksumFromString, 
    consoleEcho,
    rootDir,
    getArtifactID,
    commitFiles,
    makeManifestFile,
    log,
    commitFiles
};