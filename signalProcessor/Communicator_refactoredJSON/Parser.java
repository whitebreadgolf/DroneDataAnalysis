import java.io.BufferedReader;
import java.io.FileNotFoundException;
import java.io.FileReader;
import java.io.IOException;
import java.io.PrintWriter;

public class Parser {


	public Parser() throws FileNotFoundException, IOException {
		// TODO Auto-generated method stub
		PrintWriter writer = new PrintWriter("data.txt", "UTF-8");
		try (BufferedReader br = new BufferedReader(new FileReader("rawdata.txt"))) {
		    String line;
		    while ((line = br.readLine()) != null) {
		    	StringBuffer freshData = new StringBuffer("");
		    	String[] tokens = line.split(" ");
		    	for(int i = 0; i < tokens.length; i++) {
		    		if(tokens[i].equals("cmd")) {
		    			String tmp = tokens[i + 1];
		    			freshData.append(tmp.charAt(2));
		    			freshData.append(tmp.charAt(3));
		    		} else if (tokens[i].equals("data:")) {
		    			String tmp = tokens[i + 1];
		    			tmp = tmp.substring(1, tmp.length()-1);
		    			freshData.append(tmp);
		    		}
		    	}
		    	String data = freshData.toString();
		    	if(data.length() > 4) {
		    		writer.println(data);
		    		writer.flush();
		    	}
		    	//System.out.println(data);
		       // process the line.
		    }
		}
		writer.close();
	}
	public static void main(String[] args) throws FileNotFoundException, IOException {
		new Parser();
	}
}
