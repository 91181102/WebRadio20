using System.Text.Json.Serialization;

namespace WebRadio20.Models;

/// <summary>
/// Modelo de dados do vídeo do youtube.
/// </summary>
/// <![CDATA[07/11/2026]]>
public class YoutubeVideo
{
    #region: membros da classe
    /// <summary>
    /// ID da tabela YOUTUBE.VIDEOS.
    /// </summary>
    [JsonPropertyName("id")]
    public int Id { get; set; }
    /// <summary>
    /// ID da tabela YOUTUBE.CANAIS.
    /// </summary>
    public int CanalId { get; set; }
    /// <summary>
    /// Nome do canal.
    /// </summary>
    public string? Canal { get; set; }
    /// <summary>
    /// Imagem do canal.
    /// </summary>
    public string? CanalThumbnail { get; set; }
    /// <summary>
    /// ID do vídeo no youtube.
    /// </summary>
    public string? VideoId { get; set; }
    /// <summary>
    /// Descrição do vídeo.
    /// </summary>
    public string? Title { get; set; }
    /// <summary>
    /// Data de publicação do vídeo.
    /// </summary>
    public DateTime PublishedAt { get; set; }
    /// <summary>
    /// Data de publicação.
    /// </summary>
    public string Publicado_em
    {
        get { return this.PublishedAt.ToString("dd/MM/yyyy HH:mm:ss").Replace(" ", " às "); }
    }
    /// <summary>
    /// Imagem do vídeo.
    /// </summary>
    public string? Thumbnail { get; set; }
    /// <summary>
    /// ID do segmento.
    /// </summary>
    public int? SegmentoId { get; set; }
    /// <summary>
    /// Segmento do canal.
    /// </summary>
    public string? Segmento { get; set; }
    /// <summary>
    /// Cor de fundo do segmento.
    /// </summary>
    public string? Background { get; set; }
    /// <summary>
    /// Cor da fonte do segmento.
    /// </summary>
    public string? Foreground { get; set; }
    #endregion

    /// <summary>
    /// Cria uma nova instância da classe YotubeVideo.
    /// </summary>
    public YoutubeVideo()
    {
        Id = 0;
        CanalId = 0;
        Canal = string.Empty;
        CanalThumbnail = string.Empty;
        VideoId = string.Empty;
        Title = string.Empty;
        PublishedAt = DateTime.MinValue;
        Thumbnail = string.Empty;
        SegmentoId = null;
        Segmento = string.Empty;
        Background = string.Empty;
        Foreground = string.Empty;
    }

}
