using Microsoft.Owin;
using Owin;

[assembly: OwinStartupAttribute(typeof(DashboardApp.Startup))]
namespace DashboardApp
{
    public partial class Startup
    {
        public void Configuration(IAppBuilder app)
        {
            ConfigureAuth(app);
        }
    }
}
