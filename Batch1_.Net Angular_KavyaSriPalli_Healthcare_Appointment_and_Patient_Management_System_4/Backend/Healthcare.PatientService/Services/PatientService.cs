using AutoMapper;
using Healthcare.PatientService.DTOs;
using Healthcare.PatientService.Entity;
using Healthcare.PatientService.Exceptions;
using Healthcare.PatientService.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Healthcare.PatientService.Services
{
    public class PatientService:IPatientService
    {
        private readonly IPatientRepository _repository;
        private readonly IMapper _mapper;
        public PatientService(IPatientRepository repository,IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        //Adding patients in CreateDto
        public async Task<ReadPatientDto> CreateAsync(CreatePatientDto dto)
        {
            if (dto.Age < 0)
            {
                throw new BadRequestException("Age Cannot be Negative");
            }
            try
            {
                var patient = _mapper.Map<Patient>(dto);
                var createdPatient = await _repository.CreatePatientAsync(patient);
                return _mapper.Map<ReadPatientDto>(createdPatient);
            }
            catch (DbUpdateException)
            {
                throw new BadRequestException("Email already exists");
            }
        }

        //Removing patient 
        public async Task DeleteAsync(int id)
        {
            var patient = await _repository.GetPatientByIdAsync(id);
            if (patient == null)
            {
                throw new NotFoundException($"Patient with Id {id} not found");
            }
            await _repository.DeletePatientAsync(patient);
        }


        //Getting all the patients by using ReadPatientDto
        public async Task<List<ReadPatientDto>> GetAllAsync()
        {
            var patients = await _repository.GetPatientsAsync();
            return _mapper.Map<List<ReadPatientDto>>(patients);
        }


        //Get Patient by using Id
        public async Task<ReadPatientDto> GetByIdAsync(int id)
        {
            var patient=await _repository.GetPatientByIdAsync(id);
            if (patient == null)
            {
                throw new NotFoundException($"Patient with id {id} not found");
            }
            return _mapper.Map<ReadPatientDto>(patient);
        }


        //Getting Patient By using Name
        public async Task<ReadPatientDto> GetByNameAsync(string name)
        {
            var patient=await _repository.GetPatientByNameAsync(name);
            if(patient == null)
            {
                throw new NotFoundException($"Patient with Name {name} not found");
            }
            return _mapper.Map<ReadPatientDto>(patient);
        }

        //Updating patient by using UpdateDto
        public async Task UpdateAsync(int id,UpdatePatientDto dto)
        {
            var patient = await _repository.GetPatientByIdAsync(id);
            if (patient == null)
            {
                throw new NotFoundException($"Patient with Id {id} not found");
            }
            _mapper.Map(dto, patient);
            await _repository.UpdatePatientAsync(patient);
        }
    }
}
