using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SYNC.Api.Data;

namespace SYNC.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly AppDbContext _db;

    public UsersController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet("me/shifts")]
    public async Task<IActionResult> GetMyShifts()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        
        if (!int.TryParse(userIdClaim, out int userId))
            return Unauthorized("Nie udało się zidentyfikować użytkownika.");

        var shifts = await _db.ShiftAssignments
            .Include(sa => sa.Shift)
            .Where(sa => sa.WorkerId == userId)
            .OrderBy(sa => sa.Shift.StartTime)
            .Select(sa => new
            {
                ShiftId = sa.Shift.Id,
                StartTime = sa.Shift.StartTime,
                EndTime = sa.Shift.EndTime,
                Description = sa.Shift.Description ?? string.Empty
            })
            .ToListAsync();

        return Ok(shifts);
    }
}