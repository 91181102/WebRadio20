
using Microsoft.AspNetCore.Mvc;
using WebRadio20.Data.Repositories;
using Microsoft.Extensions.Caching.Memory;
using WebRadio20.Models;

namespace WebRadio20.Controllers;

[ApiController]
[Route("api/[controller]")]
public class YoutubeVideoController : ControllerBase
{
    #region: membros do controle
    private readonly YoutubeVideoRepository _repository;
    private readonly ILogger<YoutubeVideoController> _logger;
    private readonly IMemoryCache _cache;
    private const string CacheKey = "YoutubeVideos:All";
    private static readonly SemaphoreSlim _cacheLock = new(1, 1);
    private static readonly TimeSpan CacheDuration = TimeSpan.FromMinutes(3);
    #endregion

    public YoutubeVideoController(
        YoutubeVideoRepository repository,
        ILogger<YoutubeVideoController> logger,
        IMemoryCache cache)
    {
        _repository = repository;
        _logger = logger;
        _cache = cache;
    }

    /// <summary>
    /// Carrega as notícias do SQL ou do Cache.
    /// </summary>
    /// <returns></returns>
    /// <![CDATA[08/11/2026]]>
    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        try
        {
            // Verifica se os dados já estão no cache
            if (_cache.TryGetValue<Dictionary<string, List<YoutubeVideo>>>(
                CacheKey, out var cachedData))
            {
                return Ok(new
                {
                    status = true,
                    data = cachedData
                });
            }

            // Evita consultas simultâneas ao banco
            await _cacheLock.WaitAsync();

            try
            {
                // Verifica novamente após adquirir o bloqueio
                if (_cache.TryGetValue<Dictionary<string, List<YoutubeVideo>>>(
                    CacheKey, out cachedData))
                {
                    return Ok(new
                    {
                        status = true,
                        data = cachedData
                    });
                }

                // Consulta o banco somente se não houver cache
                var videos = await _repository.GetAllAsync();

                var data = videos
                    .GroupBy(v => string.IsNullOrWhiteSpace(v.Segmento)
                        ? "OUTROS"
                        : v.Segmento)
                    .ToDictionary(
                        group => group.Key.ToLowerInvariant(),
                        group => group.ToList()
                    );

                // Armazena os dados por 3 minutos
                _cache.Set(CacheKey, data, CacheDuration);

                return Ok(new
                {
                    status = true,
                    data
                });
            }
            finally
            {
                _cacheLock.Release();
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(
                ex,
                "Erro ao consultar os vídeos do YouTube no banco de dados."
            );

            return StatusCode(500, new
            {
                status = false,
                message = "Não foi possível carregar as notícias no momento."
            });
        }
    }
}
