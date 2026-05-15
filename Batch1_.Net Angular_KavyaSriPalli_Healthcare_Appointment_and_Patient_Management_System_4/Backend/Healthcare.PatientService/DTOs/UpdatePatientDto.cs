using System.ComponentModel.DataAnnotations;

namespace Healthcare.PatientService.DTOs
{
    public class UpdatePatientDto
    {
        
        [Required]
        [Range(0,120)]
        public int Age { get; set; }
        

        [Required]
        [RegularExpression("^[5-9][0-9]{9}$")]
        public string PhoneNumber { get; set; } = string.Empty;

    }
}
