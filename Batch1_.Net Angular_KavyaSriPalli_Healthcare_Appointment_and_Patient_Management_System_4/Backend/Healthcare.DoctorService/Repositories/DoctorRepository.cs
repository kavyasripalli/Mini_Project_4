using Healthcare.DoctorService.Data;
using Healthcare.DoctorService.Entity;
using Microsoft.EntityFrameworkCore;

namespace Healthcare.DoctorService.Repositories
{
    public class DoctorRepository:IDoctorRepository
    {
        private readonly DoctorDBContext _context;

        public DoctorRepository(DoctorDBContext context)
        {
            _context = context;
        }

        public async Task<Doctor> CreateDoctorAsync(Doctor doctor)
        {
            _context.Doctors.Add(doctor);
            await _context.SaveChangesAsync();
            return doctor;
        }

        public async Task DeleteDoctor(Doctor doctor)
        {
            _context.Doctors.Remove(doctor);
            await _context.SaveChangesAsync();
        }

        public async Task<Doctor?> GetDoctorByIdAsync(int id)
        {
            return await _context.Doctors.FindAsync(id);
        }

        public async Task<Doctor?> GetDoctorByNameAsync(string name)
        {
            return await _context.Doctors.FirstOrDefaultAsync(d => d.Name == name);
        }

        public async Task<Doctor?> GetDoctorBySpecializationAsync(string specialization)
        {
            return await _context.Doctors.FirstOrDefaultAsync(d=>d.Specialization== specialization);
        }

        public async Task<List<Doctor>> GetDoctorsAsync()
        {
            return await _context.Doctors.ToListAsync();
        }

        public async Task UpdateDoctor(Doctor doctor)
        {
            _context.Doctors.Update(doctor);
            await _context.SaveChangesAsync();
        }
    }
}
