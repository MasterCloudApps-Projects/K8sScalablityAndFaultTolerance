package es.codeurjc.rabbitmqproducer;

import com.rabbitmq.client.ConnectionFactory;
import com.rabbitmq.client.Connection;
import com.rabbitmq.client.Channel;
import java.util.Date;
import java.text.SimpleDateFormat;


public class Send
{
    private final static String QUEUE_NAME = "hello";
    public static void main(String[] argv) throws Exception {
        ConnectionFactory factory = new ConnectionFactory();
        factory.setHost(System.getenv().getOrDefault("RABBITMQ_HOST", "localhost"));
        factory.setUsername(System.getenv().getOrDefault("RABBITMQ_USERNAME", "guest"));
        factory.setPassword(System.getenv().getOrDefault("RABBITMQ_PASSWORD", "guest"));

        int numOfMessages = Integer.parseInt(System.getenv().getOrDefault("NUM_OF_MESSAGES", "10"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        try (Connection connection = factory.newConnection();
             Channel channel = connection.createChannel()) {
                channel.queueDeclare(QUEUE_NAME, false, false, false, null);
                for (int n = 1; n<=numOfMessages; n++) {
                    Date date = new Date(System.currentTimeMillis());
                    System.out.println(formatter.format(date));
                    String message = String.format("%s [%d/%d]", formatter.format(date), n, numOfMessages);
                    channel.basicPublish("", QUEUE_NAME, null, message.getBytes());
                    System.out.println("[x] Sent '" + message + "'");
                }
        }
    }
}
