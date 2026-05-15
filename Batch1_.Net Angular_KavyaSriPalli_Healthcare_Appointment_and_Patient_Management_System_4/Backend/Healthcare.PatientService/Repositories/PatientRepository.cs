using Healthcare.PatientService.Data;
using Healthcare.PatientService.Entity;
using Microsoft.EntityFrameworkCore;

namespace Healthcare.PatientService.Repositories
{
    public class PatientRepository:IPatientRepository
    {
        private readonly PatientDbContext _context;

        public PatientRepository(PatientDbContext context)
        {
            _context = context;
        }


        //Creating patient in repository
        public async Task<Patient> CreatePatientAsync(Patient patient)
        {
            _context.Patients.Add(patient);
            await _context.SaveChangesAsync();
            return patient;
        }

        //Deleting patient in repository
        public async Task DeletePatientAsync(Patient patient)
        {
            _context.Patients.Remove(patient);
            await _context.SaveChangesAsync();
        }

        //Get patient by using Id
        public async Task<Patient?> GetPatientByIdAsync(int id)
        {
            var patient = await _context.Patients.FirstOrDefaultAsync(x => x.Id == id);
            return patient;
        }


        //Get Patient by using Name
        public async Task<Patient?> GetPatientByNameAsync(string name)
        {
            var patient=await _context.Patients.FirstOrDefaultAsync(x=>x.Name==name);
            return patient;
        }

        //Getting all Patients
        public async Task<List<Patient>> GetPatientsAsync()
        {
            return await _context.Patients.ToListAsync();
        }

        public async Task UpdatePatientAsync(Patient patient)
        {
            _context.Patients.Update(patient);
            await _context.SaveChangesAsync();
        }
    }
}
