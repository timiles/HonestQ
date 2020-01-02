using System;

namespace ExpoClient.Models
{
    public class PushTicketModel
    {
        public string Status { get; set; }
        public Guid? Id { get; set; }
        public string Message { get; set; }
        public DetailsModel Details { get; set; }

        public class DetailsModel
        {
            public string Error { get; set; }
        }
    }
}
