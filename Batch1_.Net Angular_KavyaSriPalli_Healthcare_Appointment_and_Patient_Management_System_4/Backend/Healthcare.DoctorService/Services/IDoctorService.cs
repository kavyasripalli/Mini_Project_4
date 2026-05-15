using Healthcare.DoctorService.DTOs;

namespace Healthcare.DoctorService.Services
{
    public interface IDoctorService
    {
        Task<List<ReadDoctorDto>> GetAllAsync();
        Task<ReadDoctorDto?> GetByIdAsync(int id);
        Task<ReadDoctorDto?> GetByNameAsync(string name);
        Task<ReadDoctorDto?> GerBySpecializationAsync(string specialization);
        Task<ReadDoctorDto> CreateAsync(CreateDoctorDto dto);
        Task UpdateAsync(int id,UpdateDoctorDto dto);
        Task DeleteAsync(int id);
    }
}
