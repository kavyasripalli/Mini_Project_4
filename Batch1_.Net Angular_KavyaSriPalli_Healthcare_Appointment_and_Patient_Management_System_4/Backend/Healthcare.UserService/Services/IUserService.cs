using Healthcare.UserService.DTOs;

namespace Healthcare.UserService.Services
{
    public interface IUserService
    {
        Task<List<ReadUserDto>> GetAllAsync();
        Task<ReadUserDto?> GetByIdAsync(int id);
        Task<ReadUserDto> RegisterAsync(RegisterUserDto dto);
        Task<LoginResponseDto> LoginAsync(LoginUserDto dto);
        Task DeleteAsync(int id);
    }
}
