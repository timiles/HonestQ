﻿using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Pobs.Domain;
using Pobs.Web.Helpers;
using Pobs.Web.Models.Tags;
using Pobs.Web.Services;

namespace Pobs.Web.Controllers
{
    [Route("api/[controller]")]
    public class TagsController : Controller
    {
        private readonly ITagService _tagService;

        public TagsController(ITagService tagService)
        {
            _tagService = tagService;
        }

        [HttpGet]
        public async Task<IActionResult> Index(bool isApproved = true)
        {
            if (!isApproved && !User.IsInRole(Role.Admin))
            {
                return this.Forbid();
            }

            var tagsListModel = await _tagService.GetAllTags(isApproved);
            return Ok(tagsListModel);
        }

        [HttpGet, Route("autocomplete")]
        public async Task<IActionResult> Autocomplete(string q)
        {
            var tags = await _tagService.Query(q);
            return Ok(tags);
        }

        [Authorize]
        public async Task<IActionResult> Post([FromBody] TagFormModel payload)
        {
            if (!User.IsInRole(Role.Admin))
            {
                return Forbid();
            }

            try
            {
                await _tagService.SaveTag(payload.Name, payload.Description, payload.MoreInfoUrl, User.Identity.ParseUserId());
                return Ok();
            }
            catch (AppException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [Authorize, HttpPut, Route("{tagSlug}")]
        public async Task<IActionResult> Put(string tagSlug, [FromBody] EditTagFormModel payload)
        {
            if (!User.IsInRole(Role.Admin))
            {
                return Forbid();
            }

            try
            {
                var tagModel = await _tagService.UpdateTag(tagSlug, payload.Slug, payload.Name,
                    payload.Description, payload.MoreInfoUrl, payload.IsApproved);
                if (tagModel != null)
                {
                    return Ok(tagModel);
                }
                return NotFound();
            }
            catch (AppException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        // NOTE: This is the main reason why we pass Slugs rather than Ids to the API:
        //       the first entrypoint to the system only knows the tagSlug.
        [Route("{tagSlug}")]
        public async Task<IActionResult> Get(string tagSlug)
        {
            var tagModel = await _tagService.GetTag(tagSlug, User.IsInRole(Role.Admin));
            if (tagModel != null)
            {
                return Ok(tagModel);
            }
            return NotFound();
        }
    }
}