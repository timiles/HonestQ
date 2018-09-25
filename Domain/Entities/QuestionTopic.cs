using Pobs.Domain.Entities.Helpers;

namespace Pobs.Domain.Entities
{
    public class QuestionTopic : IJoinEntity<Question>, IJoinEntity<Topic>
    {
        public int QuestionId { get; set; }
        public Question Question { get; set; }
        Question IJoinEntity<Question>.Navigation
        {
            get => Question;
            set => Question = value;
        }

        public int TopicId { get; set; }
        public Topic Topic { get; set; }
        Topic IJoinEntity<Topic>.Navigation
        {
            get => Topic;
            set => Topic = value;
        }
    }
}
