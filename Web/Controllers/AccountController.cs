using Microsoft.AspNetCore.Mvc;
using Pobs.Web.Services;
using Microsoft.Extensions.Options;
using Pobs.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Pobs.Web.Helpers;
using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
using Pobs.Domain;
using System.Linq;

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

            var roles = new List<Role>();
            // TODO: proper roles in the database, this is a poor hack for now.
            if (user.Id == 1)
            {
                roles.Add(Role.Admin);
            }
            var token = AuthUtils.GenerateJwt(_appSettings.Secret, user.Id, roles.ToArray());

            // Put token into Cookies to enable Server Side Rendering
            this.Response.Cookies.Append("id_token", token, new CookieOptions { Path = "/", HttpOnly = true });

            // Return basic user info and token to store client side
            return Ok(new LoginResponseModel(user, token));
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

        public class LoginFormModel
        {
            public string Username { get; set; }
            public string Password { get; set; }
            public bool RememberMe { get; set; }
        }

        public class LoginResponseModel
        {
            public LoginResponseModel(User user, string token)
            {
                this.FirstName = user.FirstName;
                this.Username = user.Username;
                this.Token = token;
            }

            public string FirstName { get; set; }
            public string Username { get; set; }
            public string Token { get; set; }
        }

        public class RegisterFormModel
        {
            public string FirstName { get; set; }
            public string LastName { get; set; }
            public string Username { get; set; }
            public string Password { get; set; }
        }
    }
}
