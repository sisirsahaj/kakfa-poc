from confluent_kafka import Producer
import threading
import time
import random

def create_producer(bootstrap_servers):
    return Producer({'bootstrap.servers': bootstrap_servers})

def send_message(producer, topic, key, value):
    def delivery_report(err, msg):
        if err is not None:
            print(f'Message delivery failed: {err}')
        else:
            print(f'Message delivered to {msg.topic()} [{msg.partition()}]')
    
    producer.produce(topic, key=key, value=value, callback=delivery_report)
    # Wait up to 1 second for events. Callbacks will be invoked during
    # this method call if the message is acknowledged.
    producer.flush(1)

def producer_thread(bootstrap_servers, topic, device_id):
    producer = create_producer(bootstrap_servers)
    while True:
        # Simulate ECG data as a random integer (for demonstration purposes)
        ecg_data = random.randint(500, 1000)
        key = f'device-{device_id}'
        value = f'{ecg_data}'
        print(f'Sending ECG data from {key}: {value}')
        send_message(producer, topic, key, str(value))
        time.sleep(1)  # Transmit data every second

# Create multiple ECG device instances
for i in range(1):  # Adjust the range for the desired number of ECG devices
    threading.Thread(target=producer_thread, args=('localhost:9092', 'my-topic', i)).start()