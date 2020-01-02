using System.Collections.Generic;
using Newtonsoft.Json;

namespace ExpoClient.Models
{
    public class PushMessageModel<TId> : PushMessageModel
    {
        [JsonIgnore]
        public List<TId> Ids { get; set; }
    }

    public class PushMessageModel
    {
        public List<string> To { get; set; }
        public string Title { get; set; }
        public string Body { get; set; }
        public object Data { get; set; }
    }
}
