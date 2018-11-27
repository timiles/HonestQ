using System;
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

        [HttpPost, Route("watch")]
        public async Task<IActionResult> Watch([FromBody] WatchFormModel model)
        {
            if (string.IsNullOrEmpty(model.Type) ||
                !Enum.TryParse<WatchType>(model.Type, out WatchType type))
            {
                return BadRequest($"Invalid Type: {model.Type}.");
            }

            try
            {
                switch (model.Method)
                {
                    case "Add":
                        {
                            var response = await _notificationsService.AddWatch(User.Identity.ParseUserId(), type, model.Id);
                            return Ok(response);
                        }
                    case "Remove":
                        {
                            var response = await _notificationsService.RemoveWatch(User.Identity.ParseUserId(), type, model.Id);
                            return Ok(response);
                        }
                    default:
                        return BadRequest($"Invalid Method: {model.Method}.");
                }
            }
            catch (AppException e)
            {
                return BadRequest(e.Message);
            }
        }
    }
}
