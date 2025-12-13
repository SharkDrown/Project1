using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace BackEnd.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ChatbotController : ControllerBase
    {
        private readonly RagChatService _rag;

        public ChatbotController(RagChatService rag)
        {
            _rag = rag;
        }

        [HttpGet("ask")]
        public async Task<IActionResult> Ask([FromQuery] string question)
        {
            if (string.IsNullOrEmpty(question))
                return BadRequest("Vui lòng nhập question");

            var answer = await _rag.AskAsync(question);
            return Ok(new { question, answer });
        }
    }
}
