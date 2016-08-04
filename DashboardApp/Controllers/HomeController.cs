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
using Newtonsoft.Json;
using System.Text.RegularExpressions;
using System.Web.Configuration;

namespace DashboardApp.Controllers
{
    public class HomeController : Controller
    {

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

        public string CsvPath
        {   get
            {
                return WebConfigurationManager.AppSettings["pathToCsv"];
            }
        }



        public class Field
        {
            public string customfield_10003 { get; set; }
        }
        public class Issue
        {
            public string id { get; set; }
            public Field fields { get; set; }
            public string self { get; set; }
            public string view { get; set; }
        }
        public class ResponseSized
        {
            public string expand { get; set; }
            public int startAt { get; set; }
            public int maxResults { get; set; }

            public int total { get; set; }
            public List<Issue> issues { get; set; }
        }

        public class ResponseUnsized
        {
            public string expand { get; set; }
            public int startAt { get; set; }
            public int maxResults { get; set; }
            public int total { get; set; }
        }


        public string getSizedURL(string project)
        {
            return "https://jira.whipplehill.com/rest/api/2/search?filter=14601&jql=project%20%3D%20" + project + "%20AND%20(sprint%20not%20in%20openSprints()%20AND%20sprint%20not%20in%20closedSprints()%20OR%20sprint%20is%20EMPTY)%20AND%20%22Story%20Points%22%20is%20not%20EMPTY%20AND%20status%20not%20in%20(Released%2C%20Closed)%20ORDER%20BY%20cf%5B10300%5D%20ASC&maxResults=1000";
        }

        public string getUnsizedURL(string project)
        {
            return "https://jira.whipplehill.com/rest/api/2/search?filter=14601&jql=project%20%3D%20" + project + "%20AND%20(sprint%20not%20in%20openSprints()%20AND%20sprint%20not%20in%20closedSprints()%20OR%20sprint%20is%20EMPTY)%20AND%20%22Story%20Points%22%20is%20EMPTY%20AND%20status%20not%20in%20(Released%2C%20Closed)%20ORDER%20BY%20cf%5B10300%5D%20ASC&maxResults=1000";
        }

        public string getStoriesURL(string month, string project)
        {
            string[] dateParts = Regex.Split(month, @"(?<=\p{L})(?=\p{N})");
            DateTime date = Convert.ToDateTime("01-" + dateParts[0] + "-" + dateParts[1]);;

            string startDate = date.Year + "%2F" + date.Month + "%2F" + "01";
            string endDate = date.Year + "%2F" + date.Month + "%2F" + DateTime.DaysInMonth(date.Year, date.Month);

            if (project == "All")
            {
                return "https://jira.whipplehill.com/rest/api/2/search?filter=14419&jql=issuetype%20%3D%20Story%20AND%20fixVersion%20is%20not%20EMPTY%20AND%20resolved%20%3E%20%22" + startDate + "%22%20AND%20resolved%20%3C%20%22" + endDate + "%22";
            }
            return "https://jira.whipplehill.com/rest/api/2/search?filter=14610&jql=project%20in%20(" + project + ")%20AND%20issuetype%20%3D%20Story%20AND%20fixVersion%20is%20not%20EMPTY%20AND%20resolved%20%3E%20%22" + startDate + "%22%20AND%20resolved%20%3C%20%22" + endDate + "%22";
        }

        public string getHotFixesURL(string month, string project)
        {
            string[] dateParts = Regex.Split(month, @"(?<=\p{L})(?=\p{N})");
            DateTime date = Convert.ToDateTime("01-" + dateParts[0] + "-" + dateParts[1]); ;

            string startDate = date.Year + "%2F" + date.Month + "%2F" + "01";
            string endDate = date.Year + "%2F" + date.Month + "%2F" + DateTime.DaysInMonth(date.Year, date.Month);
            if (project == "All")
            {

                return "https://jira.whipplehill.com/rest/api/2/search?filter=14419&jql=status%20%3D%20\"RELEASED\"%20AND%20issuetype%20%3D%20\"CR%20Bug\"%20AND%20fixVersion%20is%20not%20EMPTY%20AND%20resolved%20%3E%20%22" + startDate + "%22%20AND%20resolved%20%3C%20%22" + endDate + "%22%20";


            }
            return "https://jira.whipplehill.com/rest/api/2/search?filter=14610&jql=project%20in%20(" + project + ")%20AND%20status%20%3D%20%22RELEASED%22%20AND%20issuetype%20%3D%20%22CR%20Bug%22%20AND%20fixVersion%20is%20not%20EMPTY%20AND%20resolved%20%3E%20%22" + startDate + "%22%20AND%20resolved%20%3C%20%22" + endDate + "%22";
        }

