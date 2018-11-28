using System.Linq;
using Pobs.Domain.Entities;

namespace Pobs.Web.Models.Notifications
{
    public class WatchResponseModel
    {
        public WatchResponseModel() { }
        public WatchResponseModel(IHasWatches hasWatches, int loggedInUserId)
        {
            this.IsWatchedByLoggedInUser = hasWatches.Watches.Any(x => x.UserId == loggedInUserId);
        }

        public bool IsWatchedByLoggedInUser { get; set; }
    }
}