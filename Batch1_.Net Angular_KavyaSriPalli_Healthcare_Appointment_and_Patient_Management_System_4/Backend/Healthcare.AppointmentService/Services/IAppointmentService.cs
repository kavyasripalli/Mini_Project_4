using Healthcare.AppointmentService.DTOs;

namespace Healthcare.AppointmentService.Services
{
    public interface IAppointmentService
    {
        Task<List<ReadAppointmentDto>> GetAllAsync();
        Task<ReadAppointmentDto> GetByIdAsync(int id);
        Task<ReadAppointmentDto> CreateAsync(CreateAppointmentDto dto);
        Task CancelAsync(int id);
        Task CompleteAsync(int id);
        Task DeleteAsync(int id);
    }
}
