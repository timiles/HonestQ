using System.Collections.Generic;

namespace ExpoClient.Models
{
    internal sealed class SendRequestModel : List<PushMessageModel>
    {
        public SendRequestModel(IEnumerable<PushMessageModel> collection) : base(collection)
        {
        }
    }
}
