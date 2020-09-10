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

// POPULATES TWO ARRAYS: 1) VALID FILES TO ARCHIVE, 2) IGNORED FILES
const fileKeeper = (srcDir, fileArray, ignore) => {
  let contents = fs.readdirSync(srcDir);

  contents.forEach((object) => {
    // let newPath = srcDir + '\\' + object;
    let newPath = path.join(srcDir, object);

    if (fs.statSync(newPath).isFile() && object.toString().charAt(0) != '.')
      fileArray.push(newPath);
    else if (fs.statSync(newPath).isDirectory())
      fileKeeper(newPath, fileArray, ignore)
    else
      ignore.push(newPath);
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
    getArtifactID
};