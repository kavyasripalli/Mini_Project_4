using Healthcare.PatientService.DTOs;
using Healthcare.PatientService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Healthcare.PatientService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PatientController : ControllerBase
    {
        private readonly IPatientService _service;

        public PatientController(IPatientService service)
        {
            _service = service;
        }

        [HttpGet("Patients")]
        [Authorize(Roles = "Admin,Patient")]
        public async Task<ActionResult<List<ReadPatientDto>>> GetAllPatientsAsync()
        {
            var patients = await _service.GetAllAsync();
            return Ok(patients);
        }

        [HttpGet("Patient/{id}")]
        [Authorize(Roles = "Admin,Patient")]
        public async Task<ActionResult<ReadPatientDto>> GetPatientById(int id)
        {
            var patient=await _service.GetByIdAsync(id);
            return Ok(patient);
        }

        [HttpGet("Patientbyname/{name}")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<ReadPatientDto>> GetByName(string name)
        {
            var patient=await _service.GetByNameAsync(name);
            return Ok(patient);
        }

        [HttpPost("Add")]
        [Authorize(Roles = "Patient,Admin")]
        public async Task<ActionResult<ReadPatientDto>> Create(CreatePatientDto dto)
        {
            var createPatient = await _service.CreateAsync(dto);
            return CreatedAtAction(nameof(GetPatientById), new {id=createPatient.Id}, createPatient);
        }

        [HttpPut("Update/{id}")]
        [Authorize(Roles = "Patient,Admin")]

        public async Task<IActionResult> Update(int id,UpdatePatientDto dto)
        {
            await _service.UpdateAsync(id, dto);
            return NoContent();
        }

        [HttpDelete("Delete/{id}")]
        [Authorize(Roles = "Admin,Patient")]
        public async Task<IActionResult> Delete(int id)
        {
            await _service.DeleteAsync(id);
            return NoContent();
        }
    }
}
