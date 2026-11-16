using Microsoft.EntityFrameworkCore;
using SYNC.Api.Data;
using SYNC.Api.DTOs;
using SYNC.Api.Entities;
using SYNC.Api.Interfaces;

namespace SYNC.Api.Services;

public class ShiftService : IShiftService
{
    private readonly AppDbContext _db;

    public ShiftService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<OperationResult> CreateShiftPoolAsync(CreateShiftPoolDto dto, int coordinatorId)
    {
        var shift = new Shift
        {
            StartTime = dto.StartTime.ToUniversalTime(),
            EndTime = dto.EndTime.ToUniversalTime(),
            RequiredWorkers = dto.Spots,
            Description = dto.Description,
            CoordinatorId = coordinatorId
        };

        _db.Shifts.Add(shift);
        await _db.SaveChangesAsync();

        return new OperationResult(true, $"Utworzono pulę na {dto.Spots} miejsc pomyślnie!");
    }

    public async Task<List<CrmShiftDto>> GetAllShiftsAsync()
    {
        return await _db.Shifts
            .AsNoTracking()
            .OrderBy(s => s.StartTime)
            .Select(s => new CrmShiftDto(
                s.Id,
                s.StartTime,
                s.EndTime,
                s.Description ?? "",
                s.RequiredWorkers,
                s.Assignments.Select(sa => new CrmWorkerDto(sa.Worker.Id, sa.Worker.FullName)).ToList()
            ))
            .ToListAsync();
    }

    public async Task<OperationResult> AssignWorkerManuallyAsync(int shiftId, int workerId)
    {
        var shift = await _db.Shifts
            .Include(s => s.Assignments)
            .FirstOrDefaultAsync(s => s.Id == shiftId);

        if (shift == null)
            return new OperationResult(false, "Nie znaleziono takiej zmiany.");

        if (shift.Assignments.Any(sa => sa.WorkerId == workerId))
            return new OperationResult(false, "Ten pracownik jest już przypisany do tej zmiany!");

        _db.ShiftAssignments.Add(new ShiftAssignment
        {
            ShiftId = shiftId,
            WorkerId = workerId,
            IsReplacementRequested = false
        });

        await _db.SaveChangesAsync();

        return new OperationResult(true, "Pracownik został pomyślnie przypisany ręcznie!");
    }

    public async Task<OperationResult> RemoveWorkerFromShiftAsync(int shiftId, int workerId)
    {
        var assignment = await _db.ShiftAssignments
            .FirstOrDefaultAsync(sa => sa.ShiftId == shiftId && sa.WorkerId == workerId);

        if (assignment == null)
            return new OperationResult(false, "Nie znaleziono pracownika na tej zmianie.");

        _db.ShiftAssignments.Remove(assignment);
        await _db.SaveChangesAsync();

        return new OperationResult(true, "Pracownik został usunięty ze zmiany.");
    }

    public async Task<OperationResult> DeleteShiftAsync(int shiftId)
    {
        var shift = await _db.Shifts.FindAsync(shiftId);
        if (shift == null)
            return new OperationResult(false, "Nie znaleziono takiej zmiany.");

        _db.Shifts.Remove(shift);
        await _db.SaveChangesAsync();

        return new OperationResult(true, "Zmiana została pomyślnie usunięta!");
    }
}