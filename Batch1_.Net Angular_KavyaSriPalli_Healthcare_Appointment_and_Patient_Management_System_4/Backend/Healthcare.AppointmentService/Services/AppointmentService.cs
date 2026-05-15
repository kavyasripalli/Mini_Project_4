using System.Net.Http.Headers;
using AutoMapper;
using Healthcare.AppointmentService.DTOs;
using Healthcare.AppointmentService.DTOs.External;
using Healthcare.AppointmentService.Entity;
using Healthcare.AppointmentService.Exceptions;
using Healthcare.AppointmentService.Repositories;

namespace Healthcare.AppointmentService.Services
{
    public class AppointmentService : IAppointmentService
    {
        private readonly IAppointmentRepository _repository;
        private readonly IMapper _mapper;
        private readonly IHttpClientFactory _httpClientFactory;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public AppointmentService(
            IAppointmentRepository repository,
            IMapper mapper,
            IHttpClientFactory httpClientFactory,
            IHttpContextAccessor httpContextAccessor)
        {
            _repository = repository;
            _mapper = mapper;
            _httpClientFactory = httpClientFactory;
            _httpContextAccessor = httpContextAccessor;
        }

        // Get Patient by Id using API
        private async Task<PatientLookupDto?> GetPatientAsync(int patientId)
        {
            var client = _httpClientFactory.CreateClient("PatientApi");

            var authHeader =
                _httpContextAccessor.HttpContext?
                .Request.Headers.Authorization.ToString();

            if (!string.IsNullOrWhiteSpace(authHeader))
            {
                client.DefaultRequestHeaders.Authorization =
                    AuthenticationHeaderValue.Parse(authHeader);
            }

            // FIXED URL
            var response =
                await client.GetAsync($"api/patient/Patient/{patientId}");

            if (!response.IsSuccessStatusCode)
            {
                return null;
            }

            return await response.Content
                .ReadFromJsonAsync<PatientLookupDto>();
        }

        // Get Doctor by Id using API
        private async Task<DoctorLookupDto?> GetDoctorAsync(int doctorId)
        {
            var client = _httpClientFactory.CreateClient("DoctorApi");

            var authHeader =
                _httpContextAccessor.HttpContext?
                .Request.Headers.Authorization.ToString();

            if (!string.IsNullOrWhiteSpace(authHeader))
            {
                client.DefaultRequestHeaders.Authorization =
                    AuthenticationHeaderValue.Parse(authHeader);
            }

            // FIXED URL
            var response =
                await client.GetAsync($"api/doctor/Doctor/{doctorId}");

            if (!response.IsSuccessStatusCode)
            {
                return null;
            }

            return await response.Content
                .ReadFromJsonAsync<DoctorLookupDto>();
        }

        // Cancel Appointment
        public async Task CancelAsync(int id)
        {
            var appointment = await _repository.GetAppointmentByIdAsync(id);

            if (appointment == null)
            {
                throw new NotFoundException(
                    $"Appointment with Id {id} not found");
            }

            if (appointment.Status == AppointmentStatus.Completed)
            {
                throw new BadRequestException(
                    "Completed appointment cannot be cancelled");
            }

            if (appointment.Status == AppointmentStatus.Cancelled)
            {
                throw new BadRequestException(
                    "Appointment is already cancelled");
            }

            appointment.Status = AppointmentStatus.Cancelled;

            await _repository.UpdateAppointment(appointment);
        }

        // Complete Appointment
        public async Task CompleteAsync(int id)
        {
            var appointment = await _repository.GetAppointmentByIdAsync(id);

            if (appointment == null)
            {
                throw new NotFoundException(
                    $"Appointment with Id {id} not found");
            }

            if (appointment.Status == AppointmentStatus.Cancelled)
            {
                throw new BadRequestException(
                    "Cancelled appointment cannot be completed");
            }

            if (appointment.Status == AppointmentStatus.Completed)
            {
                throw new BadRequestException(
                    "Appointment is already completed");
            }

            appointment.Status = AppointmentStatus.Completed;

            await _repository.UpdateAppointment(appointment);
        }

        // Create Appointment
        public async Task<ReadAppointmentDto> CreateAsync(
            CreateAppointmentDto dto)
        {
            if (dto.PatientId <= 0 || dto.DoctorId <= 0)
            {
                throw new BadRequestException(
                    "PatientId and DoctorId must be valid");
            }

            if (dto.AppointmentDate.Hour < 9 ||
                dto.AppointmentDate.Hour > 18)
            {
                throw new BadRequestException(
                    "Appointment must be between 9 AM and 6 PM");
            }

            var patient = await GetPatientAsync(dto.PatientId);

            if (patient == null)
            {
                throw new NotFoundException(
                    $"Patient with Id {dto.PatientId} not found");
            }

            var doctor = await GetDoctorAsync(dto.DoctorId);

            if (doctor == null)
            {
                throw new NotFoundException(
                    $"Doctor with Id {dto.DoctorId} not found");
            }

            if (dto.AppointmentDate < doctor.AvailableFrom ||
                dto.AppointmentDate > doctor.AvailableTo)
            {
                throw new BadRequestException(
                    "Selected appointment time is not available for this doctor");
            }

            var appointment = _mapper.Map<Appointment>(dto);

            appointment.Status = AppointmentStatus.Booked;

            var created =
                await _repository.CreateAppointmentAsync(appointment);

            return _mapper.Map<ReadAppointmentDto>(created);
        }

        // Delete Appointment
        public async Task DeleteAsync(int id)
        {
            var appointment = await _repository.GetAppointmentByIdAsync(id);

            if (appointment == null)
            {
                throw new NotFoundException(
                    $"Appointment with Id {id} not found");
            }

            await _repository.DeleteAppointmentAsync(appointment);
        }

        // Get All Appointments
        public async Task<List<ReadAppointmentDto>> GetAllAsync()
        {
            var appointments =
                await _repository.GetAppointmentsAsync();

            return _mapper.Map<List<ReadAppointmentDto>>(appointments);
        }

        // Get Appointment by Id
        public async Task<ReadAppointmentDto> GetByIdAsync(int id)
        {
            var appointment =
                await _repository.GetAppointmentByIdAsync(id);

            if (appointment == null)
            {
                throw new NotFoundException(
                    $"Appointment with Id {id} not found");
            }

            return _mapper.Map<ReadAppointmentDto>(appointment);
        }
    }
}