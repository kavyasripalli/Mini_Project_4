namespace Healthcare.DoctorService.DTOs
{
    public class ReadDoctorDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Specialization { get; set; } = string.Empty;
        public DateTime AvailableFrom { get; set; }
        public DateTime AvailableTo { get; set; }
        public string PhoneNumber { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
    }
}
