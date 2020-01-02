using System.Net.Http;
using System.Threading.Tasks;
using ExpoClient.Models;
using Newtonsoft.Json;
using System.Text;
using System.Collections.Generic;
using Newtonsoft.Json.Serialization;
using System.Net;
using System;

namespace ExpoClient
{
    public interface INotificationSender
    {
        Task<PushTicketModel[]> SendAsync(IEnumerable<PushMessageModel> request);
    }

    public class NotificationSender : INotificationSender
    {
        public async Task<PushTicketModel[]> SendAsync(IEnumerable<PushMessageModel> pushMessages)
        {
            var handler = new HttpClientHandler();
            if (handler.SupportsAutomaticDecompression)
            {
                handler.AutomaticDecompression = DecompressionMethods.GZip | DecompressionMethods.Deflate;
            }
            using (var client = new HttpClient(handler))
            using (var payload = new SendRequestModel(pushMessages).ToJsonContent())
            {
                var response = await client.PostAsync("https://exp.host/--/api/v2/push/send", payload);
                var responseContent = await response.Content.ReadAsStringAsync();

                switch (response.StatusCode)
                {
                    case System.Net.HttpStatusCode.OK:
                        {
                            var responseModel = JsonConvert.DeserializeObject<SendResponseModel>(responseContent);
                            return responseModel.Data;
                        }
                    default:
                        throw new System.Exception($"Status {response.StatusCode}, Content {responseContent}.");
                }
            }
        }

        public async Task<IDictionary<Guid, PushReceiptModel>> GetReceiptsAsync(params Guid[] ids)
        {
            var handler = new HttpClientHandler();
            if (handler.SupportsAutomaticDecompression)
            {
                handler.AutomaticDecompression = DecompressionMethods.GZip | DecompressionMethods.Deflate;
            }
            using (var client = new HttpClient(handler))
            using (var payloadJson = new GetReceiptsRequestModel(ids).ToJsonContent())
            {
                var response = await client.PostAsync("https://exp.host/--/api/v2/push/getReceipts", payloadJson);
                var responseContent = await response.Content.ReadAsStringAsync();

                switch (response.StatusCode)
                {
                    case System.Net.HttpStatusCode.OK:
                        {
                            var responseModel = JsonConvert.DeserializeObject<GetReceiptsResponseModel>(responseContent);
                            return responseModel.Data;
                        }
                    default:
                        throw new System.Exception($"Status {response.StatusCode}, Content {responseContent}.");
                }
            }
        }
    }

    public static class Extensions
    {
        private static readonly JsonSerializerSettings _jsonContentSerializerSettings =
            new JsonSerializerSettings
            {
                ContractResolver = new DefaultContractResolver
                {
                    NamingStrategy = new CamelCaseNamingStrategy()
                },
            };

        public static HttpContent ToJsonContent(this object o)
        {
            var json = JsonConvert.SerializeObject(o, _jsonContentSerializerSettings);
            return new StringContent(json, Encoding.UTF8, "application/json");
        }
    }
}
