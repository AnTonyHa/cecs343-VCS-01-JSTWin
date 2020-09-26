/**
 * Team members: 
 * Jacob Azevedo Jr. - jacobazevedojr@gmail.com
 * Stephanie Lim - hynglim@gmail.com
 * Tony Ha - tony.ha@student.csulb.edu
 * William Duong - wxduong@gmail.com
 * 
 * Program Description: NodeJS application to hose JSTWepo at localhost:3000
 */

// IMPORT 'express' PACKAGE
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

// IMPORT EXTRA FUNCTIONS FROM 'routes.js' (LIKE C-HEADER FILES)
const router = require('./controller/routes');

// INSTANTIATE 'app'
const app = express();

// SETTING TEMPLATING ENGINE TO EJS
app.set('view engine', 'ejs');
app.set('views', 'view');

// idk why this works in here and NOT in 'routes.js' where it SHOULD be (???)
app.use(bodyParser.urlencoded({ extended: false }));
// required to serve static files to web client (for example, .CSS files)
app.use(express.static(path.join(__dirname, 'view')));

// USE 'router' TO DIRECT CLIENT REQUESTS TO PRE-DEFINED PAGES
// NOTE: 'router' is valid middleware, no need to pass further arguments
app.use(router);

// SET 'app' TO LISTEN ON PORT 3000 FOR REQUESTS
app.listen(3000);