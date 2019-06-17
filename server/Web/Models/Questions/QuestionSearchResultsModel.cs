using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using Pobs.Domain.Entities;

namespace Pobs.Web.Models.Questions
{
    public class QuestionSearchResultsModel
    {
        public QuestionSearchResultsModel() { }
        public QuestionSearchResultsModel(string query, int pageNumber, int pageSize, IEnumerable<Question> questions, bool more)
        {
            this.Query = query;
            this.PageNumber = pageNumber;
            this.PageSize = pageSize;
            this.Questions = questions.Select(x => new QuestionListItemModel(x)).ToArray();
            this.More = more;
        }

        [Required]
        public string Query { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public QuestionListItemModel[] Questions { get; set; }
        public bool More { get; set; }
    }
}