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
            let key = (global.userInput[0] === 'merge_out') ? getArtifactID(global.userInput[2], value) : 
                                                          getArtifactID(global.userInput[1], value);
            fileArray.set(key, value);
        }        
        else if (fs.statSync(value).isDirectory() && object.charAt(0) != '.')
            fileKeeper(value, fileArray)
    });
}

const reverseMaperator = (fileMap) => {
    let reversed = new Map ();

    fileMap.forEach ( (value, key) => {
        reversed.set(value, key);
    })

    return reversed;
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
    let dstDir = (global.userInput[0] === 'merge_out') ? global.userInput[1] :
                                                     global.userInput[2]; // destination of the respository to be copied in
    
    // directory of the new file
    let newDir = '.JSTWepo';

    fileArray.forEach( (pathToFile, artID) => {
        const pathToNewDestination = path.join(dstDir, newDir, artID);
        fs.copyFileSync(pathToFile, pathToNewDestination);
    });
}

const makeManifestFile = (fileArray) => {
    let userCMD = global.userInput;
    let repoActual = (userCMD[0] === 'rebuild' || userCMD[0] === 'merge_out') ? userCMD[1] : userCMD [2];
    let srcActual  = (userCMD[0] === 'rebuild' || userCMD[0] === 'merge_out') ? userCMD[2] : userCMD [1];
    // FORMAT FOR MANIFEST FILES: .manifest-{iteration}.rc
    var iteration = 1;
    // NODE SERVER SEARCHES FOR '.git/.man' DIRECTORY AND COLLECTS ALL FILES INTO 'manDir' ARRAY
    let manDir = fs.readdirSync(path.join(repoActual, '.JSTWepo', '.man'));

    let timestamp = new Date();
    let manifestHeader = `"${userCMD}"\n${timestamp.toDateString()} @ ${timestamp.toTimeString()}\n\n`;

    // SINCE 'manDir' WILL _ONLY_ CONSIST OF MANIFEST FILES, INCREMENT 'iteration' BY
    // COUNT OF MANIFEST FILES
    iteration += manDir.length;

    let manifestFile = path.join (repoActual, '.JSTWepo', '.man', `.man-${iteration}.rc`);
    fs.writeFileSync(manifestFile, manifestHeader);

    fileArray.forEach( (pathToFile, artID) => {
        let relPath = absolute2Relative(srcActual, pathToFile);
        console.log(relPath);

        fs.appendFileSync(manifestFile, `${artID} <-> ${relPath}\n`);
    });
    
    // Appends 'man-x man-x' to the end of the .labels.txt file if it exists, otherwise
    // the file is create and initialized with 'man-x man-x'
    let labelFilePath = path.join(repoActual, '.JSTWepo', '.labels.txt');
     fs.appendFile(labelFilePath,`.man-${iteration} .man-${iteration}.rc\n`, (err) => {
         if (err) {
                throw err;
         }
     })

    // A COPY OF NEW MANIFEST FILE IS GENERATED IN SOURCE FOLDER
    // should this be specific to 'create' command only (???)
    if (userCMD[0] === 'create')
    {
        manDir = fs.readdirSync(path.join(srcActual, '.man'));
        iteration = manDir.length + 1;
        let copiedMan = path.join(srcActual, '.man', `.man-${iteration}.rc`);
        fs.copyFile(manifestFile, copiedMan, (err) => {
            if (err)
                throw err;
        })
    }
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
    let repoPath = (global.userInput[0] === 'merge_out') ? path.join(global.userInput[1], '.JSTWepo') :
                                                       path.join(global.userInput[2], '.JSTWepo');
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

        // REASSIGN ABSOLUTE PATH RELATIVE TO NEW DESTINATION FOLDER,
        // NECESSARY WHEN CALLING 'makeManifestFile' AFTER 'recreator' IS FINISHED
        fileMap.set(artID, destinFile);
    })
}

