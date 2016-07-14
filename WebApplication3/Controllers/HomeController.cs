using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Diagnostics;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading.Tasks;
using System.Net;


namespace WebApplication3.Controllers
{

    public class HomeController : Controller
    {
        private string pw = "smbk404BEY!!!";
        public ActionResult About()
        {
            ViewBag.Message = "Your application description page.";

            return View();
        }

        public ActionResult Contact()
        {
            ViewBag.Message = "Your contact page.";

            return View();
        }
        public ActionResult Dashboard()
        {
            ViewBag.Message = "Your dashboard page.";
            return View();
        }
        public class DashboardData
        {
            public string id { get; set; }
            public string name { get; set; }
            public string self { get; set; }
            public string view { get; set; }
        }

        public class Issue
        {
            public string id { get; set; }
            public string name { get; set; }
            public string self { get; set; }
            public string view { get; set; }
        }
        public class Response
        {
            public string expand { get; set; }
            public int startAt { get; set; }
            public int maxResults { get; set; }

            public int total { get; set; }
            public Issue[] issues { get; set; }
        }
        [HttpGet]
        public int onMessageUnsized()
        {
            using (var client = new HttpClient())
            {
                var byteArray = new System.Text.UTF8Encoding().GetBytes("AutomationService:Aut0mate0n!");
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", Convert.ToBase64String(byteArray));
                ServicePointManager.SecurityProtocol = SecurityProtocolType.Ssl3 | SecurityProtocolType.Tls11 | SecurityProtocolType.Tls12;

                HttpResponseMessage response = client.GetAsync("https://jira.whipplehill.com/rest/api/2/search?filter=14601&jql=project%20%3D%20CMS%20AND%20(sprint%20not%20in%20openSprints()%20AND%20sprint%20not%20in%20closedSprints()%20OR%20sprint%20is%20EMPTY)%20AND%20%22Story%20Points%22%20is%20EMPTY%20AND%20status%20not%20in%20(Released%2C%20Closed)%20ORDER%20BY%20cf%5B10300%5D%20ASC").Result;
                if (response.IsSuccessStatusCode)
                {
                    Response r = response.Content.ReadAsAsync<Response>().Result;
                    return r.total;
                } else
                {
                    Debug.WriteLine("failed Query");
                    return -1;
                }
            }
        }
    }
}