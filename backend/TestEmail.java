import java.util.Properties;
import javax.mail.*;
import javax.mail.internet.*;

public class TestEmail {
    public static void main(String[] args) {
        String username = "urbandec.in@gmail.com";
        String password = "zjij kiuf yxfl gypd";
        
        Properties props = new Properties();
        props.put("mail.smtp.auth", "true");
        props.put("mail.smtp.starttls.enable", "true");
        props.put("mail.smtp.host", "smtp.gmail.com");
        props.put("mail.smtp.port", "587");
        
        Session session = Session.getInstance(props, new Authenticator() {
            protected PasswordAuthentication getPasswordAuthentication() {
                return new PasswordAuthentication(username, password);
            }
        });
        
        try {
            Transport transport = session.getTransport("smtp");
            transport.connect();
            System.out.println("Connection successful!");
            transport.close();
        } catch (Exception e) {
            System.err.println("Connection failed: " + e.getMessage());
        }
    }
}
