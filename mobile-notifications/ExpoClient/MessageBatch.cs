using System.Collections.Generic;

namespace ExpoClient.Models
{
    internal sealed class MessageBatch<TId> : List<PushMessageModel<TId>>
    {
        public int MessageCount { get; private set; }

        public new void Add(PushMessageModel<TId> message)
        {
            base.Add(message);
            MessageCount += message.To.Count;
        }
    }
}
