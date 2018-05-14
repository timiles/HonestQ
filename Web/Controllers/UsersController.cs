using Microsoft.AspNetCore.Mvc;
using Pobs.Web.Services;
using Microsoft.Extensions.Options;
using Pobs.Domain.Entities;
using Microsoft.AspNetCore.Authorization;
using Pobs.Web.Helpers;

namespace WebApi.Controllers
{
    [AllowAnonymous]
    [Route("api/[controller]")]
    public class UsersController : Controller
    {
        private readonly IUserService _userService;
        private readonly AppSettings _appSettings;

        public UsersController(IUserService userService, IOptions<AppSettings> appSettings)
        {
            _userService = userService;
            _appSettings = appSettings.Value;
        }

        [HttpPost("authenticate")]
        public IActionResult Authenticate([FromBody]UserModel userModel)
        {
            var user = _userService.Authenticate(userModel.Username, userModel.Password);

            if (user == null)
                return BadRequest("Username or password is incorrect");

            var token = AuthUtils.GenerateJwt(_appSettings.Secret, user.Id);

            // Return basic user info (without password) and token to store client side
            return Ok(new AuthenticatedUserResponseModel
            {
                Id = user.Id,
                Username = user.Username,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Token = token
            });
        }

        [HttpPost("register")]
        public IActionResult Register([FromBody]UserModel userModel)
        {
            var user = new User
            {
                FirstName = userModel.FirstName,
                LastName = userModel.LastName,
                Username = userModel.Username
            };

            try
            {
                // save 
                _userService.Create(user, userModel.Password);
                return Authenticate(userModel);
            }
            catch (AppException ex)
            {
                // return error message if there was an exception
                return BadRequest(ex.Message);
            }
        }

        public class UserModel
        {
            public int Id { get; set; }
            public string FirstName { get; set; }
            public string LastName { get; set; }
            public string Username { get; set; }
            public string Password { get; set; }
        }

        public class AuthenticatedUserResponseModel
        {
            public int Id { get; set; }
            public string FirstName { get; set; }
            public string LastName { get; set; }
            public string Username { get; set; }
            public string Token { get; set; }
        }
    }
}
