using Pobs.Domain.Entities.Helpers;

namespace Pobs.Domain.Entities
{
    public class PopTopic : IJoinEntity<Pop>, IJoinEntity<Topic>
    {
        public int PopId { get; set; }
        public Pop Pop { get; set; }
        Pop IJoinEntity<Pop>.Navigation
        {
            get => Pop;
            set => Pop = value;
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
