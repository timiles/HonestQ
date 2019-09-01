using System;
using System.Text;
using Exceptionless;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.Rewrite;
using Microsoft.AspNetCore.Routing;
using Microsoft.AspNetCore.SpaServices.Webpack;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Internal;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Pobs.Domain;
using Pobs.Comms;
using Pobs.Web.Helpers;
using Pobs.Web.Middleware;
using Pobs.Web.Services;
using Pomelo.EntityFrameworkCore.MySql.Infrastructure;
using System.Linq;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.Net.Http.Headers;

namespace Pobs.Web
{
    public class Startup
    {
        private readonly IHostingEnvironment _env;
        private readonly ILoggerFactory _loggerFactory;

        public Startup(IHostingEnvironment env, IConfiguration configuration, ILoggerFactory loggerFactory)
        {
            _env = env;
            Configuration = configuration;
            _loggerFactory = loggerFactory;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddCors();
            services.AddMvc();
            services.AddDbContextPool<HonestQDbContext>(
                options => options.UseMySql(Configuration.GetConnectionString("DefaultConnection"),
                    b =>
                    {
                        b.ServerVersion(new Version(5, 7, 21), ServerType.MySql);
                        b.CharSetBehavior(CharSetBehavior.AppendToAllAnsiColumns);
                        b.AnsiCharSet(CharSet.Latin1);
                        b.UnicodeCharSet(CharSet.Utf8mb4);
                        b.MigrationsAssembly("Pobs.Web");
                    }));

            // Configure strongly typed settings objects
            var appSettingsSection = Configuration.GetSection("AppSettings");
            services.Configure<AppSettings>(appSettingsSection);

            // Configure jwt authentication
            var appSettings = appSettingsSection.Get<AppSettings>();
            var key = Encoding.ASCII.GetBytes(appSettings.Secret);
            services.AddAuthentication(x =>
            {
                x.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
                x.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(x =>
            {
                x.RequireHttpsMetadata = false;
                x.SaveToken = true;
                x.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(key),
                    ValidateIssuer = false,
                    ValidateAudience = false
                };
            });

            services.AddSpaPrerenderer();

            services.AddNodeServices(options =>
            {
                if (_env.IsDevelopment())
                {
                    options.LaunchWithDebugging = true;
                    options.DebuggingPort = 9229;
                }
                options.NodeInstanceOutputLogger = _loggerFactory.CreateLogger("Node Console Logger");
            });

            // Configure DI for application services
            services.AddScoped(provider => provider.GetService<DbContextPool<HonestQDbContext>>().Rent());
            services.AddScoped<IActivityService, ActivityService>();
            services.AddScoped<INotificationsService, NotificationsService>();
            services.AddScoped<IQuestionService, QuestionService>();
            services.AddScoped<ITagService, TagService>();
            services.AddScoped<IUserService, UserService>();
            services.AddScoped<IWatchingService, WatchingService>();

            var scopeFactory = services.BuildServiceProvider()
                .GetRequiredService<IServiceScopeFactory>();

            using (var scope = scopeFactory.CreateScope())
            {
                var provider = scope.ServiceProvider;
                using (var dbContext = provider.GetRequiredService<HonestQDbContext>())
                {
                    dbContext.Database.Migrate();
                }
            }
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseWebpackDevMiddleware(new WebpackDevMiddlewareOptions
                {
                    HotModuleReplacement = true,
                    ReactHotModuleReplacement = true
                });
            }
            else if (env.IsProduction())
            {
                var appSettings = Configuration.GetSection("AppSettings").Get<AppSettings>();
                if (appSettings.ExceptionlessApiKey != null)
                {
                    app.UseExceptionless(appSettings.ExceptionlessApiKey);
                }

                // NOTE:
                // app.UseForwardedHeaders() is for some reason not working;
                // app.UseHttpsRedirection() would also redirect health check;
                // so I'm taking a bit more explicit control and just doing it like this instead.
                app.UseRewriter(new RewriteOptions()
                    .Add(rule =>
                    {
                        // Permit "ELB-HealthChecker/XXX" and "POBSWEB-HealthChecker" for internal health check pings
                        var userAgentValues = rule.HttpContext.Request.Headers[HeaderNames.UserAgent];
                        if (userAgentValues.Any(x => x.StartsWith("ELB-HealthChecker/") || x == "POBSWEB-HealthChecker"))
                        {
                            return;
                        }

                        // Get scheme according to X-Forwarded-Proto from the load balancer
                        var scheme = rule.HttpContext.Request.Headers[ForwardedHeadersDefaults.XForwardedProtoHeaderName];
                        if ($"{scheme}://{rule.HttpContext.Request.Host.Value}" != appSettings.Domain)
                        {
                            var url = $"{appSettings.Domain}{rule.HttpContext.Request.Path}{rule.HttpContext.Request.QueryString}";
                            rule.HttpContext.Response.Redirect(url);
                            rule.Result = RuleResult.EndResponse;
                        }
                    }));
            }

            var contentTypeProvider = new FileExtensionContentTypeProvider();
            contentTypeProvider.Mappings[".webmanifest"] = "application/manifest+json";
            app.UseStaticFiles(new StaticFileOptions
            {
                ContentTypeProvider = contentTypeProvider
            });

            // global cors policy
            app.UseCors(x => x
                .AllowAnyOrigin()
                .AllowAnyMethod()
                .AllowAnyHeader()
                .AllowCredentials());

            app.UseAuthentication();
            app.UseDisableApiResponseCaching();
            // Disable FeatureLogging for now, keep exceeding Exceptionless limits
            // app.UseFeatureLogging();
            app.UseMvc(routes =>
            {
                routes.MapRoute(
                    name: "default",
                    template: "{controller=Home}/{action=Index}/{id?}");

                routes.MapSpaFallbackRoute(
                    name: "spa-fallback",
                    defaults: new { controller = "Home", action = "Index" },
                    constraints: new { excludeRoutes = new ExcludeRoutesByPrefixConstraint("api/", "docs/") });
            });
        }

        private class ExcludeRoutesByPrefixConstraint : IRouteConstraint
        {
            private readonly string[] _routePrefixes;

            public ExcludeRoutesByPrefixConstraint(params string[] routePrefixes)
            {
                _routePrefixes = routePrefixes;
            }

            public bool Match(HttpContext httpContext, IRouter route, string routeKey, RouteValueDictionary values,
                RouteDirection routeDirection)
            {
                var clientRoute = values["clientRoute"].ToString();
                return _routePrefixes.All(x => !clientRoute.StartsWith(x));
            }
        }

        private class NotDocsConstraint : IRouteConstraint
        {
            public bool Match(HttpContext httpContext, IRouter route, string routeKey, RouteValueDictionary values,
                RouteDirection routeDirection)
            {
                return !values["clientRoute"].ToString().StartsWith("api/");
            }
        }

        public static class ExternalServices
        {
            public static void Configure(IServiceCollection services)
            {
                services.AddScoped<IEmailSender>(provider =>
                {
                    var appSettings = provider.GetService<IOptions<AppSettings>>();
                    return new EmailSender(appSettings.Value);
                });
            }
        }
    }
}
