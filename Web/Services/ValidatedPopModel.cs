using System.Collections.Generic;
using Pobs.Domain;

namespace Pobs.Web.Services
{
    public class ValidatedPopModel
    {
        public string Text { get; set; }
        public string Source { get; set; }
        public PopType Type { get; set; }
        public IDictionary<string, Stance?> Topics { get; set; }
    }
}