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
using System.Linq;

namespace WebApi.Controllers
{
    [AllowAnonymous]
    [Route("api/[controller]/[action]")]
    public class AccountController : Controller
    {
        private readonly IUserService _userService;
        private readonly IEmailSender _emailSender;
        private readonly AppSettings _appSettings;
        private readonly int[] _adminUserIds = new[] { 1, 2, 7, 8, 9, 10 };

        public AccountController(IUserService userService, IEmailSender emailSender, IOptions<AppSettings> appSettings)
        {
            _userService = userService;
            _emailSender = emailSender;
            _appSettings = appSettings.Value;
        }

        [HttpPost]
        public IActionResult LogIn([FromBody]LogInFormModel userModel)
        {
            var username = userModel.Username?.Trim();
            if (string.IsNullOrWhiteSpace(username))
            {
                return BadRequest("Username is required.");
            }

            if (username.Contains('@'))
            {
                var userByEmailAddress = _userService.GetAll().FirstOrDefault(
                    x => x.Email == userModel.Username.ToLowerInvariant());
                if (userByEmailAddress == null)
                {
                    return BadRequest("Username or password is incorrect.");
                }
                username = userByEmailAddress.Username;
            }
            var user = _userService.Authenticate(username, userModel.Password);

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
            if (_adminUserIds.Contains(user.Id))
            {
                roles.Add(Pobs.Domain.Role.Admin);
            }
            var token = AuthUtils.GenerateJwt(_appSettings.Secret, user.Id, roles.ToArray());

            // Put token into Cookies to enable Server Side Rendering
            var expiry = userModel.RememberMe ? DateTime.UtcNow.AddYears(5) : null as DateTime?;
            this.Response.Cookies.Append("id_token", token, new CookieOptions { Path = "/", HttpOnly = true, Expires = expiry });

            // Return basic user info and token to store client side
            return Ok(new LoggedInUserModel(user, token));
        }

        [HttpPost]
        public IActionResult LogOut()
        {
            this.Response.Cookies.Delete("id_token");
            return Ok();
        }

        [HttpPost]
        public IActionResult SignUp([FromBody]SignUpFormModel signUpFormModel)
        {
            string validatedEmail;
            try
            {
                var validEmail = new MailAddress(signUpFormModel.Email);
                validatedEmail = validEmail.Address.ToLowerInvariant();
            }
            catch (FormatException)
            {
                return BadRequest($"Invalid Email address: '{signUpFormModel.Email}'.");
            }

            if (signUpFormModel.Username.Contains('@'))
            {
                return BadRequest($"Invalid Username, must not contain '@': '{signUpFormModel.Username}'.");
            }

            if (signUpFormModel.Password?.Length < 7)
            {
                return BadRequest("Password must be at least 7 characters.");
            }

            var user = new User(validatedEmail, signUpFormModel.Username, DateTimeOffset.UtcNow)
            {
                EmailVerificationToken = GenerateRandomString()
            };

            try
            {
                // Save
                _userService.Create(user, signUpFormModel.Password);
                var urlEncodedToken = WebUtility.UrlEncode($"{user.Id}-{user.EmailVerificationToken}");
                var verifyEmailUrl = $"{this._appSettings.Domain}/account/verifyemail?token={urlEncodedToken}";
                _emailSender.SendEmailVerification(validatedEmail, signUpFormModel.Username, verifyEmailUrl);
                try
                {
                    _emailSender.SendNewUserSignedUpNotification("tim@timiles.com", signUpFormModel.Username);
                }
                catch
                {
                    // Ignore, it's only me.
                }
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
                return BadRequest("Unknown UserId.");
            }

            if (user.EmailVerificationToken == null)
            {
                // Do not return Username here, to guard against enumerating all users.
                return Ok(new VerifyEmailResponseModel());
            }

            if (user.EmailVerificationToken != model.EmailVerificationToken)
            {
                // TODO: Log invalid attempts?
                return BadRequest("Invalid email verification token.");
            }

            user.EmailVerificationToken = null;
            _userService.Update(user);

            return Ok(new VerifyEmailResponseModel { Username = user.Username });
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
