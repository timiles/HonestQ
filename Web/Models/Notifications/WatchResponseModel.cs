using System.Linq;
using Pobs.Domain.Entities;

namespace Pobs.Web.Models.Notifications
{
    public class WatchResponseModel
    {
        public WatchResponseModel() { }
        public WatchResponseModel(IHasWatches hasWatches, int loggedInUserId)
        {
            this.NewCount = hasWatches.Watches.Count();
            this.IsWatchedByLoggedInUser = hasWatches.Watches.Any(x => x.UserId == loggedInUserId);
        }

        public int NewCount { get; set; }
        public bool IsWatchedByLoggedInUser { get; set; }
    }
}