namespace SYNC.Api.DTOs;

public record LoginDto(string Email, string Password);

public record RegisterDto(
    string FullName, 
    string Email, 
    string Password,
    int Role
);

public record AuthResponseDto(
    string Token, 
    string Email, 
    string Role
);

public record ChangePasswordDto(string CurrentPassword, string NewPassword);