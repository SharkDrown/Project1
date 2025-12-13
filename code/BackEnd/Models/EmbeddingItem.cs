namespace BackEnd.Models;
public partial class EmbeddingBook
{
    public string id { get; set; } = "";
    public int maSach { get; set; }
    public string type { get; set; } = "";
    public string field { get; set; } = "";
    public string content_en { get; set; } = "";
    public string content_vi { get; set; } = "";
    public float[] embedding { get; set; } = Array.Empty<float>();
}
public partial class EmbeddingRule
{
    public string id { get; set; } = "";
    public string text { get; set; } = "";
    public float[] embedding { get; set; } = Array.Empty<float>();
}

