JSTWin's Version Control System (JSTWepo) - Project 1
CECS 343, Siska Fall 2020

### Description ###
- JSTWin's JSTWepo is our take on a version control system (VCS). It utilizes HTML, CSS, JavaScript, NodeJS 
  and the NodeJS framework, Express to allow for basic repository creation.

- JSTWepo is capable of:
	- Creating a project repository and storing it in any location locally
	- Outputting a log of previous commit dates/times and their corresponding manifest files
	  (in preparation for roll-back functionality)


### Quick Start ###
- Install NodeJS if you haven't already
- Navigate to the project root within your system's console
	- WINDOWS/ MAC: cd <filePath>
- Run the command "node myapp.js"
- Open a web browser and navigate to "localhost:3000" to view the web application
- You are now free to enter applicable commands and parameters into the text box to build your project repo

### Usage ###
- JSTWepo handles commands in the following syntax => <commandName> <parameter> <parameter> ...
	- A command followed by a space-separated parameter list

### Commands ###

create <projectPath> <repositoryPath>
	- The create command is used to initialize a repository with the current contents of the project
		- '.' files are ignored in repository creation, e.g. ".foo.txt", ".bar.html"
	- The repository will be initialized at the file path, "repositoryPath" under the repo folder ".JSTWepo"
		- Contained within the repository will be all relevant files (saved under their ArtifactID)
		  and a .man/ folder, containing the newest manifest file (a "snapshot" of the current project)
	- projectPath
		- An absolute path to the project root directory that you wish to create a repository from
	- repositoryPath
		- An absolute path to the location of the newly created repository

log <repositoryPath>
	- The log command is used to visualize the previous commits (including the create command) and the
	  date/time when they were committed (in preparation for project roll-back capabilities).
		- Output is displayed in browser

### Caveats ###
- JSTWepo is in its beta-release, it is not yet a finished product and as result it has minimal function
  and does not have perfect error handling
- The input handling by the create command is very simple at this point and we haven't done enough testing
  to perfect handle any form of input
- The user interface is not ideal, it only leverages basic HTML and CSS
- Each time you would like to work with a repository for the log command, you need to pass the repositoryPath
	- Ideally, we would like it to work like a CLI, if you are in the repo location, only pass the
	  command log with no parameters
- Currently does not allow backspace in the landingPage text field, to reset the text field, you must reload
  the landingPage

### JSTWepo Project Contents ###
cecs343-VCS-01-JSTWin\
	controller\
	node_modules\
	view\
	myapp.js
		# NodeJS application to host JSTWepo at localhost:3000
	package-lock.json
	README.txt
		# The current file, explains project

cecs343-VCS-01-JSTWin\controller
	routes.js
		# "Routing" of web pages and input handling
	scratch.js
		# Implementation file for JSTWepo functions

cecs343-VCS-01-JSTWin\view
	authorsPage.html
		# For displaying a webpage of JSTWepo author information
	commandPage.html
		# For displaying a webpage of JSTWepo command information
	landingPage.html
		# For displaying a webpage to access JSTWepo's I/O
	responsePage.html
	sTyLeZ.css
		# CSS formatting for the above HTML documents

### Potential Future Releases ###
- More commands including commands that many be familiar to git users:
	- revert
	- add
	- reset
	- commit
- Browser CLI will be implemented to allow for better I/O
- Graphical user interface similar to GitHub to improve accessibility
- Improving the current user interface to be more clean and modern