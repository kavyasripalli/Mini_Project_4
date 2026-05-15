using System.ComponentModel.DataAnnotations;

namespace Healthcare.DoctorService.DTOs
{
    public class UpdateDoctorDto
    {
        [Required, MaxLength(50)]
        public string Specialization { get; set; } = string.Empty;
        [Required]
        public DateTime AvailableFrom { get; set; }

        [Required]
        public DateTime AvailableTo { get; set; }

        [Required, RegularExpression("^[5-9][0-9]{9}$")]
        public string PhoneNumber { get; set; } = string.Empty;
        [Required, EmailAddress,MaxLength(50)]
        public string Email { get; set; } = string.Empty;
    }
}
