using System;
using System.Collections.Generic;

namespace ExpoClient.Models
{
    internal sealed class GetReceiptsResponseModel
    {
        public IDictionary<Guid, PushReceiptModel> Data { get; set; }
    }
}
