using System;
using Confluent.Kafka;

class Program
{
  public static void Main(string[] args)
  {
    var conf = new ConsumerConfig
    { 
      GroupId = "test-consumer-group",
      BootstrapServers = "localhost:9092",
      // Note: The auto.offset.reset property determines the start offset in the event
      // there are not yet any committed offsets for the consumer group for the
      // partition(s) being assigned. By default, it is set to latest, which means that the
      // consumer will only start reading messages that are produced after it has
      // successfully subscribed to the topic. To read from the beginning, set it to earliest.
      AutoOffsetReset = AutoOffsetReset.Earliest
    };

    using (var c = new ConsumerBuilder<Ignore, string>(conf).Build())
    {
      c.Subscribe("my-topic");

      CancellationTokenSource cts = new CancellationTokenSource();
      Console.CancelKeyPress += (_, e) => {
        e.Cancel = true; // prevent the process from terminating.
        cts.Cancel();
      };

      try
      {
        while (true)
        {
          try
          {
            var cr = c.Consume(cts.Token);
            Console.WriteLine($"Consumed message '{cr.Value}' at: '{cr.TopicPartitionOffset}'.");
          }
          catch (ConsumeException e)
          {
            Console.WriteLine($"Error occurred: {e.Error.Reason}");
          }
        }
      }
      catch (OperationCanceledException)
      {
        // Ensure the consumer leaves the group cleanly and final offsets are committed.
        c.Close();
      }
    }
  }
}

