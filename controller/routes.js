// BUILT IN MODULES OFFERED BY NODEJS
const express = require('express');
// const { fstat } = require('fs');
const fs = require('fs');
const router = express.Router();
const path = require('path');

// IMPORT EXTRA FUNCTIONS FROM 'scratch.js' (LIKE C-HEADER FILES)
const handlers = require('./scratch');

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
        let userInput = req.body.input_field_cmd.split(' ');

        console.log('userInput = ' + userInput[1]);

        // 'fileKeeper()' PARSES '{source path}' FOR ARCHIVABLE CONTENT
        // arg 2: 'fArray' will be populated with valid files
        // arg 3: 'iArray' will be populated with ignored files (optional???)
        handlers.fileKeeper(userInput[1], fArray, iArray);

        // 'makeManifestFile()' GENERATES MANIFEST FILE AND NECESSARY ARTIFACT IDs
        // arg 1: 'userInput' array necessary for helper functions internal to 'makeManifestFile()'
        handlers.makeManifestFile(userInput, fArray);

        // RESPOND WITH DYNAMICALLY CREATED .HTML PAGE
        // TO DO: make changes dynamic to 'landingPage.html' instead of new HTML page
        resp.send('<html><h4>Successfully parsed! => [' + fArray + '] <= </h4></html>');
    }
    else if (req.body.input_field_cmd.includes('log')) {
        try {
            if (fs.existsSync(handlers.rootDir + '/.JSTWepo')) {
                console.log('Found JSTWepo');
            }
        } catch (err) {
            console.error(err);
        }
    }
    else {// IF USER INPUTS INVALID COMMAND, RELOAD 'landingPage.html'
        resp.sendFile(path.join(handlers.rootDir, 'view', 'landingPage.html'));
    }
})

// BASIC HANDLER FOR DEFAULT PAGE
router.get('/', (req, resp) => {
    resp.sendFile(path.join(handlers.rootDir, 'view', 'landingPage.html'));
})

module.exports = router;