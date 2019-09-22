using System.ComponentModel.DataAnnotations;

namespace Pobs.Web.Models.Questions
{
    public class ReportModel
    {
        [Required]
        public string Reason { get; set; }
    }
}