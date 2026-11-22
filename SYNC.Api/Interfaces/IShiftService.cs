using SYNC.Api.DTOs;

namespace SYNC.Api.Interfaces;

public interface IShiftService
{
    Task<OperationResult> CreateShiftPoolAsync(CreateShiftPoolDto dto, int coordinatorId);
    Task<List<CrmShiftDto>> GetAllShiftsAsync();
    Task<OperationResult> AssignWorkerManuallyAsync(int shiftId, int workerId);
    Task<OperationResult> RemoveWorkerFromShiftAsync(int shiftId, int workerId);
    Task<OperationResult> DeleteShiftAsync(int shiftId);
    
    Task<List<WorkerListDto>> GetAllWorkersAsync();
    Task<List<WorkerIndividualStatsDto>> GetWorkersStatsAsync();
    Task<ImportResultDto> ImportWorkersFromExcelAsync(Stream excelStream);
    Task<OperationResult> UpdateWorkerAsync(int workerId, UpdateWorkerDto dto);
    Task<OperationResult> DeleteWorkerAsync(int workerId);
}