        public string getReleaseQURL(string month, string project)
        {
            string[] dateParts = Regex.Split(month, @"(?<=\p{L})(?=\p{N})");
            DateTime date = Convert.ToDateTime("01-" + dateParts[0] + "-" + dateParts[1]); ;

            string startDate = date.Year + "%2F" + date.Month + "%2F" + "01";
            string endDate = date.Year + "%2F" + date.Month + "%2F" + DateTime.DaysInMonth(date.Year, date.Month);
            if (project == "All")
            {

                return "https://jira.whipplehill.com/rest/api/2/search?filter=14419&jql=status%20%3D%20\"RELEASED\"%20AND%20issuetype%20%3D%20\"CR%20Bug\"%20AND%20fixVersion%20is%20not%20EMPTY%20AND%20resolved%20%3E%20%22" + startDate + "%22%20AND%20resolved%20%3C%20%22" + endDate + "%22%20";


            }
            return "https://jira.whipplehill.com/rest/api/2/search?filter=14610&jql=project%20in%20(" + project + ")%20AND%20status%20%3D%20%22RELEASED%22%20AND%20issuetype%20%3D%20%22CR%20Bug%22%20AND%20fixVersion%20is%20not%20EMPTY%20AND%20resolved%20%3E%20%22" + startDate + "%22%20AND%20resolved%20%3C%20%22" + endDate + "%22";
        }


        [HttpGet]
        public int GetReleasedStories(string team, string month)
        {
            using (var client = new HttpClient())
            {
                var byteArray = new System.Text.UTF8Encoding().GetBytes("AutomationService:Aut0mate0n!");
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", Convert.ToBase64String(byteArray));
                ServicePointManager.SecurityProtocol = SecurityProtocolType.Ssl3 | SecurityProtocolType.Tls11 | SecurityProtocolType.Tls12;

                HttpResponseMessage response = client.GetAsync(getStoriesURL(month, team)).Result;
                if (response.IsSuccessStatusCode)
                {
                    string r = response.Content.ReadAsStringAsync().Result;
                    ResponseUnsized result1 = JsonConvert.DeserializeObject<ResponseUnsized>(r);
                    return result1.total;
                }
                else
                {
                    Debug.WriteLine("failed Query");
                    return -1;
                }
            }
        }
        

        [HttpGet]
        public int GetReleasedHotFixes(string team, string month)
        {
            using (var client = new HttpClient())
            {
                var byteArray = new System.Text.UTF8Encoding().GetBytes("AutomationService:Aut0mate0n!");
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", Convert.ToBase64String(byteArray));
                ServicePointManager.SecurityProtocol = SecurityProtocolType.Ssl3 | SecurityProtocolType.Tls11 | SecurityProtocolType.Tls12;

                HttpResponseMessage response = client.GetAsync(getHotFixesURL(month, team)).Result;
                if (response.IsSuccessStatusCode)
                {
                    string r = response.Content.ReadAsStringAsync().Result;
                    ResponseUnsized result1 = JsonConvert.DeserializeObject<ResponseUnsized>(r);
                    return result1.total;
                }
                else
                {
                    Debug.WriteLine("failed Query");
                    return -1;
                }
            }
        }

