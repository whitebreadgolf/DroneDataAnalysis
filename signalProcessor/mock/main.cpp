#include <iostream>
#include <fstream>
#include <thread>
#include <chrono>
#include <string>
#include <map>
#include <algorithm>

// this is the number of bytes we are sending at a time for the DAT file
#define BLOB 500000

void populateMap (std::map<std::string, std::string>& map, const std::string& extn);
void outputDAT (std::ifstream& ifile, bool sleep);
void outputCSV (std::ifstream& ifile, bool sleep);

int main(int argc, char* argv[]){
	const std::string FAIL_STRING = "MOCK FAILED";
	const std::string FAIL_FILE = "ERROR: Invalid file chosen. File must end in '.csv' or '.DAT'.";
	const std::string FAIL_EXTN = "ERROR: Invalid file extension chosen. Choose either 'csv' or 'dat'.";
	const std::string FAIL_RATE = "ERROR: Invalid rate of output chosen. Choose either 'real_time' or 'no_sleep'.";
	/* command line argument parsing */
	// expecting 3 arguments in command line
	if (argc != 4)
	{
		std::cerr << FAIL_STRING << std::endl;
		std::cerr << "Needs 3 arguments. Run with './a.out [filename/filetype] ['csv'/'dat'] ['real_time'/'no_sleep']" << std::endl;
		std::cerr << "Run './a.out help' for more information on the cmdline arguments." << std::endl;
		return 1;
	}

	// parse command line with 4 arguments 
	std::string file = argv[1];
	std::string extn = argv[2];
	std::string rate = argv[3];
	std::transform(extn.begin(), extn.end(), extn.begin(), ::tolower);
	std::transform(rate.begin(), rate.end(), rate.begin(), ::tolower);

	// validate the extension given
	if ((extn != "csv" && extn != "dat"))
	{
		std::cerr << FAIL_STRING << "\n" << FAIL_EXTN << std::endl;
		return 1;
	}

	// create map relating the type of file to the filename and the extension
	std::map<std::string, std::string> datMap;
	populateMap(datMap, extn);

	// check whether the filename is a filetype or filename
	// if the filetype exists it will be replaced by the right filename
	if (datMap.find(file) != datMap.end())
	{
		file = datMap[file];	
	}

	// add the data folder, to point towards the 'data' subdirectory which holds all the files
	file = "data/" + file;

	// validate the arguments
	bool sleep = true;
	if (rate != "real_time" && rate != "no_sleep")
	{
		std::cerr << FAIL_STRING << "\n" << FAIL_RATE << std::endl;
		return 1;
	} else {
		if (rate == "no_sleep")
		{
			sleep = false;
		}
	}
	
	std::ifstream ifile;

	// open .dat or .csv file
	if (extn == "dat")
	{
		ifile.open( file, std::ios::in | std::ios::binary | std::ios::ate );
	}
	else
	{
		ifile.open(file);
	}

	// make sure our file actually exists
	if(ifile.fail())
	{ 
		std::cerr << FAIL_STRING << "\n" << FAIL_FILE << std::endl;
		return 1; 
	}
	
	if (extn == "dat")
	{
		outputDAT(ifile, sleep);
	}
	else if (extn == "csv")
	{
		outputCSV(ifile, sleep);
	}
	return 0;
}

/* output DAT file data */
void outputDAT(std::ifstream &ifile, bool sleep)
{
	// declarations
	size_t size = 0; 
	char* data = 0;

	// get file size and calculate number of blobs
	ifile.seekg(0, std::ios::end); 
	size = ifile.tellg() ; 
	int num_blobs = size / BLOB;

	// go to begining of file to read for real
	ifile.seekg(0, std::ios::beg); 

	// make our character (byte) buffer and read into it
	data = new char[size+1]; 
	ifile.read(data, size);
	data[size] = '\0';

	//output blob of data
	size_t count = 0;
	int last_blob = size - BLOB;
	while(count < size){

		std::string out_string = "";

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
		std::cout << out_string << std::endl;
		if (sleep)
		{
			std::this_thread::sleep_for (std::chrono::seconds(5));
		}
	}
}

void outputCSV(std::ifstream& ifile, bool sleep)
{
	std::string output;	
	while(std::getline(ifile, output))
	{
		std::cout << output << std::endl;
		if (sleep)
		{
			std::this_thread::sleep_for (std::chrono::seconds(2));
		}
	}
	
}

/* Map that maps the file type to the file name */
void populateMap(std::map<std::string, std::string> &map, const std::string &extn)
{
	if (extn == "csv")
	{
		map["dummy"] = "flight_data.csv";
		map["normal"] = "flight_data.csv";
		map["fast"] = "flight_data.csv";
		map["high"] = "flight_data.csv";
		map["building"] = "flight_data.csv";
	}

	if (extn == "dat")
	{
		map["dummy"] = "FLY000.DAT";
		map["normal"] = "FLY000.DAT";
		map["fast"] = "FLY000.DAT";
		map["high"] = "FLY000.DAT";
		map["building"] = "FLY000.DAT";
	}
	
}