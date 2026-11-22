namespace SYNC.Api.DTOs;

public record OperationResult(bool Success, string Message);
public record CreateShiftPoolDto(DateTime StartTime, DateTime EndTime, string Description, int Spots);
public record CrmWorkerDto(int WorkerId, string FullName);
public record CrmShiftDto(
    int ShiftId, 
    DateTime StartTime, 
    DateTime EndTime, 
    string Description, 
    int RequiredWorkers, 
    List<CrmWorkerDto> AssignedWorkers
);

public record WorkerListDto(int Id, string FullName, string Email, string PhoneNumber);
public record WorkerStatsDto(int TotalWorkers, int ActiveWorkersToday);
public record UpdateWorkerDto(string FullName, string PhoneNumber, string Email);
public record ImportWorkerDto(string FullName, string PhoneNumber, string Email, string Password);
public record WorkerIndividualStatsDto(
    int WorkerId, 
    string FullName, 
    int TotalShifts, 
    int DayShifts, 
    int NightShifts
);

public record ImportResultDto(int Successful, int Failed, List<string> Errors);