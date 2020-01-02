using System;
using System.IO;
using System.Text;
using System.Threading.Tasks;
using Amazon.KeyManagementService;
using Amazon.KeyManagementService.Model;
using Amazon.Lambda.Core;

namespace Pobs.MobileNotifications.NotificationsApp
{
    public class Function
    {
        public void FunctionHandler(ILambdaContext context)
        {
            var webConnectionString = DecodeEnvVar("HonestQWeb_ConnectionString").Result;
            var notificationsConnectionString = DecodeEnvVar("HonestQNotifications_ConnectionString").Result;

            var notificationRunner = new NotificationsRunner(webConnectionString, notificationsConnectionString, context.Logger.LogLine);
            Task.WaitAll(notificationRunner.RunAsync());
        }

        // Decrypt code should run once and variables stored outside of the
        // function handler so that these are decrypted once per container
        private static async Task<string> DecodeEnvVar(string envVarName)
        {
            // Retrieve env var text
            var encryptedBase64Text = Environment.GetEnvironmentVariable(envVarName);
            // Convert base64-encoded text to bytes
            var encryptedBytes = Convert.FromBase64String(encryptedBase64Text);
            // Construct client
            using (var client = new AmazonKeyManagementServiceClient())
            {
                // Construct request
                var decryptRequest = new DecryptRequest
                {
                    CiphertextBlob = new MemoryStream(encryptedBytes),
                };
                // Call KMS to decrypt data
                var response = await client.DecryptAsync(decryptRequest);
                using (var plaintextStream = response.Plaintext)
                {
                    // Get decrypted bytes
                    var plaintextBytes = plaintextStream.ToArray();
                    // Convert decrypted bytes to ASCII text
                    var plaintext = Encoding.UTF8.GetString(plaintextBytes);
                    return plaintext;
                }
            }
        }
    }
}
