namespace Healthcare.UserService.DTOs
{
    public class ReadUserDto
    {
        public int Id { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string Role {  get; set; } = string.Empty;
    }
}
