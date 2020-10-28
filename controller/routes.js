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

// TESTING DIFFERENCE BETWEEN '.use()' AND '.get()'
// '.use' IS MORE GENERIC, WILL WORK FOR ALL HTTP METHODS
// '.get' FOR ONLY GET REQUESTS (SIMPLE URLs)
// '.post' FOR ONLY POST REQUESTS (SAFER FOR FORMS)

// HANDLER FOR 'execute' BUTTON ON LANDING PAGE
router.post('/executeCMD', (req, resp) => {
    // 'body-parser' SEARCHES THROUGH PAGE FOR CORRESPONDING ELEMENT NAME
    userInput = req.body.input_field_cmd.split(' ');
    let fArray = new Map();

    switch (userInput[0])
    {
        case 'create':
            handlers.create_repo(fArray);
            resp.render('responsePage', {dispType: 'cr-console', okFiles: fArray, userCMD: userInput});
            break;
        case 'check_out':
            handlers.check_out();
            break;
        case 'log':
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
        case 'label':
            // User scenario: After several tedious typing of the file path to use this VCS program. User decides it is much better if he/she
            // have a shortened reference to any particular snapshot that reside in the repo.
            // Call label function in handlers
            handlers.createLabel(userInput[1], userInput[2], userInput[3]);
            // TODO implement ejs for the web page
            resp.render('responsePage', { dispType: 'syn-error', userCMD: userInput });
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
