using System.ComponentModel.DataAnnotations;

namespace Healthcare.AppointmentService.DTOs
{
    public class UpdateAppointmentDto
    {
        [Required]
        public string Status { get; set; } = string.Empty;
    }
}
