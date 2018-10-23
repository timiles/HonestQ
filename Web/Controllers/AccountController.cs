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
using System;
using Pobs.Comms;
using System.Security.Cryptography;
using System.Net;
using System.Net.Mail;

namespace WebApi.Controllers
{
    [AllowAnonymous]
    [Route("api/[controller]/[action]")]
    public class AccountController : Controller
    {
        private readonly IUserService _userService;
        private readonly IEmailSender _emailSender;
        private readonly AppSettings _appSettings;

        public AccountController(IUserService userService, IEmailSender emailSender, IOptions<AppSettings> appSettings)
        {
            _userService = userService;
            _emailSender = emailSender;
            _appSettings = appSettings.Value;
        }

        [HttpPost]
        public IActionResult Login([FromBody]LoginFormModel userModel)
        {
            var user = _userService.Authenticate(userModel.Username, userModel.Password);

            if (user == null)
            {
                return BadRequest("Username or password is incorrect.");
            }
            if (!string.IsNullOrEmpty(user.EmailVerificationToken))
            {
                return BadRequest("Please verify your account first.");
            }

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

            MailAddress validEmail;
            try
            {
                validEmail = new MailAddress(registerFormModel.Email);
            }
            catch (FormatException)
            {
                return BadRequest($"Invalid Email address: '{registerFormModel.Email}'.");
            }

            var user = new User(registerFormModel.Name, validEmail.Address, registerFormModel.Username, DateTimeOffset.UtcNow)
            {
                EmailVerificationToken = GenerateRandomString()
            };

            try
            {
                // Save
                _userService.Create(user, registerFormModel.Password);
                var urlEncodedToken = WebUtility.UrlEncode($"{user.Id}-{user.EmailVerificationToken}");
                var verifyEmailUrl = $"{this._appSettings.Domain}/account/verifyemail?token={urlEncodedToken}";
                _emailSender.SendEmailVerification(registerFormModel.Email, registerFormModel.Username, verifyEmailUrl);
                return Ok();
            }
            catch (AppException ex)
            {
                // Return error message if there was an exception
                return BadRequest(ex.Message);
            }
        }

        [HttpPost]
        public IActionResult VerifyEmail([FromBody] VerifyEmailFormModel model)
        {
            var user = _userService.GetById(model.UserId);
            if (user == null)
            {
                return Ok(new VerifyEmailResponseModel { Error = "Unknown UserId." });
            }

            if (user.EmailVerificationToken != null)
            {
                if (user.EmailVerificationToken != model.EmailVerificationToken)
                {
                    // TODO: Log invalid attempts?
                    return Ok(new VerifyEmailResponseModel { Error = "Invalid email verification token." });
                }

                user.EmailVerificationToken = null;
                _userService.Update(user);
            }

            return Ok(new VerifyEmailResponseModel { Success = true });
        }

        private static string GenerateRandomString()
        {
            using (var randomNumberGenerator = new RNGCryptoServiceProvider())
            {
                // 24 bits should give a 32 character string
                var data = new byte[24];
                randomNumberGenerator.GetBytes(data);
                return Convert.ToBase64String(data);
            }
        }
    }
}
