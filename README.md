# JSTWin's Version Control System - Project 1
## CECS 343, Siska Fall 2020


## Instructions\Access:

- Install NodeJS if you haven't already.
- Run 'node myapp.js' from this project folder to start server.
- Navigate to 'localhost:3000' in new window of web browser.

- Included in project folder is 'bot' folder as an example Source directory to use for repo creation. There are random
files included with junk data and some files the app SHOULD ignore. You can move this 'bot' folder anywhere else to test
that parsing the directory works correctly.

## Execution:

- Syntax for command is currently => {command} {source directory}
-   example: 'create-repo C:\someRandomPath\bot'
-   NOTE: path to source directory MUST be absolute path.

## CAVEATS:

- Successful command returns an .HTML page with jumbled message. Check the console for meaningful data (e.g. artifact ID and parsed files).

- The only valid command is currently 'create-repo'. All other commands will reload the landing page.
- I have not tested cases where the path to the source directory includes random spaces.
- I have not tested what happens if you EXECUTE 'create-repo' without including a source directory.
- I have not tested what happens if you EXECUTE 'create-repo' with more than one directory (i.e. trying to include destination directory).
- The HTML/CSS is amateur hour, I hacked that together. If you know HTML\CSS better, please don't make fun.

## WORK-IN-PROGRESS:

- Functionality to build and write a manifest file.