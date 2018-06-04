using Microsoft.AspNetCore.Mvc;
using Pobs.Web.Services;
using Microsoft.Extensions.Options;
using Pobs.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Pobs.Web.Helpers;
using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
using Pobs.Web.Models.Account;
using Pobs.Domain;

namespace WebApi.Controllers
{
    [AllowAnonymous]
    [Route("api/[controller]/[action]")]
    public class AccountController : Controller
    {
        private readonly IUserService _userService;
        private readonly AppSettings _appSettings;

        public AccountController(IUserService userService, IOptions<AppSettings> appSettings)
        {
            _userService = userService;
            _appSettings = appSettings.Value;
        }

        [HttpPost]
        public IActionResult Login([FromBody]LoginFormModel userModel)
        {
            var user = _userService.Authenticate(userModel.Username, userModel.Password);

            if (user == null)
                return BadRequest("Username or password is incorrect");

            var roles = new List<Pobs.Domain.Role>();
            // TODO: proper roles in the database, this is a poor hack for now.
            if (user.Id == 1)
            {
                roles.Add(Pobs.Domain.Role.Admin);
            }
            var token = AuthUtils.GenerateJwt(_appSettings.Secret, user.Id, roles.ToArray());

            // Put token into Cookies to enable Server Side Rendering
            this.Response.Cookies.Append("id_token", token, new CookieOptions { Path = "/", HttpOnly = true });

            // Return basic user info and token to store client side
            return Ok(new LoggedInUserModel(user, token));
        }

        [HttpPost]
        public IActionResult Logout()
        {
            this.Response.Cookies.Delete("id_token");
            return Ok();
        }

        [HttpPost]
        public IActionResult Register([FromBody]RegisterFormModel registerFormModel)
        {
            // PRIVATE BETA
            if (registerFormModel.Username != "poi" && !User.IsInRole(Role.Admin))
            {
                return Forbid();
            }

            var user = new User
            {
                FirstName = registerFormModel.FirstName,
                LastName = registerFormModel.LastName,
                Username = registerFormModel.Username
            };

            try
            {
                // save 
                _userService.Create(user, registerFormModel.Password);
                return Ok();
            }
            catch (AppException ex)
            {
                // return error message if there was an exception
                return BadRequest(ex.Message);
            }
        }
    }
}
