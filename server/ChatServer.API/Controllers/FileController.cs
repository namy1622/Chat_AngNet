using ChatServer.Application.Common.Interfaces.Persistence;
using ChatServer.Application.Common.Interfaces.Services;
using ChatServer.Application.Features.Files.Commands.UploadFile;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace ChatServer.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class FileController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly IChatContext _context;
        private readonly IFileStorageService _fileStorage;

        public FileController(IMediator mediator, IChatContext context, IFileStorageService fileStorage)
        {
            _mediator = mediator;
            _context = context;
            _fileStorage = fileStorage;
        }

        [HttpPost("upload")]
        public async Task<IActionResult> Upload(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file provided.");

            var userId = GetUserIdFromToken();

            // Tạo command và gửi cho MediatR xử lý
            var command = new UploadFileCommand(
                FileStream: file.OpenReadStream(),
                FileName: file.FileName,
                ContentType: file.ContentType,
                Size: file.Length,
                UploadedByUserId: userId
            );

            try
            {
                var result = await _mediator.Send(command);
                return Ok(result);
            }
            catch (InvalidOperationException ex)
            {
                // file quá lớn/ sai extension/ ...
                return BadRequest(new { error = ex.Message });
            }
        }

        // download/xem file — kieemr tra quyen
        // User phải thuộc conversation chứa file mới được xem
        // ============================================
        [HttpGet("{fileId}")]
        public async Task<IActionResult> GetFile(long fileId)
        {
            var userId = GetUserIdFromToken();

            // - tìm file trong DB
            var file = await _context.FileAttachments.FindAsync(fileId);
            if (file == null) return NotFound("File not found.");

            // - check quyền: user phải thuộc conversation chứa file này
            var hasAccess = await CheckFileAccess(fileId, userId);
            if (!hasAccess) return Forbid();

            // - trả file về cho client
            try
            {
                var stream = await _fileStorage.GetAsync(file.StoragePath);

                // Cache 1 năm — vì file name dùng GUID, nội dung không bao giờ thay đổi
                //Response.Headers.Append("Cache-Control", "public, max-age=31536000, immutable");

                return File(stream, file.ContentType, file.OriginalFileName);
            }
            catch (FileNotFoundException)
            {
                return NotFound("File not found on disk.");
            }
        }

        // trả về thumbnail của ảnh (nhỏ, load nhanh)
        [HttpGet("{fileId}/thumbnail")]
        public async Task<IActionResult> GetThumbnail(long fileId)
        {
            var userId = GetUserIdFromToken();

            var file = await _context.FileAttachments.FindAsync(fileId);
            if (file == null) return NotFound();

            // Không có thumbnail (không phải ảnh, hoặc tạo thumbnail lỗi)
            if (string.IsNullOrEmpty(file.ThumbnailPath))
                return NotFound("No thumbnail available.");

            var hasAccess = await CheckFileAccess(fileId, userId);
            if (!hasAccess) return Forbid();

            try
            {
                var stream = await _fileStorage.GetAsync(file.ThumbnailPath);
                //Response.Headers.Append("Cache-Control", "public, max-age=31536000, immutable");
                return File(stream, "image/jpeg");
            }
            catch (FileNotFoundException)
            {
                return NotFound("Thumbnail not found on disk.");
            }
        }

        // - helper method -

        // check user có quyền xem file không
        //  File thuộc MessageAttachment → Message thuộc Conversation
        //        → User phải là ConversationParticipant
        // ============================================
        private async Task<bool> CheckFileAccess(long fileId, Guid userId)
        {
            // trường hợp 1: User chính là người upload → cho phép
            var isUploader = await _context.FileAttachments
                .AnyAsync(f => f.Id == fileId && f.UploadedByUserId == userId);
            if (isUploader) return true;

            // trường hợp 2: File nằm trong conversation mà user tham gia
            var conversationIds = await _context.MessageAttachments
                .Where(ma => ma.FileAttachmentId == fileId)
                .Select(ma => ma.Message.ConversationId)
                .Distinct()
                .ToListAsync();

            return await _context.ConversationParticipants
                .AnyAsync(cp => conversationIds.Contains(cp.ConversationId)
                             && cp.UserId == userId);
        }

        private Guid GetUserIdFromToken()
        {
            var userIdString = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value
                            ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            return Guid.Parse(userIdString!);
        }
    }
}
