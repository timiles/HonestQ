using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using Newtonsoft.Json;
using Pobs.Domain;
using Pobs.Domain.Entities;
using Pobs.Tests.Integration.Helpers;
using Pobs.Web.Models.Questions;
using Xunit;

namespace Pobs.Tests.Integration.Questions
{
    public class IndexQuestionsTests : IDisposable
    {
        private readonly string _url = "/api/questions";
        private readonly int _questionUserId;
        private readonly int _answerUserId;
        private readonly Topic _topic;

        public IndexQuestionsTests()
        {
            var questionUser = DataHelpers.CreateUser();
            _questionUserId = questionUser.Id;
            var answerUser = DataHelpers.CreateUser();
            _answerUserId = answerUser.Id;
            // Create multiple Questions and Answers
            _topic = DataHelpers.CreateTopic(questionUser, 2, answerUser, 3, isApproved: true);
        }

        [Fact]
        public async Task ShouldGetAllQuestions()
        {
            using (var server = new IntegrationTestingServer())
            using (var client = server.CreateClient())
            {
                // PRIVATE BETA
                client.AuthenticateAs(_questionUserId);

                var response = await client.GetAsync(_url);
                response.EnsureSuccessStatusCode();

                var responseContent = await response.Content.ReadAsStringAsync();
                var responseModel = JsonConvert.DeserializeObject<QuestionsListModel>(responseContent);
                foreach (var responseQuestion in responseModel.Questions)
                {
                    var question = _topic.Questions.FirstOrDefault(x => x.Id == responseQuestion.Id);
                    if (question != null)
                    {
                        Assert.Equal(question.Slug, responseQuestion.Slug);
                        Assert.Equal(question.Text, responseQuestion.Text);
                        Assert.Equal(3, responseQuestion.AnswersCount);
                    }
                }
            }
        }

        public void Dispose()
        {
            DataHelpers.DeleteUser(_answerUserId);
            DataHelpers.DeleteUser(_questionUserId);
        }
    }
}
