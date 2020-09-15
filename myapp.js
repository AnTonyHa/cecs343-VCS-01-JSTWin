// IMPORT 'express' PACKAGE
const express = require('express');
const bodyParser = require('body-parser');

// IMPORT EXTRA FUNCTIONS FROM 'routes.js' (LIKE C-HEADER FILES)
const router = require('./controller/routes');

// INSTANTIATE 'app'
const app = express();
// idk why this works in here and NOT in 'routes.js' where it SHOULD be (???)
app.use(bodyParser.urlencoded({ extended: false }));

// USE 'router' TO DIRECT CLIENT REQUESTS TO PRE-DEFINED PAGES
// NOTE: 'router' is valid middleware, no need to pass further arguments
app.use(router);

// SET 'app' TO LISTEN ON PORT 3000 FOR REQUESTS
app.listen(3000);