using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace ChatServer.API.Hubs
{
    // hub la noi nhan gui tin nhan giua client va server
    [Authorize]
    public class ChatHub: Hub
    {
        // khi user vua ket noi thanh cong vao server, ham nay se duoc goi
        //[Authorize] // bat buoc phai co Token moi duoc ket noi 
        public override async Task OnConnectedAsync()
        {
            // ham nay se lay userId tu claim cua user, sau do them user vao group rieng cua no (user_{userId})
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (!string.IsNullOrEmpty(userId))
            {
                // add user vao group rieng cau min "user_guid_id"
                await Groups.AddToGroupAsync(Context.ConnectionId, $"user_{userId}");

                Console.WriteLine($"--> User {userId} joined group user_{userId}");
            }

            await base.OnConnectedAsync();
        }

        // ham gui tin (chi dung de test - thuc te dung API Controller)
        // ham nay duoc goi khi Client gui tin nhan len server (qua invoke "SendMessage") 
        // tat ca client lắng nghe event "ReceiveMessage" deu nhan duoc tin nhan nay
        public async Task SendMessage(string senderId, string user, string message)
        {
            // nhan duoc tin -> gui lai cho Tat Ca client dang ketnoi
            // "ReceiveMessage" la ten event ma Client dang lang nghe 
            // Clients.All: gui cho tat ca client dang ket noi
            //await Clients.All.SendAsync("ReceiveMessage", senderId, user, message);
        }
    }
}
