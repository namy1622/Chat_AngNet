namespace ChatServer.Domain.Common;

public abstract class FullAuditEntity<TKey> : AuditableEntity<TKey>
{
    public bool IsDeleted { get; set; }
    public DateTime? DeletedAt { get; set; }
}