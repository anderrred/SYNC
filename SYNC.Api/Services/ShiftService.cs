using System.Net.Mail;
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
        if (dto.Spots < 1)
            return new OperationResult(false, "Liczba miejsc musi być większa od zera.");

        var start = dto.StartTime.ToUniversalTime();
        var end = dto.EndTime.ToUniversalTime();

        if (end <= start)
            return new OperationResult(false, "Godzina zakończenia musi być późniejsza niż godzina rozpoczęcia.");

        var shift = new Shift
        {
            StartTime = start,
            EndTime = end,
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

    public async Task<CrmShiftDto?> GetShiftByIdAsync(int shiftId)
    {
        return await _db.Shifts
            .AsNoTracking()
            .Where(s => s.Id == shiftId)
            .Select(s => new CrmShiftDto(
                s.Id,
                s.StartTime,
                s.EndTime,
                s.Description ?? "",
                s.RequiredWorkers,
                s.Assignments.Select(sa => new CrmWorkerDto(sa.Worker.Id, sa.Worker.FullName)).ToList()
            ))
            .FirstOrDefaultAsync();
    }

    public async Task<OperationResult> AssignWorkerManuallyAsync(int shiftId, int workerId)
    {
        var shift = await _db.Shifts
            .Include(s => s.Assignments)
            .FirstOrDefaultAsync(s => s.Id == shiftId);

        if (shift == null)
            return new OperationResult(false, "Nie znaleziono takiej zmiany.");

        var worker = await _db.Users.FirstOrDefaultAsync(u => u.Id == workerId);
        if (worker == null || worker.Role != UserRole.Worker)
            return new OperationResult(false, "Nie znaleziono pracownika do przypisania.");

        if (shift.Assignments.Count >= shift.RequiredWorkers)
            return new OperationResult(false, "Brak wolnych miejsc na tej zmianie.");

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
            .Where(u => u.Role == UserRole.Worker)
            .Select(u => new WorkerListDto(u.Id, u.FullName, u.Email ?? "", u.PhoneNumber ?? ""))
            .ToListAsync();
    }

    public async Task<List<WorkerHrDto>> GetStaffAsync(int month, int year)
    {
        var workers = await _db.Users
            .AsNoTracking()
            .Include(u => u.Assignments)
            .ThenInclude(a => a.Shift)
            .Where(u => u.Role == UserRole.Worker)
            .OrderBy(u => u.FullName)
            .ToListAsync();

        return workers
            .Select(worker => ToWorkerHrDto(worker, month, year))
            .ToList();
    }

    public async Task<WorkerHrDto?> GetStaffMemberAsync(int workerId, int month, int year)
    {
        var worker = await _db.Users
            .AsNoTracking()
            .Include(u => u.Assignments)
            .ThenInclude(a => a.Shift)
            .FirstOrDefaultAsync(u => u.Id == workerId && u.Role == UserRole.Worker);

        return worker == null ? null : ToWorkerHrDto(worker, month, year);
    }

    public async Task<OperationResult> CreateWorkerAsync(CreateWorkerDto dto)
    {
        var fullName = (dto.FullName ?? "").Trim();
        var email = (dto.Email ?? "").Trim();
        var phone = (dto.PhoneNumber ?? "").Trim();
        var password = dto.Password ?? "";

        if (string.IsNullOrWhiteSpace(fullName))
            return new OperationResult(false, "Imię i nazwisko są wymagane.");

        if (!IsValidEmail(email))
            return new OperationResult(false, "Podaj poprawny adres e-mail.");

        if (string.IsNullOrWhiteSpace(phone))
            return new OperationResult(false, "Numer telefonu jest wymagany.");

        if (password.Length < 8)
            return new OperationResult(false, "Hasło musi mieć co najmniej 8 znaków.");

        if (await _db.Users.AnyAsync(u => u.Email == email))
            return new OperationResult(false, "Użytkownik z tym adresem e-mail już istnieje.");

        _db.Users.Add(new User
        {
            FullName = fullName,
            Email = email,
            PhoneNumber = phone,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
            Role = UserRole.Worker
        });

        await _db.SaveChangesAsync();
        return new OperationResult(true, "Konto pracownika zostało utworzone.");
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
        if (worker == null || worker.Role != UserRole.Worker)
            return new OperationResult(false, "Pracownik nie został znaleziony.");

        var fullName = (dto.FullName ?? "").Trim();
        var email = (dto.Email ?? "").Trim();
        var phone = (dto.PhoneNumber ?? "").Trim();

        if (string.IsNullOrWhiteSpace(fullName))
            return new OperationResult(false, "Imię i nazwisko są wymagane.");

        if (!IsValidEmail(email))
            return new OperationResult(false, "Podaj poprawny adres e-mail.");

        if (string.IsNullOrWhiteSpace(phone))
            return new OperationResult(false, "Numer telefonu jest wymagany.");

        if (await _db.Users.AnyAsync(u => u.Email == email && u.Id != workerId))
            return new OperationResult(false, "Użytkownik z tym adresem e-mail już istnieje.");

        worker.FullName = fullName;
        worker.PhoneNumber = phone;
        worker.Email = email;

        await _db.SaveChangesAsync();
        return new OperationResult(true, "Dane pracownika zostały zaktualizowane.");
    }

    public async Task<OperationResult> DeleteWorkerAsync(int workerId)
    {
        var worker = await _db.Users
            .Include(u => u.Assignments) 
            .FirstOrDefaultAsync(u => u.Id == workerId);
            
        if (worker == null || worker.Role != UserRole.Worker)
            return new OperationResult(false, "Pracownik nie został znaleziony.");

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
        var emailsInFile = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        XLWorkbook workbook;
        try
        {
            workbook = new XLWorkbook(excelStream);
        }
        catch
        {
            return new ImportResultDto(0, 1, ["Nie udało się odczytać pliku. Wymagany jest poprawny arkusz .xlsx."]);
        }

        using (workbook)
        {
            var worksheet = workbook.Worksheets.FirstOrDefault();
            var usedRange = worksheet?.RangeUsed();
            if (worksheet == null || usedRange == null)
                return new ImportResultDto(0, 1, ["Arkusz jest pusty. Oczekiwane kolumny: Imię i nazwisko, Telefon, Email, Hasło."]);

            var headerRow = usedRange.FirstRow();
            if (!HasExpectedImportHeaders(headerRow))
            {
                return new ImportResultDto(0, 1, [
                    "Nieprawidłowy wiersz nagłówka. Wymagane kolumny: Imię i nazwisko, Telefon, Email, Hasło."
                ]);
            }

            foreach (var row in usedRange.RowsUsed().Skip(1))
            {
                try
                {
                    var fullName = row.Cell(1).GetValue<string>().Trim();
                    var phone = row.Cell(2).GetValue<string>().Trim();
                    var email = row.Cell(3).GetValue<string>().Trim();
                    var password = row.Cell(4).GetValue<string>().Trim();

                    if (string.IsNullOrWhiteSpace(fullName) &&
                        string.IsNullOrWhiteSpace(phone) &&
                        string.IsNullOrWhiteSpace(email) &&
                        string.IsNullOrWhiteSpace(password))
                    {
                        continue;
                    }

                    if (string.IsNullOrWhiteSpace(fullName) ||
                        string.IsNullOrWhiteSpace(phone) ||
                        string.IsNullOrWhiteSpace(email) ||
                        string.IsNullOrWhiteSpace(password))
                    {
                        failed++;
                        errors.Add($"Wiersz {row.RowNumber()}: wszystkie kolumny są wymagane.");
                        continue;
                    }

                    if (!IsValidEmail(email))
                    {
                        failed++;
                        errors.Add($"Wiersz {row.RowNumber()}: niepoprawny e-mail ({email}).");
                        continue;
                    }

                    if (password.Length < 8)
                    {
                        failed++;
                        errors.Add($"Wiersz {row.RowNumber()}: hasło musi mieć co najmniej 8 znaków ({email}).");
                        continue;
                    }

                    if (!emailsInFile.Add(email))
                    {
                        failed++;
                        errors.Add($"Wiersz {row.RowNumber()}: e-mail {email} powtarza się w pliku.");
                        continue;
                    }

                    if (await _db.Users.AnyAsync(u => u.Email == email))
                    {
                        failed++;
                        errors.Add($"Wiersz {row.RowNumber()}: e-mail {email} już istnieje.");
                        continue;
                    }

                    _db.Users.Add(new User
                    {
                        FullName = fullName,
                        PhoneNumber = phone,
                        Email = email,
                        PasswordHash = BCrypt.Net.BCrypt.HashPassword(password),
                        Role = UserRole.Worker
                    });
                    successful++;
                }
                catch (Exception ex)
                {
                    failed++;
                    errors.Add($"Błąd w wierszu {row.RowNumber()}: {ex.Message}");
                }
            }
        }

        if (successful > 0)
            await _db.SaveChangesAsync();

        if (successful == 0 && failed == 0)
            errors.Add("Plik nie zawiera żadnych wierszy z danymi pracowników.");

        return new ImportResultDto(successful, failed, errors);
    }

    private static WorkerHrDto ToWorkerHrDto(User worker, int month, int year)
    {
        var shiftsThisMonth = worker.Assignments.Count(assignment =>
        {
            var start = assignment.Shift.StartTime.ToLocalTime();
            return start.Month == month && start.Year == year;
        });

        return new WorkerHrDto(
            worker.Id,
            worker.FullName,
            worker.Email ?? "",
            worker.PhoneNumber ?? "",
            shiftsThisMonth
        );
    }

    private static bool IsValidEmail(string email)
    {
        if (string.IsNullOrWhiteSpace(email))
            return false;

        try
        {
            _ = new MailAddress(email);
            return email.Contains('@');
        }
        catch
        {
            return false;
        }
    }

    private static bool HasExpectedImportHeaders(IXLRangeRow headerRow)
    {
        var name = NormalizeHeader(headerRow.Cell(1).GetValue<string>());
        var phone = NormalizeHeader(headerRow.Cell(2).GetValue<string>());
        var email = NormalizeHeader(headerRow.Cell(3).GetValue<string>());
        var password = NormalizeHeader(headerRow.Cell(4).GetValue<string>());

        var nameOk = name.Contains("imie") || name.Contains("nazwisko") || name.Contains("name");
        var phoneOk = phone.Contains("telefon") || phone.Contains("phone");
        var emailOk = email.Contains("email") || email.Contains("mail");
        var passwordOk = password.Contains("haslo") || password.Contains("password");

        return nameOk && phoneOk && emailOk && passwordOk;
    }

    private static string NormalizeHeader(string value)
    {
        return (value ?? "")
            .Trim()
            .ToLowerInvariant()
            .Replace("ą", "a")
            .Replace("ć", "c")
            .Replace("ę", "e")
            .Replace("ł", "l")
            .Replace("ń", "n")
            .Replace("ó", "o")
            .Replace("ś", "s")
            .Replace("ź", "z")
            .Replace("ż", "z");
    }
}