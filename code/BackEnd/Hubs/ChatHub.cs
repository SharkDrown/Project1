using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

[Authorize]
public class ChatHub : Hub
{
    private readonly RagChatService _rag;

    public ChatHub(RagChatService rag)
    {
        _rag = rag;
    }

    public async Task SendMessage(string message)
    {
        var userId = Context.User?
            .FindFirst(ClaimTypes.NameIdentifier)?.Value;

        var answer = await _rag.AskAsync(
            message
        );

        await Clients.Caller.SendAsync("ReceiveMessage", answer);
    }
}
