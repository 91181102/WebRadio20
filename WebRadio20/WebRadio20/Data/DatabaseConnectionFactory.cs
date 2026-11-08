
using Microsoft.AspNetCore.Hosting;
using MySqlConnector;

namespace WebRadio20.Data;

public class DatabaseConnectionFactory
{
    private readonly string _connectionString;

    public DatabaseConnectionFactory(
        IConfiguration configuration,
        IWebHostEnvironment environment)
    {
        var settings = configuration.GetSection("Database");

        var server = settings["Server"];
        var user = settings["User"];
        var password = settings["Password"];
        var database = settings["DefaultDatabase"];
        var sslCa = settings["SslCa"];

        if (string.IsNullOrWhiteSpace(server))
            throw new InvalidOperationException(
                "Database:Server não configurado.");

        if (string.IsNullOrWhiteSpace(user))
            throw new InvalidOperationException(
                "Database:User não configurado.");

        if (string.IsNullOrWhiteSpace(password))
            throw new InvalidOperationException(
                "Database:Password não configurado.");

        if (string.IsNullOrWhiteSpace(database))
            throw new InvalidOperationException(
                "Database:DefaultDatabase não configurado.");

        if (string.IsNullOrWhiteSpace(sslCa))
            throw new InvalidOperationException(
                "Database:SslCa não configurado.");

        var sslCaPath = Path.GetFullPath(
            Path.Combine(environment.ContentRootPath, sslCa));

        if (!File.Exists(sslCaPath))
            throw new FileNotFoundException(
                "Certificado CA do MariaDB não encontrado.",
                sslCaPath);

        var sslMode = settings["SslMode"] ?? "VerifyFull";

        if (!Enum.TryParse<MySqlSslMode>(
            sslMode, true, out var parsedSslMode))
        {
            throw new InvalidOperationException(
                $"Modo SSL inválido: {sslMode}");
        }

        var builder = new MySqlConnectionStringBuilder
        {
            Server = server,
            Port = settings.GetValue<uint>("Port", 3306),
            UserID = user,
            Password = password,
            Database = database,
            SslMode = parsedSslMode,
            SslCa = sslCaPath,
            Pooling = true
        };

        _connectionString = builder.ConnectionString;
    }

    public MySqlConnection CreateConnection()
    {
        return new MySqlConnection(_connectionString);
    }
}
