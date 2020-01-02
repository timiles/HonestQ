using System.Collections.Generic;
using System.Threading.Tasks;
using ExpoClient.Models;

namespace Pobs.NotificationsApp.Batching
{
    internal interface INotificationsBatcher
    {
        Task<IEnumerable<PushMessageModel<long>[]>> CreateBatchesAsync(long sinceNotificationId);
    }
}