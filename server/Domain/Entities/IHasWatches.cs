using System.Collections.Generic;

namespace Pobs.Domain.Entities
{
    public interface IHasWatches
    {
        ICollection<Watch> Watches { get; }
    }
}
