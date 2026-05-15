using Healthcare.PatientService.DTOs;

namespace Healthcare.PatientService.Services
{
    public interface IPatientService
    {
        Task<List<ReadPatientDto>> GetAllAsync();
        Task<ReadPatientDto> GetByIdAsync(int id);
        Task<ReadPatientDto> GetByNameAsync(string name);
        Task<ReadPatientDto> CreateAsync(CreatePatientDto dto);
        Task UpdateAsync(int id,UpdatePatientDto dto);
        Task DeleteAsync(int id);
    }
}
