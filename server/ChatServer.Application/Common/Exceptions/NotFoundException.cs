using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChatServer.Application.Common.Exceptions
{
    public class NotFoundException : UserFriendlyException
    {
        public NotFoundException(string message)
       : base(message, 404) { }

        public NotFoundException(string entity, object id)
            : base($"{entity} with id '{id}' was not found", 404) { }
    }
}
