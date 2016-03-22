# DroneDataAnalysis

Creating a drone data analysis module for safety

## Sub projects

- webServer/public: The interface to display all of our raw/interpreted data

- webServer: The server to communicate between the signal reciever/filter and the interface. It will also be doing a fair amount on data analysis and database querying.

- signalProcessor: the primary communication channel between the drone and the server module

## Database

- There will be a MongoDB located at DroneDataAnalysis/webServer/database. MongoDB will need to be intstalled on the users OS before this can be run. 

- The database must first be started to run. Use "mongod --dbpath <pathname>". Personally, mine is in ~/Desktop/uav_ops/DroneDataAnalysis/webServer/database. I will write a script later to automatically start the db and run the node server. Running the mongo server for the first time will initialize the db in the "database folder"