#include <iostream>
#include <fstream>
#include <thread>
#include <chrono>
#include <string>

using namespace std;

// this is the number of bytes we are sending at a time for the DAT file
#define BLOB 500000

int main(int argc, char* argv[]){
	
	// declarations
	size_t size = 0; 
	char* data = 0;
	ifstream file;

	// open .dat file
	file.open( "/Users/karlcd/Desktop/uav_ops/DroneDataAnalysis/signalProcessor/mock/data/DAT/FLY000.DAT", ios::in|ios::binary|ios::ate );

	// make sure our file is actually there
	if(file == false){ return 1; }
	
	// get file size and calculate number of blobs
	file.seekg(0, ios::end); 
	size = file.tellg() ; 
	int num_blobs = size / BLOB;

	// go to begining of file to read for real
	file.seekg(0, ios::beg); 

	// make our character (byte) buffer and read into it
	data = new char[size+1]; 
	file.read(data, size);
	data[size] = '\0' ;

	//output blob of data
	size_t count = 0;
	int last_blob = size - BLOB;
	while(count < size){

		string out_string = "";

		if(count > last_blob){
			for (int i = count; i<size; i++){
				out_string += data[count];
				count++;
			}
		}
		 else{
			for (int i = 0; i<BLOB; i++){
				out_string += data[count];
				count++;
			}
		}

		// output wait
		cout << out_string << endl;
		std::this_thread::sleep_for (std::chrono::seconds(20));
	}

	return 0;
}