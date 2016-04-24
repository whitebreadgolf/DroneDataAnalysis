#! /bin/bash

sshpass -p "19881209" ssh -o StrictHostKeyChecking=no root@192.168.1.2 << EOF 
   rm dji-dump-123.pcap
   tcpdump -ns 0 -i br-lan -w - port 2001  > dji-dump-123.pcap 
   exit

EOF
