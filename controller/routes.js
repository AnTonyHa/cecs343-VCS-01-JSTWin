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

// GENERIC HANDLER, WILL _ALWAYS_ EXECUTE
router.use((req, resp, next) => {

    // DIFFERENT CONSOLE LOG BASED ON URL STRING OF 'req'
    if (req.url === '/executeCMD')
        repo.consoleEcho(req.body.input_field_cmd);
    else
        repo.consoleEcho('...DEFAULT STRING');

    next(); // passes control to next function (if any)
})

// HANDLER FOR 'execute' BUTTON ON LANDING PAGE
router.post('/executeCMD', (req, resp) => {
    // 'body-parser' SEARCHES THROUGH PAGE FOR CORRESPONDING ELEMENT NAME
    userInput = req.body.input_field_cmd.split(' ');
    let fArray = [];

    switch (userInput[0])
    {
        case 'create':
            handlers.create_repo(fArray);
            resp.render('responsePage', {dispType: 'cr-console', okFiles: fArray, userCMD: userInput});
            break;
        case 'log':
            let results = repo.log();
            console.log(results);
            resp.render('responsePage', {dispType: 'lg-console', log: results})
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