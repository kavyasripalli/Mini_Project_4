using AutoMapper;
using Healthcare.PatientService.DTOs;
using Healthcare.PatientService.Entity;

namespace Healthcare.PatientService.Profiles
{
    public class PatientProfile:Profile
    {
        public PatientProfile()
        {
            CreateMap<Patient, ReadPatientDto>();
            CreateMap<CreatePatientDto, Patient>();
            CreateMap<UpdatePatientDto, Patient>();
        }
    }
}
