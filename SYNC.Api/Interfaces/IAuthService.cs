using SYNC.Api.DTOs;

namespace SYNC.Api.Interfaces;

public record AuthResult(bool Success, string Message);

public interface IAuthService
{
    Task<AuthResult> RegisterAsync(RegisterDto dto);
    Task<AuthResponseDto?> LoginAsync(LoginDto dto);
}