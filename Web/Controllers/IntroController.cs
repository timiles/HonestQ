using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Pobs.Web.Helpers;
using Pobs.Web.Models;
using Pobs.Web.Services;

namespace Pobs.Web.Controllers
{
    [Route("api/[controller]")]
    public class IntroController : Controller
    {
        private readonly IUserService _userService;

        public IntroController(IUserService userService)
        {
            _userService = userService;
        }

        [Authorize]
        public IActionResult Index()
        {
            var user = _userService.GetById(User.Identity.ParseUserId());

            return Json(new IntroModel { Content = $@"
# Hi {user.FirstName}! Welcome to the **POBS PRIVATE BETA**!

(""POBS"" is just a working title, but stands for ""People On Both Sides"".)

## What is ""POBS"" all about?

This site aims to create an environment for productive healthy debates.

We don't have all of the answers, but we hope you will share your opinions, 
discover points of view you hadn't considered before, and understand why someone might hold an opinion you disagree with.

Wishful thinking? Maybe, let's find out.

## Why we're different

Online debates can often be a waste of time.

In a best case scenario:
- a good debate is had,
- someone learns something,
- everyone moves on,
- but the positive experience is lost to the annals of the timeline.

Worst case scenario:
- a sincere attempt to communicate is ignored,
- grammar and spelling is criticised,
- insults are thrown,
- someone gets called a bot,
- the debate is derailed and everybody is angry at each other.

""POBS"" is structured in such a way that the worst aspects of online debates can't happen here.

## How you can help

We want real voices to be heard, from the whole range of human experience.
Not everybody in the world is online yet, and even of those who are online, many websites aren't designed with them in mind.
We want this site to work for real people, rather than assume that everybody is just like us.
As such, we already welcome your feedback:

- See something you don't like, and would turn you away from wanting to engage with the site?
- How do you think the site could be improved or better used?
- Anything not working properly? Any feature requests?
- Do you know someone whose voice should be heard and who would love to join the private beta?
- We still need a name! Any ideas?

If you think of anything, or just want to say hi, please email me at <a href=""mailto:tim@timiles.com?subject=POBS feedback"">tim@timiles.com</a>.

Thanks!

Tim
" });
        }
    }
}