const merge_out = (incomingMap) => {
    let srcDir = path.join(global.userInput[1], '.JSTWepo'); // location of repo
    let dstDir = global.userInput[2]; // current project tree folder
    let outgoingMap = new Map();

    // POPULATE 'outgoingMap' AND CHECK IN CURRENT STATE OF PROJECT TREE
    ////////////////////////////////////////////////////////////////////
    fileKeeper(dstDir, outgoingMap);

    let keptArray = crossReference(outgoingMap);

    if (keptArray.size != 0)
        commitFiles(keptArray);

    makeManifestFile(outgoingMap);
    ////////////////////////////////////////////////////////////////////

    // HASHMAP OF CURRENT FILES IN TARGET DIRECTORY
    // IMPORTANT (!!): THIS IS REVERSED FROM NORMAL FILE MAP -- SAME ALSO APPLIES TO 'incomingMap'
    // 'key'   = absolute path of file
    // 'value' = artifact-ID
    let reversedOutMap = reverseMaperator(outgoingMap);
    let mergePending = new Map();

    incomingMap.forEach( (value, key) =>{
        // 'incomingMap' KEEPS ONLY RELATIVE-FILE PATHS, MUST APPEND TO GET ABSOLUTE PATH
        let destinFile = path.join(dstDir, unrooterator(key));
        let sourceFile = path.join(srcDir, value);

        // (**) CHECK ONLY FIRST 2 PARTS OF 'artifact-ID', THIRD PART WILL ALWAYS FAIL
        let artID1 = value.split('-');
        let contentSUM1 = artID1[0];
        let lengthSUM1 = artID1[1];

        // IF INCOMING FILE ALREADY EXISTS IN TARGET FOLDER..
        if (reversedOutMap.has(destinFile))
        {
            // (**) RETRIEVE CHECKSUMS FROM CORRESPONDING FILE ALREADY IN PROJECT TREE
            let artID2 = reversedOutMap.get(destinFile).split('-');
            let contentSUM2 = artID2[0];
            let lengthSUM2 = artID2[1];

            // (**)...AND IF 'artifact-ID's OF BOTH INCOMING/OUTGOING DO _NOT_ MATCH
            if(contentSUM1 != contentSUM2 || lengthSUM1 != lengthSUM2)
            {
                // APPEND FILE IN TARGET FOLDER WITH SUFFIX ('_MT')
                let appendedNameKey = path.join(path.dirname(destinFile), path.parse(destinFile).name + '_MT' + path.parse(destinFile).ext);
                fs.renameSync(destinFile, appendedNameKey);                

                // COPY AND APPEND SRC FILE FROM REPO WITH SUFFIX ('_MR')
                let appendedNameValue = path.join(path.dirname(destinFile), path.parse(destinFile).name + '_MR' + path.parse(destinFile).ext);              
                fs.copySync(sourceFile, appendedNameValue);
                
                // COPY AND APPEND GMA FILE FROM REPO WITH SUFFIC ('_MG')
                // ============================================================================================
                let appendedGMA = path.join(path.dirname(destinFile), path.parse(destinFile).name + '_MG' + path.parse(destinFile).ext);
                
                // repositoryPath allows us to access the manifest files within the repo
                let repositoryPath = userInput[0];
                
                let labelMap = generateLabelsMap(repositoryPath);
                let manFile = searchForManifest(3, labelMap);
                let manPath = path.join(userInput[0], '.JSTWepo', '.man', manFile);
                
                let projectA = findProject(manPath);
                // projectARoot is the path to the source project root, used to follow the manifest file tree
                let projectARoot = projectA[0];
                // Will be of form -- .man-#.rc
                let manA = manFile;
                
                // projectBRoot is the path to the target project root, used to follow the manifest file tree
                let projectBRoot = userInput[1];
                let manDir = fs.readdirSync(path.join(repositoryPath, '.JSTWepo', '.man'));
                let manLen = manDir.length;
                // manB is set to the last manifest file, work from the bottom up in findGMA
                let manB = ".man-" + manLen.toString() + ".rc";
                
                // This is the file we will be searching for in the GMA manifests
                let fileName = path.parse(destinFile).name;
                
                // Location of the grandma file
                let gmaFile = findGMA(repositoryPath, projectARoot, manA, projectBRoot, manB, fileName);
                
                // If gmaFile == "", there is no common ancestor (despite the same names and locations)
                if (gmaFile != "")
                {
                    let gmaPath = path.join(repositoryPath, gmaFile);
                    fs.copySync(gmaPath, appendedGMA);
                }
                // ============================================================================================

                mergePending.set(appendedNameKey, appendedNameValue);
            }
        }
        else
            // COPY OVER SRC FILE SINCE IT DOESN'T EXIST IN FOLDER
            fs.copySync(sourceFile, destinFile);
    })

    return mergePending;
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

/**
 * This helper function extracts a manifest-labelList hashmap
 * to help with outputting the logs
 */
const getManifestMap = (repoPath) => 
{
    let manMap = new Map();
    let labelsPath = path.join(repoPath, '.JSTWepo', '.labels.txt');
    
    // Array of lines
    let readLabels = fs.readFileSync(labelsPath, 'utf-8').split('\n');
    
    for (i = 0; i < readLabels.length - 1; i++) 
    {
        let labelManifest = readLabels[i].split(' ');
        let manifestFileName = labelManifest[labelManifest.length - 1];
        let labelName = "";
        
        for (j = 0; j < labelManifest.length - 1; j++)
        {
            labelName += (labelManifest[j] + ' ');
        }
        
        
        if (manMap.has(manifestFileName))
        {
            let newLabel = manMap.get(manifestFileName) + (' | ' + labelName);
            manMap.set(manifestFileName, newLabel);
        }
        else
        {
            manMap.set(labelManifest[1].trim(), labelManifest[0].trim());
        }
    }
    return manMap;
}

/*
Helper function for extracting labels from input.
input will have multiple space separated fields, if these fields begin with a quotation mark,
they signify the beginning of a label. If they end with a quote, they signify the end of a label.

This function will return ONLY the values that are bracketed by double quotes 
(if a manifest file is passed, it will not extract it as a label)
*/

const extractLabels = (input) => 
{
    let begin = 0;
    let label = '';
    let ans = []
    
    for (i = 0; i < input.length; i++)
    {
        if (input[i][0] == '\"')
        {
            // Removes quote at the beginning
            if (input[i][input[i].length - 1] == '\"')
            {
                // The case where the label is a single word, "label"
                label += (input[i].substring(1, input[i].length - 1));
            }
            else
            {
                // Case where the label is muti-word and begins with input[i]
                label += ((input[i].substring(1)) + ' ');
            }
        }
        else if (input[i][input[i].length - 1] == '\"')
        {
            // Removes quote at the end
            label += input[i].substring(0, input[i].length - 1);
            // Once 2nd quotation mark has been found, return full label
            ans.push(label);
            label = '';
        }
        else
        {
            // append the label string with everything in between quotes
            label += (input[i] + ' ');
        }
    }
    // Returns a list of labels (quotations removed)
    return ans;
}
/**
 * Concatenate splitted user input for string start & end with double quote.
 * @param {int} srcIndex this is the index of user's input of manifest name or label
 * @returns constructed string or empty if string doesn't start with double quote
 */
const constructInputLabel = (srcIndex) => {
    let strResult = '';
    if (global.userInput[srcIndex].startsWith('"')) {
        let label = global.userInput[srcIndex];
        let inputIndex = srcIndex;
        while (!global.userInput[inputIndex].endsWith('"')) {
            label += ' ' + global.userInput[++inputIndex];
        } 
        // Split into an array of size 3: ['', label, ''] from a string: "label"
        label = label.split('"');
        strResult = label[1];
    }
    return strResult;
}

/**
 * Generate a map contains pairs of value = manifest as key = value
 * @param {String} usrRepoPath JSTWepo's file path
 */
const generateLabelsMap = (usrRepoPath) => {
    result = new Map();
    
    let labelsPath = path.join(usrRepoPath, '.JSTWepo', '.labels.txt');
    let readLabels = fs.readFileSync(labelsPath, 'utf-8').split('\n');
    //console.log('readLabel size: ' + readLabels.length);
    for (i = 0; i < readLabels.length - 1; i++) {
        let labelManifest = readLabels[i].split(' ');
        //console.log('labelManifest: ' + labelManifest);
        let label = '';
        // label is from index 0 to labelManifest.length - 2, the last index contains manifest
        for (let j = 0; j < labelManifest.length - 1; j++) {
            //console.log('labelManifest: ' + labelManifest);
            label += labelManifest[j] + ' ';
        }
        result.set(label.trim(), labelManifest[labelManifest.length - 1].trim());
    }
    // Debugging: see if map is generated properly
    //console.log('labelsMap:');
    for (let [key, value] of result) {
        console.log(key + ' = ' + value);
    }
    //console.log();
    // End Debugging
    return result;
}

/**
 * Command helper: Check if user's input is a label or manifest file name
 * @param {int} srcIndex index of user's input of manifest file name or a label
 * @returns manifest file name
 */
const searchForManifest = (srcIndex, labelsMap) => {
    let result = '';
    if (global.userInput[srcIndex].startsWith('"')) {
        // Grab existed label wrapped in double quotes
        let existedLabel = constructInputLabel(srcIndex);
        // Check if the label of second argument existed in labelsMap 
        if (labelsMap.has(existedLabel)) {
            result = labelsMap.get(existedLabel);
        } else {
            // FAIL case: targetManifest is empty
            console.log('Label "' + existedLabel + '" does not exist.');
        }
    } else {
        // Default case: user specified manifest file name
        result = global.userInput[srcIndex];
    }
    return result;
}

/*
 * Helper Function to find the project that 
 * Accepts the absolute path to a manifest file as an argument
 * Returns projectPath of the current manifest file
 *
 *
 *
 *
 */
const findProject = (manPath) => {
    let currMan = manPath;
    
    let found = false;
    while(found == false)
    {
        let path = path.join(repo, ".JSTWepo", ".man", currMan);
        let contents = fs.readFileSync(path, 'utf8');
        let lineComponents = manifestCommandParse(contents);
        // Each manifest file has a first line, parse it to find the file name
        // Cases: create, update, rebuild, merge_out, merge_in
        // (1) create, update, and merge_in : treated the same
        // create <projectPath> <repositoryPath>
        if (lineComponents[0] == "create" || lineComponents[0] == "update" || lineComponents[0] == "merge_in")
        {
            found = true;
            return lineComponents[1];
        }
        // (2) rebuild, and merge_out treated the same
        // rebuild <repositoryPath> <rebuildPath> <label>
        // This is the first time the project is created from a manifest, immediately jump to the manifest (<label>)
        else if (lineComponents[0] == "rebuild" || lineComponents[0] == "merge_out")
        {
            // Switches to the manifest file that the rebuild came from until we hit the first
            // create/update/merge_out
            let labelMap = generateLabelsMap(lineComponents[1]);
            let temp = userInput[0];
            userInput[0] = lineComponents[3];
            let manFile = searchForManifest(0, labelMap);
            currMan = path.join(userInput[0], '.JSTWepo', '.man', manFile);
            userInput[0] = temp;
        }
        else
        {
            found = true;
            console.log("Error, manifest has an odd command");
        }
    }
    return "";
}

/*
 * Helper Function to parse first line of the manifest file (passed as a string)
 * Accepts
 */
const manifestCommandParse = (str) => {
    // First line format
    // "command,param1,param2,..."
    // Label commands can have quotes in them, must determine line by '\n' character
    
    // This is the first line in the manifest file
    let firstLine = str.split('\n')[0];
    
    // Will return -- command,param1,param2... without surrounding quotes
    // chops off the first quote
    let line = firstLine.substring(1);
    // last quote is at line.length - 1, so we cut it off
    line = line.substring(0, line.length - 1);
    
    // The line is then split into an array 
    let result = line.split(',');
    
    return result;
}


/*
 * Helper Function to find the last common ancestor of two files within two project folders
 * repo is the common repository location
 * sourceRoot is the absolute source project root path
 * sMan is the manifest file corresponding to the current version of source root
 * targetRoot is the absolute target project root path
 * tMan is the manifest file corresponding tot he current version of source root
 * name is the file name that is present at the same location for both snapshots.
 */
const findGMA = (repo, sourceRoot, sMan, targetRoot, tMan, name) => {
    let A = sourceRoot;
    let B = targetRoot;
    let s = sMan;
    let t = tMan;
    
    // result is the absolute path to the gma file (found in the first common ancestor)
    let result = "";
    
    // While the manifests are different
    while (s != t) 
    {
        // ex: man-5.rc > man-3.rc
        if (t > s)
        {
            // Move up
            let array = findNextMan(repo, B, t);
            B = array[0];
            t = array[1];
        }
        else if (s > t) 
        {
            // Move up
            let array = findNextMan(repo, A, s);
            // If you move up and hit a rebuild
            A = array[0];
            s = array[1]
        }
        else 
        {
            console.log("There is an error in findGMA");
        }
    }
    
    // Parses manifest file looking for the file
    result = findFileInMan(name, s);
    // When the manifests are equal, we have gotten to the same branch and the first common ancestor
    // result is the artifact ID
    return result;
}

const findNextMan = (repo, projectRoot, currMan) => {
    // .man-######.rc
    let dotIndex = currMan.lastIndexOf('.');
    // chops off .man- and .rc
    let manNum = parseInt(currMan.substring(5, dotIndex));
    
    let found = false;
    
    while(found == false) 
    {
        let thisMan = ".man-" + manNum.toString() + ".rc";
        let path = path.join(repo, ".JSTWepo", ".man", thisMan);
        let contents = fs.readFileSync(path, 'utf8');
        let lineComponents = manifestCommandParse(contents);
        // Each manifest file has a first line, parse it to find the file name
        // Cases: create, update, rebuild, merge_out, merge_in
        // (1) create, update, and merge_in : treated the same
        // create <projectPath> <repositoryPath>
        if (lineComponents[0] == "create" || lineComponents[0] == "update" || lineComponents[0] == "merge_in")
        {
            // If we have a c/u/mi command, and the project is the same we are looking for
            // return the manifest name unless it is the same manifest name
            if (lineComponents[1] == projectRoot && thisMan != currMan)
            {
                found = true;
                return [projectRoot, thisMan];
            }
            else
            {
                // Go one up
                if (manNum > 0)
                {
                    manNum -= 1;
                }
                else
                {
                    // End of manifest files
                    return ["", ""];
                }
            }
        }
        // (2) rebuild, and merge_out treated the same
        // rebuild <repositoryPath> <rebuildPath> <label>
        // This is the first time the project is created from a manifest, immediately jump to the manifest (<label>)
        else if (lineComponents[0] == "rebuild" || lineComponents[0] == "merge_out")
        {
            // If r/mo command and we are still on the original manifest
            if (thisMan == currMan)
            {
                // Switches to the manifest file that the rebuild came from
                let labelMap = generateLabelsMap(lineComponents[1]);
                let temp = userInput[0];
                userInput[0] = lineComponents[3];
                let manFile = searchForManifest(0, labelMap);
                userInput[0] = temp;

                // jump manNum to the manifest from the rebuild
                dotIndex = manFile.lastIndexOf('.');
                manNum = parseInt(manFile.substring(5, dotIndex));
            }
            // We are seeing the rebuild for the 2nd time
            else
            {
                found = true;
                // Project Name changes to whatever is found after the rebuild command
                return [lineComponents[2], thisMan];
            }
        }
        else
        {
            found = true;
            console.log("Error, manifest has an odd command");
        }
    }
}

const findFileInMan = (name, manName) => {
    let path = path.join(repo, ".JSTWepo", ".man", manName);
    let contents = fs.readFileSync(path, 'utf8');
    let lines = contents.split('\n');
    
    for (let i = 0; i < lines.length; i += 1)
    {
        let line = lines[i].split(' ');
        // Rebuild/Amy.txt
        let pathArray = line[2].split('/');
        // Last element in the path array should be the file name
        let currFileName = pathArray[pathArray.length - 1];
        if( currFileName == name)
        {
            // Artifact ID
            return line[0];
        }
    }
    return "";
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
    crossReference,
    recreator,
    unrooterator,
    getManifestMap,
    extractLabels,
    constructInputLabel,
    merge_out,
    reverseMaperator,
    generateLabelsMap,
    searchForManifest
};
