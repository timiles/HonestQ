using System;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Pobs.Domain;
using Pobs.Web.Helpers;
using Pobs.Web.Services;
using X.Web.Sitemap;

namespace Pobs.Web.Controllers
{
    public class SitemapController : Controller
    {
        private readonly ITagService _tagService;
        private readonly IQuestionService _questionService;
        private readonly AppSettings _appSettings;

        public SitemapController(ITagService tagService, IQuestionService questionService, IOptions<AppSettings> appSettings)
        {
            this._tagService = tagService;
            this._questionService = questionService;
            this._appSettings = appSettings.Value;
        }

        // Cache for 1 day since we currently have ChangeFrequency set to 1 day
        [Route("/sitemap.xml"), ResponseCache(Duration = 60 * 60 * 24)]
        public async Task<IActionResult> Index()
        {
            var getAllTagsTask = _tagService.GetAllTags(true);
            var listQuestionsTask = _questionService.ListQuestions(PostStatus.OK, null, null, int.MaxValue);

            var tagsListModel = await getAllTagsTask;
            var questionsListModel = await listQuestionsTask;
            var timeStamp = DateTime.UtcNow;

            var sitemap = new Sitemap();

            foreach (var tag in tagsListModel.Tags.OrderBy(x => x.Slug))
            {
                sitemap.Add(new Url
                {
                    ChangeFrequency = ChangeFrequency.Daily,
                    Location = $"{this._appSettings.Domain}/tags/{tag.Slug}",
                    Priority = 0.5,
                    TimeStamp = timeStamp
                });
            }

            foreach (var question in questionsListModel.Questions.OrderBy(x => x.Id))
            {
                sitemap.Add(new Url
                {
                    ChangeFrequency = ChangeFrequency.Daily,
                    Location = $"{this._appSettings.Domain}/questions/{question.Id}/{question.Slug}",
                    Priority = 1,
                    TimeStamp = timeStamp
                });
            }

            return this.Content(sitemap.ToXml(), "text/xml", Encoding.UTF8);
        }
    }
}
