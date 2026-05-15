using AutoMapper;
using Healthcare.DoctorService.DTOs;
using Healthcare.DoctorService.Entity;

namespace Healthcare.DoctorService.Profiles
{
    public class DoctorProfile:Profile
    {
        public DoctorProfile()
        {
            CreateMap<Doctor, ReadDoctorDto>();
            CreateMap<CreateDoctorDto, Doctor>();
            CreateMap<UpdateDoctorDto,Doctor>();
        }
    }
}
