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
}