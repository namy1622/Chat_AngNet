using ChatServer.Domain.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChatServer.Application.Common.Interfaces.Persistence
{
    // dùng dbContext ở tầng Application mà ko phụ thuộc trực tiếp EF Core -> tạo interface IChatContext
    public interface IChatContext
    {
        DbSet<User> Users {get;}
        Task<int> SaveChangesAsync(CancellationToken cancellationToken);
    }
}
