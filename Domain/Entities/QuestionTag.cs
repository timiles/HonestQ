using Pobs.Domain.Entities.Helpers;

namespace Pobs.Domain.Entities
{
    public class QuestionTag : IJoinEntity<Question>, IJoinEntity<Tag>
    {
        public int QuestionId { get; set; }
        public Question Question { get; set; }
        Question IJoinEntity<Question>.Navigation
        {
            get => Question;
            set => Question = value;
        }

        public int TagId { get; set; }
        public Tag Tag { get; set; }
        Tag IJoinEntity<Tag>.Navigation
        {
            get => Tag;
            set => Tag = value;
        }
    }
}
