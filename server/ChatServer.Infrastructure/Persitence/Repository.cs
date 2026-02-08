using ChatServer.Application.Common.Interfaces.Persistence;
using ChatServer.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Linq.Expressions;
using System.Text;
using System.Threading.Tasks;

namespace ChatServer.Infrastructure.Persitence
{
    public class Repository<T> : IRepository<T> where T : class
    {
        private readonly ChatDbContext _context;
        private readonly DbSet<T> _dbSet;
        public Repository(ChatDbContext context)
        {
            _context = context;
            _dbSet = _context.Set<T>();
        }

        /// <summary>
        /// tạo mới một thực thể trong cơ sở dữ liệu
        /// </summary>
        /// <param name="entity"></param>
        /// <returns></returns>
        public async Task AddAsync(T entity)
        {
            await _dbSet.AddAsync(entity);
            await _context.SaveChangesAsync();
        }

        /// <summary>
        ///  kiểm tra xem có bất kỳ thực thể nào
        /// </summary>
        /// <param name="predicate"></param>
        /// <returns></returns>
        public async Task<bool> AnyAsync(Expression<Func<T, bool>> predicate)
        {
            return await _dbSet.AnyAsync(predicate);
        }

        /// <summary>
        /// Tìm entity đầu tiên thỏa mãn điều kiện
        /// </summary>
        /// <param name="predicate"></param>
        /// <returns>Entity hoặc null nếu không tìm thấy</returns>
        public async Task<T?> FindAsync(Expression<Func<T, bool>> predicate) => await _dbSet.FirstOrDefaultAsync(predicate);

        /// <summary>
        /// Lấy entity theo Id
        /// </summary>
        /// <param name="id">Id của entity</param>
        /// <returns>Entity hoặc null nếu không tìm thấy</returns>
        public async Task<T?> GetByIdAsync(Guid id) => await _dbSet.FindAsync(id);

        /// <summary>
        /// Xóa entity khỏi database
        /// </summary>
        /// <param name="entity">Entity cần xóa</param>
        public async Task DeleteAsync(T entity) { _dbSet.Remove(entity); await _context.SaveChangesAsync(); }

        /// <summary>
        /// Cập nhật entity trong database
        /// </summary>
        /// <param name="entity">Entity cần cập nhật</param>
        public async Task UpdateAsync(T entity) { _dbSet.Update(entity); await _context.SaveChangesAsync(); }
    }
}
