using Healthcare.DoctorService.DTOs;
using Healthcare.DoctorService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Healthcare.DoctorService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DoctorController : ControllerBase
    {
        private readonly IDoctorService _service;

        public DoctorController(IDoctorService service)
        {
            _service = service;
        }

        //Get All Doctors
        [HttpGet("Doctors")]
        [Authorize(Roles = "Admin,Doctor,Patient")]
        public async Task<ActionResult<List<ReadDoctorDto>>> GetAllDoctorsAsync()
        {
            var doctors = await _service.GetAllAsync();
            return Ok(doctors);
        }


        //Get Doctor by id
        [HttpGet("Doctor/{id}", Name = "GetDoctorById")]
        [Authorize(Roles = "Admin,Doctor,Patient")]
        public async Task<ActionResult<ReadDoctorDto>> GetDoctorByIdAsync(int id)
        {
            var doctor = await _service.GetByIdAsync(id);
            return Ok(doctor);
        }

        //Get Doctor by name
        [HttpGet("Doctorbyname/{name}")]
        [Authorize(Roles = "Admin,Patient")]
        public async Task<ActionResult<ReadDoctorDto>> GetDoctorByNameAsync(string name)
        {
            var doctor= await _service.GetByNameAsync(name);
            return Ok(doctor);
        }

        //Get Doctor by Specialization
        [HttpGet("Doctorbyspecialization/{specialSpecialization}")]
        [Authorize(Roles = "Admin,Patient")]

        public async Task<ActionResult<ReadDoctorDto>> GetDoctorBySpecialization(string specialSpecialization)
        {
            var doctor=await _service.GerBySpecializationAsync(specialSpecialization);
            return Ok(doctor);
        }

        //Adding Doctor
        [HttpPost("Add")]
        [Authorize(Roles = "Admin,Doctor")]
        public async Task<ActionResult<ReadDoctorDto>> CreateDoctorAsync(CreateDoctorDto dto)
        {
            var createdDoctor = await _service.CreateAsync(dto);
            return CreatedAtRoute("GetDoctorById", new { id = createdDoctor.Id }, createdDoctor);
        }

        //Updating doctor by using id
        [HttpPut("Update")]
        [Authorize(Roles = "Admin,Doctor")]
        public async Task<IActionResult> UpdateDoctorAsync(int id,UpdateDoctorDto dto)
        {
            await _service.UpdateAsync(id, dto);
            return NoContent();
        }

        //Deleting doctor by using id
        [HttpDelete("Delete/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> DeleteDoctorAsync(int id)
        {
            await _service.DeleteAsync(id);
            return NoContent();
        }
    }
}
