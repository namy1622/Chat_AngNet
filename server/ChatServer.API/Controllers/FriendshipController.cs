using ChatServer.API.DTO.Friendship;
using ChatServer.API.Hubs;
using ChatServer.Application.Features.Friendship.Commands.RemoveFriend;
using ChatServer.Application.Features.Friendship.Commands.RespondFriendRequest;
using ChatServer.Application.Features.Friendship.Commands.SendFriendRequest;
using ChatServer.Application.Features.Friendship.Queries.GerFriendshipById;
using ChatServer.Application.Features.Friendship.Queries.GetFriendshipStatus;
using ChatServer.Application.Features.Friendship.Queries.GetFriendsListQuery;
using ChatServer.Application.Features.Friendship.Queries.GetPendingRequests;







//using ChatServer.Application.Chat.Queries.GetFriendshipStatus;
//using ChatServer.Application.Chat.Queries.GetFriendsListQuery;
//using ChatServer.Application.Chat.Queries.GetPendingRequests;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

namespace ChatServer.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class FriendshipController : ControllerBase
    {
        private readonly IMediator _mediator;
        private readonly IHubContext<ChatHub> _chatHubContext;

        public FriendshipController(IMediator mediator, IHubContext<ChatHub> chatHubContext)
        {
            _mediator = mediator;
            _chatHubContext = chatHubContext;
        }

        // post: /api/friendship/request -- gui loi moi ketban
        [HttpPost("request")]
        public async Task<IActionResult> SendFriendRequest([FromBody] SendFriendRequestDto request)
        {
            var userId = GetUserIdFromToken();

            var command = new SendFriendRequestCommand(request.AddresseeId, userId);
            var friendshipId = await _mediator.Send(command);

            // == signalR: thong bao cho nguoi nhan loi moi ==
            // nguoi nhan se thay badge loi moi ket ban moi
            await _chatHubContext.Clients
                .Group($"user_{request.AddresseeId}")
                .SendAsync("FriendRequestReceived", new
                {
                    friendshipId = friendshipId.ToString(),
                    requesterId = userId.ToString(),
                    requesterName = User.FindFirst("UserName")?.Value ?? "" // lay ten nguoi gui tu token
                });

            return Ok(new { friendshipId });
        }

        // put: /api/friendship/{friendshipId}/respond -- chap nhan or tu choi loi moi ket ban
        [HttpPut("{friendshipId}/respond")]
        public async Task<IActionResult> ResponsdFriendRequest(
            Guid friendshipId,
            [FromBody] RespondFriendRequestDto request)
        {
            var userId = GetUserIdFromToken();

            var command = new RepondFriendRequestCommand(friendshipId, userId, request.IsAccepted);
            await _mediator.Send(command);

            var friendCommand = new GetFriendshipByIdQuery(friendshipId);
            var friendship = await _mediator.Send(friendCommand);

            // == signalR: chi nguoi gui loi moi nhan thong bao ==
            // ko broadcast ALL
            await _chatHubContext.Clients
                .Group($"user_{friendship.RequesterId}")
                .SendAsync("FriendRequestRespond", new
                {
                    friendshipId = friendshipId.ToString(),
                    isAccepted = request.IsAccepted,
                    responderId = userId.ToString()
                });

            return Ok(new { success = true });
        }

        // delete: /api/friendship/{friendshipId} -- xoa ban - huy ket ban
        [HttpDelete("{friendshipId}")]
        public async Task<IActionResult> RemoveFriend(Guid friendshipId)
        {
            var userId = GetUserIdFromToken();

            var command = new RemoveFriendCommand(friendshipId, userId);

            await _mediator.Send(command);

            return Ok(new { success = true });
        }

        // get: /api/friendship/friends -- lay list friends
        [HttpGet("friends")]
        public async Task<IActionResult> GetFriendsList()
        {
            var userId = GetUserIdFromToken();

            var query = new GetFriendsListQuery(userId);

            var result = await _mediator.Send(query);

            return Ok(result);
        }

        // GET: /api/friendship/pending  --  Lấy danh sách lời mời kết bạn đang chờ
        [HttpGet("pending")]
        public async Task<IActionResult> GetPendingRequests()
        {
            var userId = GetUserIdFromToken();
            var query = new GetPendingRequestsQuery(userId);
            var result = await _mediator.Send(query);
            return Ok(result);
        }

        // GET: /api/friendship/status/{targetUserId} -- Check trạng thái kết bạn với 1 user
        [HttpGet("status/{targetUserId}")]
        public async Task<IActionResult> GetFriendshipStatus(Guid targetUserId)
        {
            var userId = GetUserIdFromToken();
            var query = new GetFriendshipStatusQuery(userId, targetUserId);
            var result = await _mediator.Send(query);
            return Ok(result);
        }

        // === Helper ===
        private Guid GetUserIdFromToken()
        {
            var userIdString = User.FindFirst(JwtRegisteredClaimNames.Sub)?.Value 
                ?? User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            return Guid.Parse(userIdString!); 
            // ! : bao compiler userIdString chac chan ko null
            //      nhung neu null thi -> crash runtime
        }
    }
}
