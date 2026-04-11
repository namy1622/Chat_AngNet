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

        // goi khi Client Invoke("SendTyping", conversationId, participantIds)
        public async Task SendTyping(string conversationId, string[] participantIds)
        {
            // lay info user dang typing(dang go tin)
            var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            //var userName = Context.User?.Identity?.Name ?? "Unknown";
            var userName = Context.User?.FindFirst("UserName")?.Value ?? "Someone";

            if (string.IsNullOrEmpty(userId)) return;

            //
            foreach(var participantId in participantIds)
            {
                // ko gui cho chinh minh
                if (participantId == userId) continue;

                // gui event "UserTyping" cho tung participant 
                await Clients
                    .Group($"user_{participantId}")
                    .SendAsync("UserTyping", new
                    {
                        conversationId = conversationId,
                        userId = userId,
                        userName = userName
                    });
            }
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


/*
    ==== Ly Thuyet ====
------------------------------------
- Client goi hubConnection.invoke("SendTyping...")
    -> SignalR tim method co name Trùng với tham so dau cua invoke 
    -> o day la SendTyping -> goi ham nay

- Khac voi Client.SendAsync (SERVER -> CLIENT)
    invoke la CLIENT -> SERVER - server xu ly -> broadcast cho nguoi khac

- participantIds la list userId trong conversation
    client gui kem de server biet can broadcast cho ai - tranh query DB trong Hub - gui hub don gian 
*/


/*
-----------------------------------------
============ Ly Thuyet ChatHub ==========
-----------------------------------------

1. Hub la trung tam giao tiep giua Client va Server qua Websocket (SignalR)
    - Client goi Invoke("MethodName", params)  -> Hub tim method same name -> chay method do
    - Server goi Clients.SendAsync("EventName", data) -> client lang nghe event "EventName" -> nhan duoc data

Groups.AddToGroupAsync: 
   - Them connectionId vao group (khi connect)
   - Cho phep gui tin nhan theo nhom thay vi tung nguoi
   - Pattern user-level group: "user_{userId}" → moi user co 1 nhom rieng
 */