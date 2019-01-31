using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using Pobs.Domain.Entities;

namespace Pobs.Web.Models.Questions
{
    public class QuestionSearchResultsModel
    {
        public QuestionSearchResultsModel() { }
        public QuestionSearchResultsModel(string query, int pageNumber, int pageSize, IEnumerable<Question> questions)
        {
            this.Query = query;
            this.PageNumber = pageNumber;
            this.PageSize = pageSize;
            this.Questions = questions.Select(x => new QuestionListItemModel(x)).ToArray();
        }

        [Required]
        public string Query { get; set; }
        public int PageNumber { get; set; }
        public int PageSize { get; set; }
        public QuestionListItemModel[] Questions { get; set; }
    }
}