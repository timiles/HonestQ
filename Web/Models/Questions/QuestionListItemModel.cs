using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using Pobs.Domain;
using Pobs.Domain.Entities;
using Pobs.Web.Models.Tags;

namespace Pobs.Web.Models.Questions
{
    public class QuestionListItemModel
    {
        public QuestionListItemModel() { }
        public QuestionListItemModel(Question question)
        {
            this.Id = question.Id;
            this.Slug = question.Slug;
            this.Text = question.Text;
            this.Tags = question.Tags.Where(x => x.IsApproved).Select(x => new TagValueModel(x)).ToArray();
            this.AnswersCount = question.Answers.Count();

            if (!question.Answers.Any())
            {
                this.MostRecentActivityPostedAt = question.PostedAt.DateTime;
            }
            else
            {
                var mostRecentAnswer = question.Answers.Max(x => x.PostedAt).UtcDateTime;
                var allComments = question.Answers.SelectMany(x => x.Comments);
                if (!allComments.Any())
                {
                    this.MostRecentActivityPostedAt = mostRecentAnswer;
                }
                else
                {
                    var mostRecentComment = allComments.Max(x => x.PostedAt).UtcDateTime;
                    this.MostRecentActivityPostedAt = mostRecentAnswer > mostRecentComment ? mostRecentAnswer : mostRecentComment;
                }
            }
        }

        public int Id { get; set; }

        [Required]
        public string Slug { get; set; }

        [Required]
        public string Text { get; set; }

        public TagValueModel[] Tags { get; set; }

        public int AnswersCount { get; set; }
        public DateTime MostRecentActivityPostedAt { get; set; }
    }
}