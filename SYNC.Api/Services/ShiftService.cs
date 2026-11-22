using Microsoft.EntityFrameworkCore;
using SYNC.Api.Data;
using SYNC.Api.DTOs;
using SYNC.Api.Entities;
using SYNC.Api.Interfaces;
using ClosedXML.Excel;
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

    public async Task<List<WorkerListDto>> GetAllWorkersAsync()
    {
        return await _db.Users
            .AsNoTracking()
            .Where(u => u.Role != UserRole.Admin) 
            .Select(u => new WorkerListDto(u.Id, u.FullName, u.Email ?? "", u.PhoneNumber ?? ""))
            .ToListAsync();
    }

    public async Task<List<WorkerIndividualStatsDto>> GetWorkersStatsAsync()
    {
        var workers = await _db.Users
            .Include(u => u.Assignments)
            .ThenInclude(a => a.Shift)
            .Where(u => u.Role == UserRole.Worker)
            .ToListAsync();

        var stats = new List<WorkerIndividualStatsDto>();
        
        foreach (var w in workers)
        {
            var assignments = w.Assignments.ToList();
            
            int dayShifts = assignments.Count(a => 
                a.Shift.StartTime.ToLocalTime().Hour >= 6 && 
                a.Shift.StartTime.ToLocalTime().Hour < 22);
                
            int nightShifts = assignments.Count - dayShifts;

            stats.Add(new WorkerIndividualStatsDto(w.Id, w.FullName, assignments.Count, dayShifts, nightShifts));
        }

        return stats;
    }

    public async Task<OperationResult> UpdateWorkerAsync(int workerId, UpdateWorkerDto dto)
    {
        var worker = await _db.Users.FindAsync(workerId);
        if (worker == null) return new OperationResult(false, "Pracownik nie został znaleziony.");

        worker.FullName = dto.FullName;
        worker.PhoneNumber = dto.PhoneNumber;
        worker.Email = dto.Email;

        await _db.SaveChangesAsync();
        return new OperationResult(true, "Dane pracownika zostały zaktualizowane.");
    }

    public async Task<OperationResult> DeleteWorkerAsync(int workerId)
    {
        var worker = await _db.Users
            .Include(u => u.Assignments) 
            .FirstOrDefaultAsync(u => u.Id == workerId);
            
        if (worker == null) return new OperationResult(false, "Pracownik nie został znaleziony.");

        if (worker.Assignments != null && worker.Assignments.Any())
        {
            _db.ShiftAssignments.RemoveRange(worker.Assignments);
        }

        _db.Users.Remove(worker);
        await _db.SaveChangesAsync();

        return new OperationResult(true, "Konto pracownika zostało usunięte.");
    }

    public async Task<ImportResultDto> ImportWorkersFromExcelAsync(Stream excelStream)
    {
        int successful = 0;
        int failed = 0;
        var errors = new List<string>();

        using var workbook = new XLWorkbook(excelStream);
        var worksheet = workbook.Worksheet(1);
        var rows = worksheet.RangeUsed().RowsUsed().Skip(1);

        foreach (var row in rows)
        {
            try
            {
                var fullName = row.Cell(1).GetValue<string>();
                var phone = row.Cell(2).GetValue<string>();
                var email = row.Cell(3).GetValue<string>();
                var password = row.Cell(4).GetValue<string>();

                if (string.IsNullOrWhiteSpace(email)) continue;

                var exists = await _db.Users.AnyAsync(u => u.Email == email);
                if (exists)
                {
                    failed++;
                    errors.Add($"Email {email} już istnieje.");
                    continue;
                }

                var user = new User
                {
                    FullName = fullName,
                    PhoneNumber = phone,
                    Email = email,
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
                    Role = UserRole.Worker
                };
                
                _db.Users.Add(user);
                successful++;
            }
            catch (Exception ex)
            {
                failed++;
                errors.Add($"Błąd w wierszu {row.RowNumber()}: {ex.Message}");
            }
        }

        if (successful > 0)
            await _db.SaveChangesAsync();

        return new ImportResultDto(successful, failed, errors);
    }
}