using Dapper;
using WebRadio20.Models;

namespace WebRadio20.Data.Repositories;

public class YoutubeVideoRepository
{
    private readonly DatabaseConnectionFactory _connectionFactory;

    public YoutubeVideoRepository(
        DatabaseConnectionFactory connectionFactory)
    {
        _connectionFactory = connectionFactory;
    }

    public async Task<IEnumerable<YoutubeVideo>> GetAllAsync()
    {
        const string sql = @"
            SELECT
                V.id AS Id,
                V.canal_id AS CanalId,
                C.title AS Canal,
                C.thumbnail AS CanalThumbnail,
                V.videoId AS VideoId,
                V.title AS Title,
                V.publishedAt AS PublishedAt,
                V.thumbnail AS Thumbnail,
                C.segmento_id AS SegmentoId,
                S.name AS Segmento,
                S.background_color AS Background,
                S.foreground_color AS Foreground
            FROM techs832_radiodj16.YOUTUBE_VIDEOS V
            LEFT JOIN techs832_radiodj16.YOUTUBE_CANAIS C
                ON C.id = V.canal_id
            LEFT JOIN techs832_radiodj16.YOUTUBE_SEGMENTOS S
                ON S.id = C.segmento_id
            ORDER BY V.publishedAt DESC
            LIMIT 200;";

        using var connection = _connectionFactory.CreateConnection();

        return await connection.QueryAsync<YoutubeVideo>(sql);
    }
}
