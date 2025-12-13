using System.Net.Http.Headers;
using System.Text.Json;
using BackEnd.Models;

public class RagChatService
{
    private readonly IHttpClientFactory _http;
    private List<EmbeddingBook>? _bookEmbeddings;
    private List<EmbeddingRule>? _ruleEmbeddings;

    private const string OlamaBaseUrl = "http://localhost:11434";

    public RagChatService(IHttpClientFactory http)
    {
        _http = http;
    }

    private async Task<List<EmbeddingBook>> LoadBookEmbeddingAsync(string fileName)
    {
        var path = Path.Combine(Directory.GetCurrentDirectory(), "Data", fileName);
        var json = await File.ReadAllTextAsync(path);
        return JsonSerializer.Deserialize<List<EmbeddingBook>>(json)!;
    }

    private async Task<List<EmbeddingRule>> LoadRuleEmbeddingAsync(string fileName)
    {
        var path = Path.Combine(Directory.GetCurrentDirectory(), "Data", fileName);
        var json = await File.ReadAllTextAsync(path);
        return JsonSerializer.Deserialize<List<EmbeddingRule>>(json)!;
    }

    private static float CosineSimilarity(float[] a, float[] b)
    {
        if (a.Length != b.Length)
            throw new ArgumentException("Vectors must be of same length");

        float dot = 0, magA = 0, magB = 0;
        for (int i = 0; i < a.Length; i++)
        {
            dot += a[i] * b[i];
            magA += a[i] * a[i];
            magB += b[i] * b[i];
        }

        if (magA == 0 || magB == 0) return 0f;
        return dot / ((float)Math.Sqrt(magA) * (float)Math.Sqrt(magB));
    }

    private HttpClient CreateOlamaClient()
    {
        var client = _http.CreateClient();
        client.BaseAddress = new Uri(OlamaBaseUrl);
        client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
        return client;
    }

    // ===== Dịch VN → EN =====
    private async Task<string> TranslateViToEnAsync(string vietnamese)
    {
        var client = CreateOlamaClient();
        var req = new
        {
            model = "llama3",
            prompt = $"Translate the following Vietnamese text to English:\n{vietnamese}",
            max_tokens = 1024
        };

        var res = await client.PostAsJsonAsync("/v1/completions", req); // ✅ endpoint đúng
        var content = await res.Content.ReadAsStringAsync();

        if (!res.IsSuccessStatusCode)
            throw new Exception($"❌ Olama API error ({res.StatusCode}): {content}");

        var json = JsonSerializer.Deserialize<JsonElement>(content);
        if (json.TryGetProperty("choices", out var choices) && choices.GetArrayLength() > 0)
        {
            var firstChoice = choices[0];
            if (firstChoice.TryGetProperty("text", out var textProp))
                return textProp.GetString()!.Trim();
        }

        throw new Exception("❌ Olama API returned unexpected structure: " + content);
    }

    // ===== Tạo embedding =====
    private async Task<float[]> CreateEmbeddingAsync(string text)
    {
        var client = _http.CreateClient();
        client.BaseAddress = new Uri("http://localhost:11434");

        var req = new
        {
            model = "nomic-embed-text",
            input = text
        };

        var res = await client.PostAsJsonAsync("/v1/embeddings", req);
        var content = await res.Content.ReadAsStringAsync();

        if (!res.IsSuccessStatusCode)
            throw new Exception($"❌ Embedding API error ({res.StatusCode}): {content}");

        var json = JsonSerializer.Deserialize<JsonElement>(content);

        // ✅ Truy cập data[0].embedding
        if (json.TryGetProperty("data", out var data) && data.GetArrayLength() > 0)
        {
            var first = data[0];
            if (first.TryGetProperty("embedding", out var embeddingProp))
            {
                return embeddingProp.EnumerateArray().Select(x => x.GetSingle()).ToArray();
            }
        }

        throw new Exception("❌ Embedding API returned unexpected structure: " + content);
    }


    // ===== Gọi LLaMA3 trả lời =====
    private async Task<string> CallOlamaAsync(string prompt)
    {
        var client = CreateOlamaClient();
        var req = new { model = "llama3", prompt = prompt, max_tokens = 1024 };

        var res = await client.PostAsJsonAsync("/v1/completions", req);
        var content = await res.Content.ReadAsStringAsync();

        if (!res.IsSuccessStatusCode)
            throw new Exception($"❌ Olama API error ({res.StatusCode}): {content}");

        var json = JsonSerializer.Deserialize<JsonElement>(content);
        if (json.TryGetProperty("choices", out var choices) && choices.GetArrayLength() > 0)
        {
            var firstChoice = choices[0];
            if (firstChoice.TryGetProperty("text", out var textProp))
                return textProp.GetString()!.Trim();
        }

        throw new Exception("❌ Olama API returned unexpected response: " + content);
    }

    // ===== HÀM CHÍNH =====
    public async Task<string> AskAsync(string question)
    {
        _bookEmbeddings ??= await LoadBookEmbeddingAsync("embedding_books.json");
        _ruleEmbeddings ??= await LoadRuleEmbeddingAsync("embedding_rule.json");

        // Dịch VN → EN
        var questionEn = await TranslateViToEnAsync(question);

        // Tạo embedding từ câu hỏi tiếng Anh
        var questionEmbedding = await CreateEmbeddingAsync(questionEn);

        // Top 3 sách
        var topBooks = _bookEmbeddings
            .Select(b => new
            {
                b.content_vi,
                Score = CosineSimilarity(questionEmbedding, b.embedding)
            })
            .OrderByDescending(x => x.Score)
            .Take(3)
            .ToList();

        // Top 3 quy định
        var topRules = _ruleEmbeddings
            .Select(r => new
            {
                r.text,
                Score = CosineSimilarity(questionEmbedding, r.embedding)
            })
            .OrderByDescending(x => x.Score)
            .Take(3)
            .ToList();

        // Context bằng Tiếng Việt
        var context = $@"
[SÁCH]
{string.Join("\n", topBooks.Select(x => "- " + x.content_vi))}

[QUY ĐỊNH]
{string.Join("\n", topRules.Select(x => "- " + x.text))}
";

        var prompt = $@"
Bạn là trợ lý AI của thư viện.
Chỉ trả lời dựa trên dữ liệu bên dưới.
Trả lời bằng tiếng việt
Nếu không có thông tin, nói: 'Hiện thư viện chưa có thông tin này.'

===== DỮ LIỆU =====
{context}

===== CÂU HỎI =====
{question}
";

        return await CallOlamaAsync(prompt);
    }
}
