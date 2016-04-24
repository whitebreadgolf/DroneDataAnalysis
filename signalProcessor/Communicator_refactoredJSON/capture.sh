#! /bin/bash
PWD=$(pwd)
sshpass -p "19881209" ssh -o StrictHostKeyChecking=no root@192.168.1.2 << EOF
	killall tcpdump
	killall ssh
	exit
	#must also exit out of packets dropped console... 
EOF
echo "raspberry" | sudo sshpass -p '19881209' scp root@192.168.1.2:dji-dump-123.pcap ${PWD}

