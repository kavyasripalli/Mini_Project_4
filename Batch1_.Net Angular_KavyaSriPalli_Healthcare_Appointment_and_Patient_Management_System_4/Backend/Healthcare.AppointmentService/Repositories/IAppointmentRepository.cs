using Healthcare.AppointmentService.Entity;

namespace Healthcare.AppointmentService.Repositories
{
    public interface IAppointmentRepository
    {
        Task<List<Appointment>> GetAppointmentsAsync();
        Task<Appointment?> GetAppointmentByIdAsync(int id);
        Task<Appointment> CreateAppointmentAsync(Appointment appointment);
        Task UpdateAppointment(Appointment appointment);
        Task DeleteAppointmentAsync(Appointment appointment);
    }
}
