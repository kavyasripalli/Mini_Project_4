using System.Text.Json.Serialization;

namespace Healthcare.AppointmentService.DTOs.External
{
    public class DoctorLookupDto
    {
        public int Id {  get; set; }
        public string Name { get; set; } = string.Empty;
        public string Specialization {  get; set; } = string.Empty;

        public DateTime AvailableFrom { get; set; }
        public DateTime AvailableTo { get; set; }
    }
}
