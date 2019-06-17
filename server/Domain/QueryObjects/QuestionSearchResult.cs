using Pobs.Domain.Entities;

namespace Pobs.Domain.QueryObjects
{
    public class QuestionSearchResult
    {
        public Question Question { get; set; }
        public double MatchScore { get; set; }
    }
}
