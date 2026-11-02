using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SYNC.Api.DTOs;
using SYNC.Api.Interfaces;

namespace SYNC.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    [Authorize(Roles = "Coordinator,Admin")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        var result = await _authService.RegisterAsync(dto);
        if (!result.Success) return BadRequest(result.Message);
        
        return Ok(new { message = result.Message });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        var result = await _authService.LoginAsync(dto);
        if (result == null) return Unauthorized("Nieprawidłowy email lub hasło.");
        
        return Ok(result);
    }
}