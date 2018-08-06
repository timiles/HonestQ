namespace Pobs.Domain.Entities.Helpers
{
    public interface IJoinEntity<TEntity>
    {
        TEntity Navigation { get; set; }
    }
}
