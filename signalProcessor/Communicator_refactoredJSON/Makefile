CC=gcc
CXX=g++
JAVAC=javac
CFLAGS=-g -Wall -O -lpthread -lrt 
CXXFLAGS=-g -Wall -O
SCRIPTS=openbox.sh capture.sh organize.sh
PHP_SCRIPT=dji_parse_wireshark_hexdump.php
BINARIES=POSTClass.class Parser.class dji-phantom live_capture 

all: build

POSTClass: POSTClass.java
	$(JAVAC) $^

Parser: Parser.java
	$(JAVAC) $^

JavaClasses: POSTClass Parser

dji-phantom: dji-phantom.cpp
	$(CXX) $^ -o $@ $(CXXFLAGS)

live_capture: live_capture.c
	$(CC) $^ -o $@ $(CFLAGS)

build: $(PHP_SCRIPT) $(SCRIPTS) JavaClasses dji-phantom live_capture 

launch: $(PHP_SCRIPT) $(SCRIPTS) $(BINARIES)
	./live_capture

clean:
	rm -rf *.dSYM
	rm -rf *.class
	rm -rf dji-phantom live_capture
