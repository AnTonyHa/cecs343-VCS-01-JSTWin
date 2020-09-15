const path = require('path');
const fs = require('fs');

// NEED THIS IMPORT FOR THE STRING COMMAND SENT BY USER
const router = require('./routes');

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

const makeManifestFile = (fileArray) => {
    // FORMAT FOR MANIFEST FILES: .manifest-{iteration}.rc
    var iteration = 1;
    // NODE SERVER SEARCHES FOR '.git/.man' DIRECTORY AND COLLECTS ALL FILES INTO 'manDir' ARRAY
    let manDir = fs.readdirSync(path.join(router.userCMD[1], '.git', '.man'));

    let timestamp = new Date();
    let manifestHeader = `"${router.userCMD}"\n${timestamp.toDateString()} @ ${timestamp.toTimeString()}\n\n`;

    // FOR EACH FILE OBJECT IN 'manDir' ARRAY THAT IS ACTUALLY A MANIFEST FILE, INCREMENT 'iteration'
    manDir.forEach((file) => {
        if (file.toString().includes('.manifest') && path.extname(file) == '.rc')
            iteration++;
    })

    let manifestFile = `${router.userCMD[1]}\\.git\\.man\\.manifest-${iteration}.rc`;
    fs.writeFileSync(manifestFile, manifestHeader);

    fileArray.forEach((file) => {
        let relPath = absolute2Relative(router.userCMD[1], file);
        let artID = getArtifactID(router.userCMD[1], file);

        fs.appendFileSync(manifestFile, `${artID} @ ${relPath}\n`);
    });
}

const consoleEcho = (userCMD) => {
    console.log('User input > ' + userCMD);
}

const rootDir = path.dirname(process.mainModule.filename);

// BUNDLE ALL MISC FUNCTIONS INTO ARRAY AND EXPORT
module.exports = {
    fileKeeper,
    getChecksumFromString, 
    consoleEcho,
    rootDir,
    getArtifactID,
    makeManifestFile
};