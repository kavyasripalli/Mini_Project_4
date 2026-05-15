using AutoMapper;
using Healthcare.DoctorService.DTOs;
using Healthcare.DoctorService.Entity;
using Healthcare.DoctorService.Exceptions;
using Healthcare.DoctorService.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Healthcare.DoctorService.Services
{
    public class DoctorService:IDoctorService
    {
        private readonly IDoctorRepository _repository;
        private readonly IMapper _mapper;
        public DoctorService(IDoctorRepository repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        //Adding Doctor
        public async Task<ReadDoctorDto> CreateAsync(CreateDoctorDto dto)
        {
            if (string.IsNullOrEmpty(dto.Name))
            {
                throw new BadRequestException("Name is Required");
            }
            if (string.IsNullOrEmpty(dto.Specialization))
            {
                throw new BadRequestException("Specialization is required");
            }
            if (string.IsNullOrEmpty(dto.PhoneNumber))
            {
                throw new BadRequestException("Phone NUmber is Required");
            }
            if (string.IsNullOrEmpty(dto.Email))
            {
                throw new BadRequestException("Email is required");
            }

            try
            {
                var doctor = _mapper.Map<Doctor>(dto);
                var createdDoctor = await _repository.CreateDoctorAsync(doctor);
                return _mapper.Map<ReadDoctorDto>(createdDoctor);
            }
            catch (DbUpdateException)
            {
                throw new BadRequestException("Email already exists");
            }
        }

        //Deleting Doctor by using id
        public async Task DeleteAsync(int id)
        {
            var doctor=await _repository.GetDoctorByIdAsync(id);
            if (doctor == null)
            {
                throw new NotFoundException($"Doctor with id {id} not found");
            }
            await _repository.DeleteDoctor(doctor);
        }

        //Get doctor by Specialization 
        public async Task<ReadDoctorDto?> GerBySpecializationAsync(string specialization)
        {
            var doctor=await _repository.GetDoctorBySpecializationAsync(specialization);
            if(doctor == null)
            {
                throw new NotFoundException($"Doctor With Specialization {specialization} not found");
            }
            return _mapper.Map<ReadDoctorDto>(doctor);
        }


        //Getting all Doctors
        public async Task<List<ReadDoctorDto>> GetAllAsync()
        {
            var doctors = await _repository.GetDoctorsAsync();
            return _mapper.Map<List<ReadDoctorDto>>(doctors);
        }

        //Getting doctor by id
        public async Task<ReadDoctorDto?> GetByIdAsync(int id)
        {
            var doctor = await _repository.GetDoctorByIdAsync(id);
            if (doctor == null)
            {
                throw new NotFoundException($"Doctor with id {id} not found");
            }
            return _mapper.Map<ReadDoctorDto>(doctor);
        }

        //Getting doctor by name
        public async Task<ReadDoctorDto?> GetByNameAsync(string name)
        {
            var doctor=await _repository.GetDoctorByNameAsync(name);
            if (doctor == null)
            {
                throw new NotFoundException($"Doctor with name {name} is not Found");
            }
            return _mapper.Map<ReadDoctorDto>(doctor);
        }

        //Updating doctor by using id
        public async Task UpdateAsync(int id, UpdateDoctorDto dto)
        {
            var doctor = await _repository.GetDoctorByIdAsync(id);
            if(doctor == null)
            {
                throw new NotFoundException($"Doctor with id {id} not found");
            }
            _mapper.Map(dto, doctor);
            await _repository.UpdateDoctor(doctor);
        }
    }
}
