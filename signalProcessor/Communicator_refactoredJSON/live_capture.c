#include <time.h>
#include <pthread.h>
#include <stdio.h>
#include <errno.h>
#include <string.h>
#include <stdlib.h>


typedef enum {e_ONE, e_TWO} state;

pthread_mutex_t l_capture = PTHREAD_MUTEX_INITIALIZER;
pthread_cond_t  c_done    = PTHREAD_COND_INITIALIZER;
pthread_mutex_t l_var     = PTHREAD_MUTEX_INITIALIZER;
pthread_cond_t  c_ready   = PTHREAD_COND_INITIALIZER;

void*
openbox(void* data)
{
        int oldtype;

        /* allow the thread to be killed at any time */
        pthread_setcanceltype(PTHREAD_CANCEL_ASYNCHRONOUS, &oldtype);
        system("./openbox.sh"); 

        /* wake up the caller if we've completed in time */
        pthread_cond_signal(&c_done);
        return NULL;
}

void* 
parser() 
{
        int cycle = 0;
        while (1) {
                if (cycle == 0) {
                        /* lock for running tcpdump in the box */
                        pthread_mutex_lock(&l_var);
                        /* now returned from tcpdump, we have pcap 
                           critical secton for processing the pcap */
                        cycle = 1;
                }
                printf("%s\n", "In critical section 2");
                system("tshark -r dji-dump-123.pcap -z \"follow,tcp,hex,0\" | awk '/=====+/{p=1;print;next} p&&/^=====+/{p=0};p' | sed -e '1,5d' | sed -e '$ d' | sed -e 's/\t/    /g' > dji-dump-123.hex");
                system("php dji_parse_wireshark_hexdump.php dji-dump-123.hex 2>&1 | sed -e '/^PHP Notice/d' > dji-dump-123.txt"); 
                /* fill data.txt with  */
                system("./organize.sh");
                system("java Parser"); //actually just gets latest datapoints
                system("java POSTClass"); //actually just runs the decoding algorithm
                system("java -jar DataPush.jar"); //the name matches here, this pushes it to the user interface
		//delete EVERYTHING after parser is done
		system("rm -f dji-dump-123.pcap");
        	system("rm -f dji-dump-123.hex"); 
        	system("rm -f dji-dump-123.txt");       
        	system("rm -f rawdata.txt");
        	system("rm -f data.txt");       
        	system("rm -f decodeddata.txt");
                /* ready to start next round of capture */
                pthread_cond_signal(&c_ready);
                pthread_mutex_unlock(&l_var);

                pthread_cond_wait(&c_ready, &l_var);

                /* returns from capture */
                printf("%s\n", "thread 2 woken");
        }
}

void
do_or_timeout(struct timespec* max_wait)
{
        struct timespec abs_time;
        pthread_t tid; /* run tcpdump, scp pcap into pi */
        pthread_t pid; /* run tshark to hex, php to text, send to karl */

        /* pthread cond_timedwait expects 
         * an absolute time to wait until */
        clock_gettime(CLOCK_REALTIME, &abs_time);
        abs_time.tv_sec += max_wait->tv_sec;
        abs_time.tv_nsec += max_wait->tv_nsec;

        /* we want to make the second thread wait on the first */
        /* into critical section */
        pthread_mutex_lock(&l_var); 

        /* create parser thread */
        pthread_create(&pid, NULL, parser, NULL);

        /** 
         * pthread_cond_timedwait can return spuriously: 
         * this should be in a loop for production code
         */
        state sm_1 = e_ONE;
        while (1) { 
                if (sm_1 == e_ONE) {
                        /* start capture, critical section */
                        pthread_mutex_lock(&l_capture);    
                        pthread_create(&tid, NULL, openbox, NULL);
                        int err = pthread_cond_timedwait(&c_done, 
                                        &l_capture, &abs_time);    
                        /* give up lock when error or timeout */
                        if (!err) {
                                pthread_mutex_unlock(&l_capture);
                        } else if (err == ETIMEDOUT) {
                                fprintf(stderr, 
                                                "%s: capture timed out\n", 
                                                __func__);
                                pthread_mutex_unlock(&l_capture);
                        }
                        sm_1 = e_TWO; 
                } else if (sm_1 == e_TWO) {
                        /* still in CR of l_var */
                        printf("%s\n", "In critical section 1");

                        /* get data pcap from box */
                        system("./capture.sh"); 

                        /* ready for pcap clean up, 
                         * signal the parser thread */
                        pthread_cond_signal(&c_ready);
                        pthread_mutex_unlock(&l_var); 

                        /* wait for the parser thread 
                         * to wake this one up */
                        pthread_cond_wait(&c_ready, &l_var);
                        printf("%s\n", "thread 1 woken");
                        sm_1 = e_ONE;
                } 
        }    
}

int 
main()
{
	//delete EVERYTHING before program starts
	system("rm -f dji-dump-123.pcap");
	system("rm -f dji-dump-123.hex"); 
	system("rm -f dji-dump-123.txt");	
	system("rm -f rawdata.txt");
	system("rm -f data.txt");	
        system("rm -f decodeddata.txt");

        struct timespec max_wait;

        memset(&max_wait, 0, sizeof(max_wait));

        /* wait at most 30 seconds */
        max_wait.tv_sec = 5;
        do_or_timeout(&max_wait);

        return 0;
}
