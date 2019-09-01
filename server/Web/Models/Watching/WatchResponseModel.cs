using System.Linq;
using Pobs.Domain.Entities;

namespace Pobs.Web.Models.Watching
{
    public class WatchResponseModel
    {
        public WatchResponseModel() { }
        public WatchResponseModel(IHasWatches hasWatches, int loggedInUserId)
        {
            this.Watching = hasWatches.Watches.Any(x => x.UserId == loggedInUserId);
        }

        public bool Watching { get; set; }
    }
}