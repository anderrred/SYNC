namespace SYNC.Api.Entities;


public class ShiftAssignment
{
    public int Id { get; set; }
    public int ShiftId { get; set; }
    public Shift Shift { get; set; } = null!;

    public int WorkerId { get; set; }
    public User Worker { get; set; } = null!;

    public bool IsReplacementRequested { get; set; } = false;
    public bool IsPresent { get; set; } = false;
    public bool ExportedToFakturownia { get; set; } = false;
    public decimal? ActualHoursWorked { get; set; }
}