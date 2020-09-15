// BUILT IN MODULES OFFERED BY NODEJS
const express = require('express');
const router = express.Router();
const path = require('path');


// IMPORT EXTRA FUNCTIONS FROM 'scratch.js' (LIKE C-HEADER FILES)
const handlers = require('./scratch');
const fs = require("fs");
global.userInput;
// TESTING DIFFERENCE BETWEEN '.use()' AND '.get()'
// '.use' IS MORE GENERIC, WILL WORK FOR ALL HTTP METHODS
// '.get' FOR ONLY GET REQUESTS (SIMPLE URLs)
// '.post' FOR ONLY POST REQUESTS (SAFER FOR FORMS)

// GENERIC HANDLER, WILL _ALWAYS_ EXECUTE
router.use((req, resp, next) => {

    // DIFFERENT CONSOLE LOG BASED ON URL STRING OF 'req'
    if (req.url === '/executeCMD')
        handlers.consoleEcho(req.body.input_field_cmd);
    else
        handlers.consoleEcho('...DEFAULT STRING');

    next(); // passes control to next function (if any)
})

// HANDLER FOR 'execute' BUTTON ON LANDING PAGE
router.post('/executeCMD', (req, resp) => {
    // 'body-parser' SEARCHES THROUGH PAGE FOR CORRESPONDING ELEMENT NAME
    if (req.body.input_field_cmd.includes('create-repo')) {
        let iArray = [];
        let fArray = [];

        // SPLIT USER INPUT INTO: {command}-{source path}-{target repo}
        userInput = req.body.input_field_cmd.split(' ');

        // 'fileKeeper()' PARSES '{source path}' FOR ARCHIVABLE CONTENT
        // arg 2: 'fArray' will be populated with valid files
        // arg 3: 'iArray' will be populated with ignored files (optional???)
        handlers.fileKeeper(userInput[1], fArray, iArray);


        // creates Repository folder that will contain all the artifacts and manifest files.
        if (!fs.existsSync(path.join(userInput[1], '.JSTWepo'))) {
            fs.mkdirSync(path.join(userInput[1], '.JSTWepo'));
            fs.mkdirSync(path.join(userInput[1], '.JSTWepo', '.man'));
        }

        console.log(fArray);

        /// 'commitFiles' MAKES COPIES OF THE ORIGINAL FILES AND STORES ITS ARTIFACT ID IN THE REPO
        // 
        handlers.commitFiles(fArray);


        // 'makeManifestFile()' GENERATES MANIFEST FILE AND NECESSARY ARTIFACT IDs
        // arg 1: 'userInput' array necessary for helper functions internal to 'makeManifestFile()'
        handlers.makeManifestFile(userInput, fArray);   

        // RESPOND WITH DYNAMICALLY CREATED .HTML PAGE
        // TO DO: make changes dynamic to 'landingPage.html' instead of new HTML page
        resp.send('<html><h4>Successfully parsed! => [' + fArray + '] <= </h4></html>');
    }
    else // IF USER INPUTS INVALID COMMAND, RELOAD 'landingPage.html'
        resp.sendFile(path.join(handlers.rootDir, 'view', 'landingPage.html'));
})
/*
router.post('executeCMD',(req,resp)=>){
    if (req.body.input_field_cmd.includes('commit-file'))
        commitFiles()
}
*/
// BASIC HANDLER FOR DEFAULT PAGE
router.get('/', (req, resp) => {
    resp.sendFile(path.join(handlers.rootDir, 'view', 'landingPage.html'));
})

module.exports = router;