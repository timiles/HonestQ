using ExpoClient.Models;
using Newtonsoft.Json;
using System.Collections.Generic;
using System.Linq;

namespace ExpoClient
{
    public interface IPushMessageBatcher<TId>
    {
        void Add(TId id, string to, string title, string body, object data);
        IEnumerable<PushMessageModel<TId>[]> GetBatches();
    }

    public class PushMessageBatcher<TId> : IPushMessageBatcher<TId>
    {
        private readonly IDictionary<string, PushMessageModel<TId>> _notifications;
        private readonly int _maxMessageCountPerBatch;

        public PushMessageBatcher(int maxMessageCountPerBatch = 100)
        {
            _maxMessageCountPerBatch = maxMessageCountPerBatch;
            _notifications = new Dictionary<string, PushMessageModel<TId>>();
        }

        public void Add(TId id, string to, string title, string body, object data)
        {
            var key = $"{title}|{body}|{JsonConvert.SerializeObject(data)}";
            if (_notifications.ContainsKey(key))
            {
                _notifications[key].Ids.Add(id);
                _notifications[key].To.Add(to);
            }
            else
            {
                _notifications.Add(key,
                    new PushMessageModel<TId>
                    {
                        Ids = new List<TId> { id },
                        To = new List<string> { to },
                        Title = title,
                        Body = body,
                        Data = data,
                    });
            }
        }

        public IEnumerable<PushMessageModel<TId>[]> GetBatches()
        {
            var ordered = _notifications.Values.OrderByDescending(x => x.To.Count).ToList();
            var batch = new MessageBatch<TId>();
            foreach (var message in ordered)
            {
                // If message fits, add it to the current batch
                if (batch.MessageCount + message.To.Count <= _maxMessageCountPerBatch)
                {
                    batch.Add(message);
                    continue;
                }
                if (batch.MessageCount == _maxMessageCountPerBatch)
                {
                    yield return batch.ToArray();
                    batch = new MessageBatch<TId>();
                    batch.Add(message);
                    continue;
                }
                // We will overflow the current batch, so let's split this message out into multiple batches
                int skip = 0;
                while (batch.MessageCount + message.To.Count > _maxMessageCountPerBatch &&
                    skip < message.To.Count)
                {
                    var splitMessage = new PushMessageModel<TId>
                    {
                        To = message.To.Skip(skip).Take(_maxMessageCountPerBatch - batch.MessageCount).ToList(),
                        Title = message.Title,
                        Body = message.Body,
                        Data = message.Data,
                    };
                    batch.Add(splitMessage);
                    yield return batch.ToArray();

                    batch = new MessageBatch<TId>();
                    skip += _maxMessageCountPerBatch;
                }
            }
            if (batch.MessageCount > 0)
            {
                // Any messages left in final batch, return them
                yield return batch.ToArray();
            }
        }
    }
}
