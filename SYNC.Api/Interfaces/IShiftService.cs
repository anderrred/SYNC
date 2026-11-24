using SYNC.Api.DTOs;

namespace SYNC.Api.Interfaces;

public interface IShiftService
{
    Task<OperationResult> CreateShiftPoolAsync(CreateShiftPoolDto dto, int coordinatorId);
    Task<List<CrmShiftDto>> GetAllShiftsAsync();
    Task<CrmShiftDto?> GetShiftByIdAsync(int shiftId);
    Task<OperationResult> AssignWorkerManuallyAsync(int shiftId, int workerId);
    Task<OperationResult> RemoveWorkerFromShiftAsync(int shiftId, int workerId);
    Task<OperationResult> DeleteShiftAsync(int shiftId);
    
    Task<List<WorkerListDto>> GetAllWorkersAsync();
    Task<List<WorkerHrDto>> GetStaffAsync(int month, int year);
    Task<WorkerHrDto?> GetStaffMemberAsync(int workerId, int month, int year);
    Task<OperationResult> CreateWorkerAsync(CreateWorkerDto dto);
    Task<List<WorkerIndividualStatsDto>> GetWorkersStatsAsync();
    Task<ImportResultDto> ImportWorkersFromExcelAsync(Stream excelStream);
    Task<OperationResult> UpdateWorkerAsync(int workerId, UpdateWorkerDto dto);
    Task<OperationResult> DeleteWorkerAsync(int workerId);
}