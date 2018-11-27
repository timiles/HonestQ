using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Pobs.Web.Helpers;
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
    }
}
