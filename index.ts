import amqp from "amqplib/callback_api";
import 'dotenv/config'
try {
  const options = {
    username: process.env.USER_AMQP,
    password: process.env.PASSWORD_AQMP,
    port: 5672,
  };

  const urlAMQP = process.env.URL_AMQP || '';

  amqp.connect(urlAMQP, options, (error, connection) => {
    if (error) throw error;

    connection.createChannel((error, channel) => {
      if (error) throw error;

      const queue = process.env.QUEUE || "";

      channel.assertQueue(
        queue,
        {
          durable: true,
        },
        (error, queue) => {
          if (error) throw error;

          console.log('conectado')

          channel.consume(queue.queue, (msg) => {
            if (msg) console.log("mensaje: " + msg.content.toString());
            let order
            if(msg)
            order = JSON.parse(msg.content.toString())
            
            const payment = {
              payConcept: order
            }

            
            fetch(`${process.env.URL_APIPAYMENT}/payment`, {
              method: "POST",
              body: JSON.stringify(payment),
              headers:{
                "Content-Type": "application/json"
              }
            })
            .then(res => res.json())
            .then(data => console.log(data))

          }, {noAck: true});
        }
      );
    });
  });
} catch (e: any) {
  console.log(e);
}
