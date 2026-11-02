using SYNC.Api.Entities;

namespace SYNC.Api.Interfaces;

public interface ITokenService
{
    string GenerateToken(User user);
}