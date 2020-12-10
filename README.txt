JSTWin's Version Control System (JSTWepo) - Project 2
CECS 343, Siska Fall 2020

### Team Members ###
- Jacob Azevedo Jr.
- Stephanie Lim
- Tony Ha
- William Duong

### Description ###
- JSTWin's JSTWepo is our take on a version control system (VCS). It utilizes HTML, CSS, JavaScript, NodeJS 
  and the NodeJS framework, Express to allow for basic repository creation.

- JSTWepo is capable of:
	- Creating a project repository and storing it in any location locally
	- Outputting a log of previous commit dates/times and their corresponding manifest files/ labels
	- Recreating a project snapshot in a seperate directory based on a specifed manifest file/ label
	- Updating an existing repository with a current version of a project
	- Labeling snapshots with a desired name and functioning as a manifest file alias

### Quick Start ###
- Install NodeJS if you haven't already
- Navigate to the project root within your system's console
	- WINDOWS/ MAC: cd <filePath>
- Run the command "node myapp.js"
- Open a web browser and navigate to "localhost:3000" to view the web application
- You are now free to enter applicable commands and parameters into the text box to build your project repo

### Usage ###
- JSTWepo handles commands in the following syntax => commandName <parameter> <parameter> ...
	- A command followed by a space-separated parameter list

### Commands ###

create 
Signature: create <projectPath> <repositoryPath>
	- The create command is used to initialize a repository with the current contents of the project
		- '.' files are ignored in repository creation, e.g. ".foo.txt", ".bar.html"
	- The repository will be initialized at the file path, "repositoryPath" under the repo folder ".JSTWepo"
		- Contained within the repository will be all relevant files (saved under their ArtifactID)
		  and a .man/ folder, containing the newest manifest file (a "snapshot" of the current project)
	Arguments:
	- projectPath
		- An absolute path to the project root directory that you wish to create a repository from
	- repositoryPath
		- An absolute path to the location of the newly created repository

log 
Signature: log <repositoryPath>
	- The log command is used to visualize previous commits and the
	  date/time when they were committed (in preparation for project roll-back capabilities).
		- All labels corresponding to each commit are listed
	Arguments:
	- repositoryPath
		- An absolute path to the location of a repository

update 
Signature: update <projectPath> <repositoryPath>
	- The update command is used to update a repository with the current contents of the project
	- The repository will not be updated if the repositoryPath does not contain a ".JSTWepo" folder.
	Arguments:
	- projectPath
		- An absolute path to the project root directory that you wish to create a repository from
	- repositoryPath
		- An absolute path to the location of a repository

label
Signature:  label <repositoryPath> <manifestFileName> <label> 
	- The label command allows a user to rename a snapshot of a project with an alias to allow for easy
	  reference, and ease of use with the rebuild command
		- There is no limit to the number of labels that can be mapped to a manifest file
	Arguments:
	- repositoryPath
		- An absolute path to the location of a repository
	- manifestFileName
		- The name of the manifest file (an existing label can be used as an alias)
        - Label of form: man-#.rc, "man-#", "label"
	- label
		- A double quoted string ("this label", "man-#") or an exact manifest file ID (man-#.rc)

rebuild
Signature: rebuild <repositoryPath> <rebuildPath> <label>
	- The rebuild command is used to recreate a snapshot of a project in a specified location 
	  (the specified location is assumed to be an empty directory)
	Arguments:
	- repositoryPath
		- An absolute path to the location of a repository
	- rebuildPath
		- An absolute path to the location where the project snapshot is to be rebuilt
	- label
		- A double quoted string ("this label", "man-#") or an exact manifest file ID (man-#.rc)

merge_out
Signature: merge_out <sourcePath> <targetPath> <label>
	- The merge_out command compares the latest snapshots of the source branch and the target branch. 
	  The target is merged into the source (leaving the target unchanged).
	  To complete the merge process, the merge_in command must follow after the user has manually handled
	  file conflicts between the two branches.
	Arguments:
	- sourceProjectPath
		- An absolute path to the location of the source project root
	- targetProjectPath
		- An absolute path to the location of the target project root
	- label
		- A double quoted string ("this label", "man-#") or an exact manifest file ID (man-#.rc)

merge_in
Signature: merge_in <sourcePath> <repositoryPath>
	- The merge_in command is manually called by the user after a merge_out command has been called 
	  and conflicts have been manually resolved. Updates the source repository with the newest version
	  of the application
	Arguments:
	- sourceProjectPath
		- An absolute path to the location of the source project root
	- repositoryPath
		- An absolute path to the location of a repository


### Caveats ###
- JSTWepo is in its beta-release, it is not yet a finished product and as result it has minimal function
  and does not have perfect error handling
- The input handling by the create command is very simple at this point and we haven't done enough testing
  to perfect handle any form of input
- The user interface is not ideal, it only leverages basic HTML and CSS
- Each time you would like to work with a repository for the log command, you need to pass the repositoryPath
	- Ideally, we would like it to work like a CLI, if you are in the repo location, only pass the
	  command log with no parameters
- absolute2Relative doesn't handle the case where fileName is not contained within srcPath

### JSTWepo Project Contents ###
cecs343-VCS-01-JSTWin\
	controller\
	node_modules\
	view\
	myapp.js
		# NodeJS application to host JSTWepo at localhost:3000
	package-lock.json
		# Specifies package criteria for project
	README.txt
		# The current file, explains project

cecs343-VCS-01-JSTWin\controller
	routes.js
		# "Routing" of web pages and input handling
	handler.js
		# Implementation file for JSTWepo functions
	scratch.js
		# Utility functions for JSTWepo functions

cecs343-VCS-01-JSTWin\view
	authorsPage.html
		# For displaying a webpage of JSTWepo author information
	commandPage.html
		# For displaying a webpage of JSTWepo command information
	purple sunset.gif
		# Graphic for website background	
	responsePage.ejs
		# For displaying a webpage to access JSTWepo's I/O
	sTyLeZ.css
		# CSS formatting for the above HTML documents

### Potential Future Releases ###
- React application refactor, allowing for easier development and visualization of changes
  in real-time
- Graphical user interface similar to GitHub to improve accessibility
- Refactoring interface to allow for easier use of commands 
  (removing the need to consistently enter repoPath, etc.)
