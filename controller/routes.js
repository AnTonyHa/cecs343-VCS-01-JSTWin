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
    let fArray = [];

    switch (userInput[0])
    {
        case 'create':
            // What happen if .JSTWepo already initialized?
            handlers.create_repo(fArray);
            resp.render('responsePage', {dispType: 'cr-console', okFiles: fArray, userCMD: userInput});
            break;
        case 'log':
            let results = handlers.log();
            resp.render('responsePage', {dispType: 'lg-console', log: results})
            break;
        //case 'add':
            //break;
        //case 'commit':
            //break;
        //case 'revert':
            //break;
        default:
            resp.render('responsePage', { dispType: 'syn-error', userCMD: userInput });

    }
})
/*
router.post('executeCMD',(req,resp)=>){
    if (req.body.input_field_cmd.includes('commit-file'))
        commitFiles()
}
*/
// BASIC HANDLER FOR DEFAULT PAGE
router.get('/', (req, resp) => {
    resp.render('responsePage', {dispType: 'blank'});
})

module.exports = router;