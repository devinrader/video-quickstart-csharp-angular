using System.Web;
using System.Web.Optimization;

namespace VideoQuickstart
{
    public class BundleConfig
    {
        // For more information on bundling, visit http://go.microsoft.com/fwlink/?LinkId=301862
        public static void RegisterBundles(BundleCollection bundles)
        {
            bundles.Add(new ScriptBundle("~/bundles/videoQuickstart").Include(
                        "~/Scripts/app/app.js",
                        "~/Scripts/app/common/directives/twilio-video.js",
                        "~/Scripts/app/home/videochat.js"));
        }
    }
}
