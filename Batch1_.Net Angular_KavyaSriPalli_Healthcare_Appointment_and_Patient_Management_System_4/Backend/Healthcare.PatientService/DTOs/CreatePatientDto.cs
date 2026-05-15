using System.ComponentModel.DataAnnotations;

namespace Healthcare.PatientService.DTOs
{
    public class CreatePatientDto
    {
        [Required]
        [MaxLength(50)]
        public string Name { get; set; }=string.Empty;
        [Required]
        [Range(0, 120)]
        public int Age { get; set; }

        [Required]
        public string Gender {  get; set; }=string.Empty;

        [Required]
        [RegularExpression("^[5-9][0-9]{9}$")]
        public string PhoneNumber {  get; set; }=string.Empty;

        [Required]
        [EmailAddress]
        public string Email {  get; set; }=string.Empty;
    }
}
