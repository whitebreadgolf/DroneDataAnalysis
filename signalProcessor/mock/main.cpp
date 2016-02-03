#include <iostream>
#include <thread>
#include <chrono>

int main(int argc, char* argv[]){

	// infinite loop
	while(true){

		// testing statement for stdout
		std::cout << "{'this is': ['sample', 'json']}" << std::endl;

		// sample rate?
		std::this_thread::sleep_for (std::chrono::seconds(1));
	}

	return 0;
}