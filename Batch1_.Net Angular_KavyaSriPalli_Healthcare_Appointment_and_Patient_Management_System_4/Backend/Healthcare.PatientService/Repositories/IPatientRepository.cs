using Healthcare.PatientService.Entity;

namespace Healthcare.PatientService.Repositories
{
    public interface IPatientRepository
    {
        Task<List<Patient>> GetPatientsAsync();
        Task<Patient?> GetPatientByIdAsync(int id);
        Task<Patient?> GetPatientByNameAsync(string name);
        Task<Patient> CreatePatientAsync(Patient patient);
        Task UpdatePatientAsync(Patient patient);
        Task DeletePatientAsync(Patient patient);
    }
}
