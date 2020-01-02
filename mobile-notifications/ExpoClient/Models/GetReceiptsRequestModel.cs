using System;

namespace ExpoClient.Models
{
    internal sealed class GetReceiptsRequestModel
    {
        public GetReceiptsRequestModel(Guid[] ids)
        {
            this.Ids = ids;
        }

        public Guid[] Ids { get; set; }
    }
}
