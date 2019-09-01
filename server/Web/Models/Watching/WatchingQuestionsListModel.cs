using System.Collections.Generic;
using System.Linq;
using Pobs.Domain.Entities;

namespace Pobs.Web.Models.Watching
{
    public class WatchingQuestionsListModel
    {
        public WatchingQuestionsListModel() { }
        public WatchingQuestionsListModel(IEnumerable<Watch> watches)
        {
            this.Questions = watches.Select(x => new WatchingQuestionListItemModel(x)).ToArray();
            this.LastWatchId = watches.Any() ? watches.Min(x => x.Id) : 0;
        }

        public WatchingQuestionListItemModel[] Questions { get; set; }
        public long LastWatchId { get; set; }
    }
}