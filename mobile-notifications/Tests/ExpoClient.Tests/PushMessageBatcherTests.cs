using System.Linq;
using NUnit.Framework;

namespace ExpoClient.Tests
{
    public class PushMessageBatcherTests
    {
        [TestCase(1, 1, 1, 1)]
        [TestCase(1, 4, 4, 1)]
        [TestCase(3, 4, 2, 1)]
        [TestCase(5, 7, 2, 2)]
        [TestCase(100, 4, 1, 4)]
        public void BatchTests(int batchSize, int numberOfMessages, int expectedNumberOfBatches, int expectedNumberOfMessagesInLastBatch)
        {
            var pushMessageBatcher = new PushMessageBatcher<long>(batchSize);
            var title = "Title";
            var body = "Body";
            var data = new { };
            for (var i = 0; i < numberOfMessages; i++)
            {
                pushMessageBatcher.Add(i, "User" + i, title, body, data);
            }

            var batches = pushMessageBatcher.GetBatches().ToArray();

            Assert.AreEqual(expectedNumberOfBatches, batches.Length);
            foreach (var message in batches.SelectMany(x => x))
            {
                Assert.AreEqual(title, message.Title);
                Assert.AreEqual(body, message.Body);
                Assert.AreEqual(data, message.Data);
            }

            foreach (var batch in batches.Take(batches.Length - 1))
            {
                Assert.AreEqual(batchSize, batch.Sum(x => x.To.Count));
            }
            var lastBatch = batches.Last();
            Assert.AreEqual(expectedNumberOfMessagesInLastBatch, lastBatch.Sum(x => x.To.Count));
        }
    }
}
