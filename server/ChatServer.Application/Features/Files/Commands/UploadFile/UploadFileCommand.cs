using MediatR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChatServer.Application.Features.Files.Commands.UploadFile
{
    public record UploadFileCommand(
        Stream FileStream, // content file (from IFormFile.OpenReadStream())
        string FileName,   // ten file goc
        string ContentType, // MINE type
        long Size,  // bytes
        Guid UploadedByUserId // from JWT token 
        ) : IRequest<UploadFileResult>;
}
