## How to generate backend documentation

* Go into the webServer directory and make sure all npm dependancies are installed
* Use the command "./node_modules/.bin/jsdoc app -r -d backend_docs" to run jsdoc in the "app" folder recursively. Make sure the "-d" option specifies this directory (backend_docs).