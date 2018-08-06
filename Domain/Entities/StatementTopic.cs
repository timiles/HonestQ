using Pobs.Domain.Entities.Helpers;

namespace Pobs.Domain.Entities
{
    public class StatementTopic : IJoinEntity<Statement>, IJoinEntity<Topic>
    {
        public int StatementId { get; set; }
        public Statement Statement { get; set; }
        Statement IJoinEntity<Statement>.Navigation
        {
            get => Statement;
            set => Statement = value;
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
