namespace Healthcare.UserService.Entity
{
    public class User
    {
        public int Id {  get; set; }
        public string UserName { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
    }
}
