namespace Healthcare.PatientService.Entity
{
    public class Patient
    {
        public int Id {  get; set; }
        public string Name { get; set; }=string.Empty;
        public int Age {  get; set; }
        public string Gender { get; set; } = string.Empty;
        public string PhoneNumber {  get; set; }=string.Empty;
        public string Email {  get; set; }=string.Empty;

    }
}
