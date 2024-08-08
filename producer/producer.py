from confluent_kafka import Producer

p = Producer({'bootstrap.servers': 'localhost:9092'})

def delivery_report(err, msg):
    if err is not None:
        print(f'Message delivery failed: {err}')
    else:
        print(f'Message delivered to {msg.topic()} [{msg.partition()}]')

p.produce('my-topic', key='key', value='Hello, Kafka!', callback=delivery_report)

# Wait up to 1 second for events. Callbacks will be invoked during
# this method call if the message is acknowledged.
p.flush(1)
