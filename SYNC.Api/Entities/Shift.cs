namespace SYNC.Api.Entities;


public class Shift
{
    public int Id { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public int RequiredWorkers { get; set; }
    public string? Description { get; set; }

    public int CoordinatorId { get; set; }
    public User Coordinator { get; set; } = null!;

    public List<ShiftAssignment> Assignments { get; set; } = new();
}