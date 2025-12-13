using Microsoft.AspNetCore.Mvc;

[ApiController]
[Route("api/[controller]")]
public class TestChatController : ControllerBase
{
    private readonly RagChatService _rag;

    public TestChatController(RagChatService rag)
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
