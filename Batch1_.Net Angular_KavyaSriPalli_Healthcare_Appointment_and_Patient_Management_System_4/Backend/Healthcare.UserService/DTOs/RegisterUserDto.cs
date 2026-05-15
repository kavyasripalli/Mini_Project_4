using System.ComponentModel.DataAnnotations;

namespace Healthcare.UserService.DTOs
{
    public class RegisterUserDto
    {
        [Required,MaxLength(50)]
        public string UserName { get; set; } = string.Empty;

        [Required,MinLength(6),MaxLength(50)]
        public string Password {  get; set; }= string.Empty;

        [Required]
        public string Role { get; set; } = string.Empty;
    }
}
