using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChatServer.Application.Common.Exceptions
{
    public class UserFriendlyException : Exception
    {
        public int StatusCode { get; }
        public string? ErrorCode { get; }

        public UserFriendlyException(string message)
            : base(message)
        {
            StatusCode = 400;
        }

        public UserFriendlyException(string message, int statusCode)
            : base(message)
        {
            StatusCode = statusCode;
        }

        public UserFriendlyException(string message, int statusCode, string errorCode)
            : base(message)
        {
            StatusCode = statusCode;
            ErrorCode = errorCode;
        }
    }
}
