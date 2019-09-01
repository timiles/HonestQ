using System.Collections.Generic;
using System.Linq;
using Pobs.Domain.Entities;

namespace Pobs.Web.Models.Watching
{
    public class WatchingAnswersListModel
    {
        public WatchingAnswersListModel() { }
        public WatchingAnswersListModel(IEnumerable<Watch> watches)
        {
            this.Answers = watches.Select(x => new WatchingAnswerListItemModel(x)).ToArray();
            this.LastWatchId = watches.Any() ? watches.Min(x => x.Id) : 0;
        }

        public WatchingAnswerListItemModel[] Answers { get; set; }
        public long LastWatchId { get; set; }
    }
}