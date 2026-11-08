using Dapper;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;
using WebRadio20.Data;
using WebRadio20.Models;

namespace WebRadio20.Controllers
{
    public class HomeController : Controller
    {
        private readonly DatabaseConnectionFactory _connectionFactory;
        private readonly ILogger<HomeController> _logger;

        public HomeController(DatabaseConnectionFactory connectionFactory, ILogger<HomeController> logger)
        {
            _connectionFactory = connectionFactory;
            _logger = logger;
        }

        public async Task<IActionResult> TestarConexao()
        {
            try
            {
                await using var connection = _connectionFactory.CreateConnection();

                await connection.OpenAsync();

                var serverVersion = connection.ServerVersion;

                await using var command = connection.CreateCommand();
                command.CommandText = "SHOW SESSION STATUS LIKE 'Ssl_version';";

                await using var reader = await command.ExecuteReaderAsync();

                string? tlsVersion = null;

                if (await reader.ReadAsync())
                {
                    tlsVersion = reader.GetString(1);
                }

                return Json(new
                {
                    Status = "Conectado com sucesso!",
                    Servidor = serverVersion,
                    TLS = tlsVersion
                });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Erro ao conectar ao MariaDB.");

                return StatusCode(503, new
                {
                    Status = "Falha na conexão com o banco de dados."
                });
            }
        }

        public async Task<IActionResult> TestarDapper()
        {
            await using var connection = _connectionFactory.CreateConnection();

            var resultado = await connection.QueryFirstAsync<dynamic>(
                "SELECT DATABASE() AS Banco, VERSION() AS Versao;");

            return Json(resultado);
        }

        public IActionResult Index()
        {
            return View();
        }

        public IActionResult Privacy()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }
}
