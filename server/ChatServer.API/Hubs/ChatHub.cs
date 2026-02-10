using Microsoft.AspNetCore.SignalR;

namespace ChatServer.API.Hubs
{
    // hub la noi nhan gui tin nhan giua client va server
    public class ChatHub: Hub
    {
        // ham nay duoc goi khi Client gui tin nhan len server (qua invoke "SendMessage") 
        public async Task SendMessage(string user, string message)
        {
            // nhan duoc tin -> gui lai cho Tat Ca client dang ketnoi
            // "ReceiveMessage" la ten event ma Client dang lang nghe 
            await Clients.All.SendAsync("ReceiveMessage", user, message);
        }
    }
}
