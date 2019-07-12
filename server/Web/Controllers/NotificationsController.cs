using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Pobs.Web.Helpers;
using Pobs.Web.Models.Notifications;
using Pobs.Web.Services;

namespace Pobs.Web.Controllers
{
    [Authorize, Route("api/[controller]")]
    public class NotificationsController : Controller
    {
        private readonly INotificationsService _notificationsService;

        public NotificationsController(INotificationsService notificationsService)
        {
            _notificationsService = notificationsService;
        }

        [HttpGet]
        public async Task<IActionResult> Index(int pageSize = 20, long? beforeId = null)
        {
            var notificationsList = await _notificationsService.ListNotifications(User.Identity.ParseUserId(), pageSize, beforeId);
            return Ok(notificationsList);
        }

        [HttpGet, Route("count")]
        public async Task<IActionResult> Count()
        {
            var notificationsCount = await _notificationsService.CountNotifications(User.Identity.ParseUserId());
            return Ok(notificationsCount);
        }

        [HttpPost, Route("{notificationId}/seen")]
        public async Task<IActionResult> MarkAsSeen(long notificationId)
        {
            if (await _notificationsService.MarkAsSeen(User.Identity.ParseUserId(), notificationId))
            {
                return Ok();
            }
            else
            {
                return NotFound();
            }
        }

        [HttpPost, Route("all/seen")]
        public async Task<IActionResult> MarkAllAsSeen()
        {
            await _notificationsService.MarkAllAsSeen(User.Identity.ParseUserId());
            return Ok();
        }

        [HttpPost, AllowAnonymous, Route("pushtoken")]
        public async Task<IActionResult> PushToken([FromBody]PushTokenModel model)
        {
            int? loggedInUserId = null;
            if (User.Identity.IsAuthenticated)
            {
                loggedInUserId = User.Identity.ParseUserId();
            }
            await _notificationsService.AddPushToken(model.Token, loggedInUserId);
            return Ok();
        }
    }
}
