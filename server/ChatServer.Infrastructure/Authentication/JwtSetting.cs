using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace ChatServer.Infrastructure.Authentication
{
    // Class để hứng dữ liệu cấu hình JWT từ appsettings.json
    public class JwtSetting
    {
        public const string SectionName = "JwtSettings";
        public string Secret { set; get; } = null!;
        public int ExpiryMinutes { set; get; }

        public string Issuer { set; get; } = null!;

        public string Audience { set; get; } = null!;
    }
}
