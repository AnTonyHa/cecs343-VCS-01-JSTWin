// BUILT IN MODULES OFFERED BY NODEJS
const express = require('express');
// const { fstat } = require('fs');
const fs = require('fs');
const router = express.Router();
const path = require('path');

// IMPORT EXTRA FUNCTIONS FROM 'scratch.js' (LIKE C-HEADER FILES)
const handlers = require('./scratch');
// STORE USER INPUT FROM WEB-BROWSER/'CLI' AS GLOBAL VARIABLE
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
        let fArray = [];

        // SPLIT USER INPUT INTO: {command}-{source path}
        userInput = req.body.input_field_cmd.split(' ');

        // IF '.JSTWepo' FOLDER DOESN'T EXIST, '.man' ALSO SHOULD NOT EXIST, THEREFORE
        // CREATE BOTH
        if (!fs.existsSync(path.join(userInput[1], '.JSTWepo')))
        {
            fs.mkdirSync(path.join(userInput[1], '.JSTWepo'));
            fs.mkdirSync(path.join(userInput[1], '.JSTWepo', '.man'));
        }

        // 'fileKeeper()' PARSES '{source path}' FOR ARCHIVABLE CONTENT
        // arg 1: String representing absolute path to source folder
        // arg 2: 'fArray' will be populated with valid files
        handlers.fileKeeper(userInput[1], fArray);

        handlers.commitFiles(fArray);

        // 'makeManifestFile()' GENERATES MANIFEST FILE AND NECESSARY ARTIFACT IDs
        handlers.makeManifestFile(fArray);

        // RESPOND WITH DYNAMICALLY CREATED .HTML PAGE
        // TO DO: make changes dynamic to 'landingPage.html' instead of new HTML page
        resp.send('<html><h4>Successfully parsed! => [' + fArray + '] <= </h4></html>');
    }
    else if (req.body.input_field_cmd.includes('log')) {
        let userInput = req.body.input_field_cmd.split(' ');
        handlers.log(userInput[1]); 
        resp.sendFile(path.join(handlers.rootDir, 'view', 'landingPage.html'));
    }
    else {// IF USER INPUTS INVALID COMMAND, RELOAD 'landingPage.html'
        resp.sendFile(path.join(handlers.rootDir, 'view', 'landingPage.html'));
    }
})

// BASIC HANDLER FOR DEFAULT PAGE
router.get('/', (req, resp) => {
    resp.sendFile(path.join(handlers.rootDir, 'view', 'landingPage.html'));
})

router.get('/landingPage', (req, res) => {
    res.sendFile(path.join(handlers.rootDir, 'view', 'landingPage.html'))
})

router.get('/authorsPage', (req, res) => {
    res.sendFile(path.join(handlers.rootDir, 'view', 'authorsPage.html'))
})

router.get('/helpPage', (req, res) => {
    res.sendFile(path.join(handlers.rootDir, 'view', 'helpPage.html'))
})

module.exports = router;
