namespace SYNC.Api.DTOs;

public record CreateShiftPoolDto(DateTime StartTime, DateTime EndTime, int Spots, string? Description);

public record CrmShiftDto(int Id, DateTime StartTime, DateTime EndTime, string Description, int RequiredWorkers, List<CrmWorkerDto> Workers);

public record CrmWorkerDto(int Id, string FullName);

public record OperationResult(bool Success, string Message);