using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SYNC.Api.DTOs;
using SYNC.Api.Interfaces;

namespace SYNC.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ShiftsController : ControllerBase
{
    private readonly IShiftService _shiftService;

    public ShiftsController(IShiftService shiftService)
    {
        _shiftService = shiftService;
    }

    private int GetUserId()
    {
        var claim = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return int.TryParse(claim, out int userId) ? userId : 0;
    }

    [HttpPost("create-pool")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateShiftPool([FromBody] CreateShiftPoolDto dto)
    {
        var result = await _shiftService.CreateShiftPoolAsync(dto, GetUserId());
        if (!result.Success) return BadRequest(new { title = result.Message });
        
        return Ok(new { message = result.Message });
    }

    [HttpGet("all")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAllShifts()
    {
        var shifts = await _shiftService.GetAllShiftsAsync();
        return Ok(shifts);
    }

    [HttpGet("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetShiftById(int id)
    {
        var shift = await _shiftService.GetShiftByIdAsync(id);
        if (shift == null)
            return NotFound(new { title = "Nie znaleziono takiej zmiany." });

        return Ok(shift);
    }

    [HttpPost("{shiftId}/assign/{workerId}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> AssignWorkerManually(int shiftId, int workerId)
    {
        var result = await _shiftService.AssignWorkerManuallyAsync(shiftId, workerId);
        if (!result.Success) return BadRequest(new { title = result.Message });

        return Ok(new { message = result.Message });
    }

    [HttpDelete("{shiftId}/remove/{workerId}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> RemoveWorkerFromShift(int shiftId, int workerId)
    {
        var result = await _shiftService.RemoveWorkerFromShiftAsync(shiftId, workerId);
        if (!result.Success) return BadRequest(new { title = result.Message });

        return Ok(new { message = result.Message });
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteShift(int id)
    {
        var result = await _shiftService.DeleteShiftAsync(id);
        if (!result.Success) return BadRequest(new { title = result.Message });
        
        return Ok(new { message = result.Message });
    }
    [HttpGet("workers")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetAllWorkers()
    {
        return Ok(await _shiftService.GetAllWorkersAsync());
    }

    [HttpGet("workers/staff")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetStaff([FromQuery] int month, [FromQuery] int year)
    {
        if (month is < 1 or > 12 || year < 2000)
            return BadRequest(new { title = "Podaj poprawny miesiąc i rok." });

        return Ok(await _shiftService.GetStaffAsync(month, year));
    }

    [HttpGet("workers/{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetStaffMember(int id, [FromQuery] int month, [FromQuery] int year)
    {
        if (month is < 1 or > 12 || year < 2000)
        {
            month = DateTime.Now.Month;
            year = DateTime.Now.Year;
        }

        var worker = await _shiftService.GetStaffMemberAsync(id, month, year);
        if (worker == null)
            return NotFound(new { title = "Pracownik nie został znaleziony." });

        return Ok(worker);
    }

    [HttpPost("workers")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> CreateWorker([FromBody] CreateWorkerDto dto)
    {
        var result = await _shiftService.CreateWorkerAsync(dto);
        if (!result.Success) return BadRequest(new { title = result.Message });

        return Ok(new { message = result.Message });
    }

    [HttpGet("workers/stats")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> GetWorkersStats()
    {
        return Ok(await _shiftService.GetWorkersStatsAsync());
    }

    [HttpPut("workers/{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> UpdateWorker(int id, [FromBody] UpdateWorkerDto dto)
    {
        var result = await _shiftService.UpdateWorkerAsync(id, dto);
        if (!result.Success) return BadRequest(new { title = result.Message });
        
        return Ok(new { message = result.Message });
    }

    [HttpDelete("workers/{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> DeleteWorker(int id)
    {
        var result = await _shiftService.DeleteWorkerAsync(id);
        if (!result.Success) return BadRequest(new { title = result.Message });
        
        return Ok(new { message = result.Message });
    }

    [HttpPost("workers/import")]
    [Authorize(Roles = "Admin")]
    [RequestSizeLimit(2 * 1024 * 1024)]
    public async Task<IActionResult> ImportWorkers(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { title = "Plik jest pusty lub nie został przesłany." });

        if (file.Length > 2 * 1024 * 1024)
            return BadRequest(new { title = "Plik jest za duży. Maksymalny rozmiar to 2 MB." });

        if (!file.FileName.EndsWith(".xlsx", StringComparison.OrdinalIgnoreCase))
            return BadRequest(new { title = "Obsługiwany jest tylko format .xlsx." });

        using var stream = file.OpenReadStream();
        var result = await _shiftService.ImportWorkersFromExcelAsync(stream);

        if (result.Successful == 0 && result.Failed > 0)
            return BadRequest(new
            {
                title = result.Errors.FirstOrDefault() ?? "Import nie powiódł się.",
                successful = result.Successful,
                failed = result.Failed,
                errors = result.Errors
            });
        
        return Ok(result);
    }
}