# Web interface and data visualization (Richard and Christine)

## Running

There will be two ways to run/test this Angular interface: using php (doesn't depend on the node server), or using our native node server. You'll probablly want to do both at some point, so install both php and node (for node installation see DroneDataAnalysis/webServer/README). 

## Installing new libraries/packages

You will be using bower as your package manager for the front-end interface. This is installed in "DroneDataAnalysis/webServer/node_modules/bower". To use it from this directory to install a package the command is "../node_modules/bower/bin/bower install <package_name> -save". The "-save" is to save the name and verson of the library in the bower.json file.

If you don't see the node_modules folder don't worry! This means that no node packages have been installed yet. To install all of the required packages (including bower) navigate to "DroneDataAnalysis/webServer" and type "npm install" (or "sudo npm install"). This will look into the package.json file for all of the required package dependancies for this project and install them in the node_modules folder.

## Updating bower packages

The command to reinstall all packages (while in this directory) specified in the bower.json file is "../webServer/public bower install". NOTE: you need to have bower installed in order to do this.