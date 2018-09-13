using System.Collections.Generic;
using System.Linq;
using Pobs.Domain.Entities;

namespace Pobs.Web.Models.Pops
{
    public class PopsListModel
    {
        public PopsListModel(IEnumerable<Pop> pops)
        {
            this.Pops = pops.Select(x => new PopListItemModel(x)).ToArray();
        }

        public PopListItemModel[] Pops { get; set; }
    }
}