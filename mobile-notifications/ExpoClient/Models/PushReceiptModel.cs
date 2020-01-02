namespace ExpoClient.Models
{
    public class PushReceiptModel
    {
        public string Status { get; set; }
        public string Message { get; set; }
        public DetailsModel Details { get; set; }

        public class DetailsModel
        {
            public string Error { get; set; }
        }
    }
}
