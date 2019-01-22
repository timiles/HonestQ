using System.Collections.Generic;
using System.Linq;
using Pobs.Domain.Entities;

namespace Pobs.Web.Models.Questions
{
    public class QuestionSearchResultsModel
    {
        public QuestionSearchResultsModel(IEnumerable<Question> questions, int pageNumber, int pageSize)
        {
            this.Questions = questions.Select(x => new QuestionListItemModel(x)).ToArray();
            this.PageNumber = pageNumber;
            this.PageSize = pageSize;
        }

        public QuestionListItemModel[] Questions { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
    }
}