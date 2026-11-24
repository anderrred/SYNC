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
    [Authorize(Roles = "Coordinator,Admin")]
    public async Task<IActionResult> CreateShiftPool([FromBody] CreateShiftPoolDto dto)
    {
        var result = await _shiftService.CreateShiftPoolAsync(dto, GetUserId());
        if (!result.Success) return BadRequest(new { title = result.Message });
        
        return Ok(new { message = result.Message });
    }

    [HttpGet("all")]
    [Authorize(Roles = "Coordinator,Admin")]
    public async Task<IActionResult> GetAllShifts()
    {
        var shifts = await _shiftService.GetAllShiftsAsync();
        return Ok(shifts);
    }

    [HttpGet("{id:int}")]
    [Authorize(Roles = "Coordinator,Admin")]
    public async Task<IActionResult> GetShiftById(int id)
    {
        var shift = await _shiftService.GetShiftByIdAsync(id);
        if (shift == null)
            return NotFound(new { title = "Nie znaleziono takiej zmiany." });

        return Ok(shift);
    }

    [HttpPost("{shiftId}/assign/{workerId}")]
    [Authorize(Roles = "Coordinator,Admin")]
    public async Task<IActionResult> AssignWorkerManually(int shiftId, int workerId)
    {
        var result = await _shiftService.AssignWorkerManuallyAsync(shiftId, workerId);
        if (!result.Success) return BadRequest(new { title = result.Message });

        return Ok(new { message = result.Message });
    }

    [HttpDelete("{shiftId}/remove/{workerId}")]
    [Authorize(Roles = "Coordinator,Admin")]
    public async Task<IActionResult> RemoveWorkerFromShift(int shiftId, int workerId)
    {
        var result = await _shiftService.RemoveWorkerFromShiftAsync(shiftId, workerId);
        if (!result.Success) return BadRequest(new { title = result.Message });

        return Ok(new { message = result.Message });
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Coordinator,Admin")]
    public async Task<IActionResult> DeleteShift(int id)
    {
        var result = await _shiftService.DeleteShiftAsync(id);
        if (!result.Success) return BadRequest(new { title = result.Message });
        
        return Ok(new { message = result.Message });
    }
    [HttpGet("workers")]
    [Authorize(Roles = "Coordinator,Admin")]
    public async Task<IActionResult> GetAllWorkers()
    {
        return Ok(await _shiftService.GetAllWorkersAsync());
    }

    [HttpGet("workers/stats")]
    [Authorize(Roles = "Coordinator,Admin")]
    public async Task<IActionResult> GetWorkersStats()
    {
        return Ok(await _shiftService.GetWorkersStatsAsync());
    }

    [HttpPut("workers/{id}")]
    [Authorize(Roles = "Coordinator,Admin")]
    public async Task<IActionResult> UpdateWorker(int id, [FromBody] UpdateWorkerDto dto)
    {
        var result = await _shiftService.UpdateWorkerAsync(id, dto);
        if (!result.Success) return BadRequest(new { title = result.Message });
        
        return Ok(new { message = result.Message });
    }

    [HttpDelete("workers/{id}")]
    [Authorize(Roles = "Coordinator,Admin")]
    public async Task<IActionResult> DeleteWorker(int id)
    {
        var result = await _shiftService.DeleteWorkerAsync(id);
        if (!result.Success) return BadRequest(new { title = result.Message });
        
        return Ok(new { message = result.Message });
    }

    [HttpPost("workers/import")]
    [Authorize(Roles = "Coordinator,Admin")]
    public async Task<IActionResult> ImportWorkers(IFormFile file)
    {
        if (file == null || file.Length == 0)
            return BadRequest(new { title = "Plik jest pusty lub nie został przesłany." });

        if (!file.FileName.EndsWith(".xlsx"))
            return BadRequest(new { title = "Obsługiwany jest tylko format .xlsx" });

        using var stream = file.OpenReadStream();
        var result = await _shiftService.ImportWorkersFromExcelAsync(stream);
        
        return Ok(result);
    }
}