using Microsoft.AspNetCore.Mvc;
using WebRadio20.Data.Repositories;

namespace WebRadio20.Controllers;

[ApiController]
[Route("api/[controller]")]
public class YoutubeVideoController : ControllerBase
{
    private readonly YoutubeVideoRepository _repository;

    public YoutubeVideoController(YoutubeVideoRepository repository)
    {
        _repository = repository;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        var videos = await _repository.GetAllAsync();

        var data = videos
            .GroupBy(v => string.IsNullOrWhiteSpace(v.Segmento)
                ? "OUTROS"
                : v.Segmento)
            .ToDictionary(
                group => group.Key.ToLowerInvariant(),
                group => group.ToList()
            );

        return Ok(new
        {
            status = true,
            data
        });
    }
}