        [HttpGet]
        public double GetAllSized(string team)
        {
            using (var client = new HttpClient())
            {
                var byteArray = new System.Text.UTF8Encoding().GetBytes("AutomationService:Aut0mate0n!");
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", Convert.ToBase64String(byteArray));
                ServicePointManager.SecurityProtocol = SecurityProtocolType.Ssl3 | SecurityProtocolType.Tls11 | SecurityProtocolType.Tls12;

                HttpResponseMessage response = client.GetAsync("https://jira.whipplehill.com/rest/api/2/search?filter=14601&jql=project%20in%20(onBoard%2C%20onCampus%2C%20onRecord%2C%20onMessage)%20AND%20(sprint%20not%20in%20openSprints()%20AND%20sprint%20not%20in%20closedSprints()%20OR%20sprint%20is%20EMPTY)%20AND%20%22Story%20Points%22%20is%20not%20EMPTY%20AND%20status%20not%20in%20(Released%2C%20Closed)%20ORDER%20BY%20summary%20ASC%2C%20cf%5B10300%5D%20ASC&maxResults=1000").Result;
                if (response.IsSuccessStatusCode)
                {
                    string r = response.Content.ReadAsStringAsync().Result;
                    ResponseSized result1 = JsonConvert.DeserializeObject<ResponseSized>(r);
                    List<Issue> l = result1.issues;
                    double total = l.Sum(item => int.Parse(item.fields.customfield_10003));
                    return total;
                }
                else
                {
                    Debug.WriteLine("failed Query");
                    return 0.0;
                }
            }
        }

        [HttpGet]
        public int GetAllUnsized(string team)
        {
            using (var client = new HttpClient())
            {
                var byteArray = new System.Text.UTF8Encoding().GetBytes("AutomationService:Aut0mate0n!");
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", Convert.ToBase64String(byteArray));
                ServicePointManager.SecurityProtocol = SecurityProtocolType.Ssl3 | SecurityProtocolType.Tls11 | SecurityProtocolType.Tls12;

                HttpResponseMessage response = client.GetAsync("https://jira.whipplehill.com/rest/api/2/search?filter=14610&jql=project%20in%20(onBoard%2C%20onCampus%2C%20onRecord%2C%20onMessage)%20AND%20(sprint%20not%20in%20openSprints()%20AND%20sprint%20not%20in%20closedSprints()%20OR%20sprint%20is%20EMPTY)%20AND%20%22Story%20Points%22%20is%20EMPTY%20AND%20status%20not%20in%20(Released%2C%20Closed)%20ORDER%20BY%20summary%20ASC%2C%20cf%5B10300%5D%20ASC").Result;
                if (response.IsSuccessStatusCode)
                {
                    string r = response.Content.ReadAsStringAsync().Result;
                    ResponseUnsized result1 = JsonConvert.DeserializeObject<ResponseUnsized>(r);
                    return result1.total;
                }
                else
                {
                    Debug.WriteLine("failed Query");
                    return -1;
                }
            }
        }

        [HttpGet]
        public double GetSized(string team)
        {
            using (var client = new HttpClient())
            {
                var byteArray = new System.Text.UTF8Encoding().GetBytes("AutomationService:Aut0mate0n!");
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", Convert.ToBase64String(byteArray));
                ServicePointManager.SecurityProtocol = SecurityProtocolType.Ssl3 | SecurityProtocolType.Tls11 | SecurityProtocolType.Tls12;

                HttpResponseMessage response = client.GetAsync(getSizedURL(team)).Result;
                if (response.IsSuccessStatusCode)
                {
                    string r = response.Content.ReadAsStringAsync().Result;
                    ResponseSized result1 = JsonConvert.DeserializeObject<ResponseSized>(r);
                    List < Issue > l = result1.issues;
                    double total = l.Sum(item => int.Parse(item.fields.customfield_10003));
                    return total;
                }
                else
                {
                    Debug.WriteLine("failed Query");
                    return 0.0;
                }
            }
        }

        [HttpGet]
        public int GetUnsized(string team)
        {
            using (var client = new HttpClient())
            {
                var byteArray = new System.Text.UTF8Encoding().GetBytes("AutomationService:Aut0mate0n!");
                client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", Convert.ToBase64String(byteArray));
                ServicePointManager.SecurityProtocol = SecurityProtocolType.Ssl3 | SecurityProtocolType.Tls11 | SecurityProtocolType.Tls12;

                HttpResponseMessage response = client.GetAsync(getUnsizedURL(team)).Result;
                if (response.IsSuccessStatusCode)
                {
                    string r = response.Content.ReadAsStringAsync().Result;
                    ResponseUnsized result1 = JsonConvert.DeserializeObject<ResponseUnsized>(r);
                    return result1.total;
                } else
                {
                    Debug.WriteLine("failed Query");
                    return -1;
                }
            }
        }
    }
}