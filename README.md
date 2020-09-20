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

## Manifest File (layout):

- User command       : {command} {source directory}
- Execution date/time: DAY Mon dd yyyy @ hh:mm:ss TIMEZONE DST
- Archived file list : {artifact ID} @ {path relative to source folder}

## CAVEATS:

- Successful command returns an .HTML page with jumbled message. No longer outputs to console, instead check source directory for manifest file.

- The only valid command is currently 'create-repo'. Invalid input will reload the landing page.
- I have not tested cases where the path to the source directory includes random spaces.
- I have not tested what happens if you EXECUTE 'create-repo' without including a source directory.
- I have not tested what happens if you EXECUTE 'create-repo' with more than one directory (i.e. trying to include destination directory).
- The HTML/CSS is amateur hour, I hacked that together. If you know HTML\CSS better, please don't make fun.

## WORK-IN-PROGRESS:

- Functionality to recreate project tree into destination folder.

## Bugs Found:

- Incorrect ArtID of "fred.txt". Generated ArtID: P4086-L11-<b>C2758</b>.txt, Expected ArtID: P4086-L11-<b>C3201</b>.txt
  - Note: The program was tested on MacOS this could be the problem since Windows' file path is different
