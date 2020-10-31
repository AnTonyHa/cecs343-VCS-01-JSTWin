/**
 * Team members: 
 * Jacob Azevedo Jr. - jacobazevedojr@gmail.com
 * Stephanie Lim - hynglim@gmail.com
 * Tony Ha - tony.ha@student.csulb.edu
 * William Duong - wxduong@gmail.com
 * 
 * Program Description: Routing of web pages and input handling.
 */

// BUILT IN MODULES OFFERED BY NODEJS
const express = require('express');
const router = express.Router();

// IMPORT EXTRA FUNCTIONS FROM 'scratch.js' (LIKE C-HEADER FILES)
const repo = require('./scratch');
const handlers = require('./handlers');

// STORE USER INPUT FROM WEB-BROWSER/'CLI' AS GLOBAL VARIABLE
global.userInput;

// HANDLER FOR 'execute' BUTTON ON LANDING PAGE
router.post('/executeCMD', (req, resp) => {
    // 'body-parser' SEARCHES THROUGH PAGE FOR CORRESPONDING ELEMENT NAME
    userInput = req.body.input_field_cmd.split(' ');
    
    let fArray = new Map();
    // JstLabels is the labels tracker, commands that could utilize labels could use the built-in JS Map functions
    // let jstLabels = new Map();

    switch (userInput[0])
    {
        case 'create':
            handlers.create_repo(fArray);
            resp.render('responsePage', {dispType: 'cr-console', okFiles: fArray, userCMD: userInput});
            break;
        case 'rebuild':
            // rebuild <src> <repo> <label>
            
            // userInput is a label, not a manifest file
            if (userInput[3][0] == '\"')
            {
                // This extracts the label from the last element (sliced just in case it is multi-word)
                UserInput[3] = repo.extractLabels(userInput.slice(3));
            }
            
            handlers.check_out(resp);
            break;
        case 'log':
            // TODO Modify log function to show associated labels
            let results = handlers.log();
            resp.render('responsePage', {dispType: 'lg-console', log: results});
            break;
        case 'update':
            let update = handlers.boolUpdate();

            if(update){
                handlers.update(fArray);
                resp.render('responsePage', {dispType: 'cr-console', okFiles: fArray, userCMD: userInput});
                break;
            }
            else{
                resp.render('responsePage', {dispType: 'path-error'});
                break;
            }
        // user input arguments: 1 = JSTWepo's path, 2 = manifest file name or "existed label", 3 = "new label"
        case 'label':
            // User scenario: After several tedious typing of the manifest path to use this VCS program. User decides it is much better if he/she
            // have a shortened reference to any particular snapshot that reside in the repo.
            let manifestFileName = '';
            let labelName = '';
            // First label is manifest ID
            if (userInput[2][0] != '\"')
            {
                // If the 2nd space-separated field doesn't begin with a \", it is a manifestFileName (not a label)
                // extract labels from all fields AFTER the manifestFileName
                labelArray = repo.extractLabels(userInput.slice(3));
                userInput[3] = labelArray[0];
                console.log(...labelArray);
            }
            else
            {
                // extract labels from all fields beginning from the 2nd field (the first manifest file name block)
                labelArray = repo.extractLabels(userInput.slice(1));
                userInput[2] = labelArray[0];
                userInput[3] = labelArray[1];
                console.log(...labelArray);
            }
            
            jstLabels = handlers.generateLabelsMap(userInput[1]);
            // Debugging: Check generated map
            console.log('JSTLabels size: ' + jstLabels.size);
            for (let [key, value] of jstLabels) {
                console.log(key + ' : ' + value);
            }
            // End of Debugging section
            handlers.createLabel(jstLabels);
            // TODO implement ejs for the web page
            let newRes = handlers.log();
            resp.render('responsePage', {dispType: 'lg-console', log: newRes});
            break;
        default:
            resp.render('responsePage', { dispType: 'syn-error', userCMD: userInput });
    }
})

// BASIC HANDLER FOR DEFAULT PAGE
router.get('/', (req, resp) => {
    resp.render('responsePage', {dispType: 'blank'});
})

module.exports = router;
