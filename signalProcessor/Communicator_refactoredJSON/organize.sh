#! /bin/bash
rm -f rawdata.txt
grep -w 0x32 dji-dump-123.txt > rawdata.txt
grep -w 0x49 dji-dump-123.txt >> rawdata.txt
grep -w 0x53 dji-dump-123.txt >> rawdata.txt
