using Healthcare.DoctorService.Entity;

namespace Healthcare.DoctorService.Repositories
{
    public interface IDoctorRepository
    {
        Task<List<Doctor>> GetDoctorsAsync();
        Task<Doctor?> GetDoctorByIdAsync(int id);
        Task<Doctor?> GetDoctorByNameAsync(string name);
        Task<Doctor?> GetDoctorBySpecializationAsync(string specialization);
        Task<Doctor> CreateDoctorAsync(Doctor doctor);
        Task UpdateDoctor(Doctor doctor);
        Task DeleteDoctor(Doctor doctor);
    }
}
