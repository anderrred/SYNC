using Microsoft.EntityFrameworkCore;
using SYNC.Api.Data;
using SYNC.Api.DTOs;
using SYNC.Api.Entities;
using SYNC.Api.Interfaces;

namespace SYNC.Api.Services;

public class AuthService : IAuthService
{
    private readonly AppDbContext _db;
    private readonly ITokenService _tokenService;

    public AuthService(AppDbContext db, ITokenService tokenService)
    {
        _db = db;
        _tokenService = tokenService;
    }

    public async Task<AuthResult> RegisterAsync(RegisterDto dto)
    {
        if (await _db.Users.AnyAsync(u => u.Email == dto.Email))
        {
            return new AuthResult(false, "Użytkownik z tym adresem email już istnieje.");
        }

        var user = new User
        {
            FullName = dto.FullName,
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            Role = (UserRole)dto.Role
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        return new AuthResult(true, "Rejestracja zakończona sukcesem.");
    }

    public async Task<AuthResponseDto?> LoginAsync(LoginDto dto)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);

        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
        {
            return null;
        }

        var token = _tokenService.GenerateToken(user);

        return new AuthResponseDto(token, user.Email, user.Role.ToString());
    }
}