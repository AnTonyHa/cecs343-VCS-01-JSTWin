/**
 * Team members: 
 * Jacob Azevedo Jr. - jacobazevedojr@gmail.com
 * Stephanie Lim - hynglim@gmail.com
 * Tony Ha - tony.ha@student.csulb.edu
 * William Duong - wxduong@gmail.com
 * 
 * Program Description: Helper functions for JSTWepo's handlers. 
 */

const path = require('path');
const fs = require('fs-extra');

// GENERATES RELATIVE PATH TO A GIVEN FILE USING ITS ABSOLUTE PATH
// arg 1: absolute path to root folder of source
// arg 2: absolute path to file of interest
const absolute2Relative = (srcPath, fileName) => {
    let pathArray = srcPath.split(path.sep);
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
const fileKeeper = (parentDir, fileArray) => {
    // NODE SERVER READS THROUGH ALL OBJECTS OF SOURCE FOLDER INTO 'contents' ARRAY
    let contents = fs.readdirSync(parentDir);

    // FOR EACH OBJECT IN SOURCE FOLDER:
    // DECIDE IF OBJECT IS FILE OR FOLDER
    //   (1) IF FOLDER, RECURSIVELY CALL 'fileKeeper' TO GO ONE LEVEL DEEPER
    //   (2) IF FILE, PUSH OBJECT INTO 'fileArray' (ABSOLUTE PATH)
    contents.forEach((object) => {
        // NODEJS DOES NOT SAVE PATH TO 'contents' ARRAY, SO WE NEED TO 
        // APPEND THE PATH MANUALLY EACH TIME
        let value = path.join(parentDir, object);

        // IF FILE IS ARCHIVABLE, GENERATE ARTIFACT ID HERE AND USE AS KEY, ALONG
        // WITH ABSOLUTE PATH AS VALUE BEFORE INSERTING INTO HASHMAP
        if (fs.statSync(value).isFile() && object.toString().charAt(0) != '.')
        {
            let key = getArtifactID(global.userInput[1], value);
            fileArray.set(key, value);
        }        
        else if (fs.statSync(value).isDirectory() && object.charAt(0) != '.')
            fileKeeper(value, fileArray)
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
    // GET PATH TO SOURCE | DESTINATION FROM BROWSER/'CLI USER INPUT'
    let dstDir = global.userInput[2]; // destination of the respository to be copied in
    
    // directory of the new file
    let newDir = '.JSTWepo';

    fileArray.forEach( (pathToFile, artID) => {
        const pathToNewDestination = path.join(dstDir, newDir, artID);
        fs.copyFileSync(pathToFile, pathToNewDestination);
    });
}

const makeManifestFile = (fileArray) => {
    let userCMD = global.userInput;
    // FORMAT FOR MANIFEST FILES: .manifest-{iteration}.rc
    var iteration = 1;
    // NODE SERVER SEARCHES FOR '.git/.man' DIRECTORY AND COLLECTS ALL FILES INTO 'manDir' ARRAY
    let manDir = fs.readdirSync(path.join(userCMD[2], '.JSTWepo', '.man'));

    let timestamp = new Date();
    let manifestHeader = `"${userCMD}"\n${timestamp.toDateString()} @ ${timestamp.toTimeString()}\n\n`;

    // SINCE 'manDir' WILL _ONLY_ CONSIST OF MANIFEST FILES, INCREMENT 'iteration' BY
    // COUNT OF MANIFEST FILES
    iteration += manDir.length;

    let manifestFile = path.join (userCMD[2], '.JSTWepo', '.man', `.man-${iteration}.rc`);
    fs.writeFileSync(manifestFile, manifestHeader);

    fileArray.forEach( (pathToFile, artID) => {
        let relPath = absolute2Relative(userCMD[1], pathToFile);

        fs.appendFileSync(manifestFile, `${artID} @ ${relPath}\n`);
    });

    // A COPY OF NEW MANIFEST FILE IS GENERATED IN SOURCE FOLDER
    // should this be specific to 'create' command only (???)
    manDir = fs.readdirSync(path.join(global.userInput[1], '.man'));
    iteration = manDir.length + 1;
    let copiedMan = path.join(global.userInput[1], '.man', `.man-${iteration}.rc`);
    fs.copyFile(manifestFile, copiedMan, (err) => {
        if (err)
            throw err;
    })
}

/**
 * This function examines contents of the current source directory against an 
 * array of files in the repo. If any artifact-IDs exist in the hashmap 'fileArray'
 * that doesn't exist in the array 'contents', this is a new file that should be 
 * copied over to the repo and will be added to 'keptArray' to be returned.
 * 
 * @argument Map: hashmap representing all files from current source directory
 * @returns Map: hashmap representing only updated/new files necessary to be copied
 *          from source directory to repo
 */
const crossReference = (fileArray) => {
    // PATH TO ALL FILES WITHIN REPO
    let repoPath = path.join(global.userInput[2], '.JSTWepo');
    // READ ALL FILES/FOLDERS INTO 'contents' ARRAY
    // NOTE: all files within repo folder are kept in artifactID form
    let contents = fs.readdirSync(repoPath);

    // 'keptArray' WILL BE RETURNED TO 'commitFiles' FUNCTION, CONTENTS WILL
    // ONLY HOLD NEW FILES WITHIN SOURCE THAT ARE _NOT_ ALREADY IN REPO
    let keptArray = new Map();
    fileArray.forEach( (pathToFile, artID) => {
        if (!contents.includes(artID))
            keptArray.set(artID, pathToFile);
    })

    return keptArray;
}

/**
 * This function iteratively copies over all relevant files of a
 * snapshot (as defined by a given '.man' file) -- which are kept as key:value
 * pairs in the hashmap parameter 'fileMap'. For each mapping, 'artID' represents
 * the source file from the repo and 'relPath' becomes the destination path
 * to the new project tree.
 * 
 * @argument Map: hashmap representing relevant files listed in a given '.man' file
 * @returns none
 */
const recreator = (fileMap) => {
    // GET PATH TO SOURCE | DESTINATION FROM BROWSER/'CLI USER INPUT'
    let repoPath = path.join(global.userInput[1], '.JSTWepo');
    let destination = global.userInput[2];

    // FOR EVERY KEY:VALUE PAIR IN 'fileMap' COPY FROM REPO TO DESTINATION
    fileMap.forEach((relPath, artID) => {
        let sourceFile = path.join(repoPath, artID);
        let destinFile = path.join(destination, unrooterator(relPath));

        fs.copySync(sourceFile, destinFile);
    })
}

/**
 * This helper function strips off the root folder from the given parameter. This
 * is necessary because '.man' files store relative path with respect to the 
 * root folder of the original project tree
 * 
 * ex. 'dot/a/thisIsOK.csv' ==> 'a/thisIsOk.csv'
 * 
 * @returns String: relative path to file ready to be appended to new root directory
 */
const unrooterator = (relName) => {
    let array = relName.split('/'); // split into array
    array.shift(); // strip off first element of array
    return array.join('/'); // re-join and return
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
    commitFiles,
    makeManifestFile,
    crossReference,
    recreator,
    unrooterator
};
