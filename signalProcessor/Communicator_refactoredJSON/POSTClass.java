import java.io.BufferedReader;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.util.ArrayList;
import java.io.PrintWriter;

public class POSTClass {
	public POSTClass() throws FileNotFoundException, IOException {
		// TODO Auto-generated method stub
		//first load all the data into an array
		try (BufferedReader br = new BufferedReader(new FileReader("data.txt"))) {
			String line;
			int iterator = 0;
			PrintWriter writer = new PrintWriter("decodeddata.txt", "UTF-8");
		    while ((line = br.readLine()) != null) {
		    	String cmd = "./dji-phantom" + " -x  "  + line;
		    	Process pr = Runtime.getRuntime().exec(cmd);
		    	BufferedReader stdInput = new BufferedReader(new InputStreamReader(pr.getInputStream()));
			BufferedReader stdError = new BufferedReader(new InputStreamReader(pr.getErrorStream()));
		    	//System.out.println("Program output: " + iterator);
		    	String s = null;
		    	while ((s = stdInput.readLine()) != null) {
		    	    System.out.println(s);
			    writer.println(s);
			    writer.flush();
		    	}
			// read any errors from the attempted command
			//System.out.println("Here is the standard error of the command (if any):\n");
			while ((s = stdError.readLine()) != null) {
			    System.out.println(s);
		            writer.println(s);
			    writer.flush();
			}
		    }
		}
	}
	public static void main(String[] args) throws FileNotFoundException, IOException {
		new POSTClass();
	}
}
