namespace SYNC.Api.Entities;

public class User
{
    public int Id { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string PhoneNumber { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string? FcmToken { get; set; }
    public UserRole Role { get; set; }
    
    public decimal HourlyRate { get; set; } = 31.40m;
    public TaxStatus TaxStatus { get; set; } = TaxStatus.Standard;
    public int? FakturowniaClientId { get; set; }
    public List<ShiftAssignment> Assignments { get; set; } = new();
}