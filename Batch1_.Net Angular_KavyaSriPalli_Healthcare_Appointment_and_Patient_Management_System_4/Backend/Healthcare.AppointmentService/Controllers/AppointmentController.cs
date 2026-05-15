using Healthcare.AppointmentService.DTOs;
using Healthcare.AppointmentService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Healthcare.AppointmentService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AppointmentController : ControllerBase
    {
        private readonly IAppointmentService _service;

        public AppointmentController(IAppointmentService service)
        {
            _service = service;
        }

        //Get all appointments
        [HttpGet("Appointments")]
        [Authorize(Roles = "Admin,Doctor,Patient")]
        public async Task<ActionResult<List<ReadAppointmentDto>>> GetAllAppointmentsAsync()
        {
            var appointments = await _service.GetAllAsync();
            return Ok(appointments);
        }

        //Get Appointment by using id
        [HttpGet("Appointment/{id}", Name = "GetAppointmentById")]
        [Authorize(Roles = "Admin,Doctor,Patient")]
        public async Task<ActionResult<ReadAppointmentDto>> GetAppointmentByIdAsync(int id)
        {
            var appointment = await _service.GetByIdAsync(id);
            return Ok(appointment);
        }

        //Creating Appointment 
        [HttpPost("Create")]
        [Authorize(Roles = "Patient,Admin,Doctor")]
        public async Task<ActionResult<ReadAppointmentDto>> CreateAppointment(CreateAppointmentDto dto)
        {
            var created = await _service.CreateAsync(dto);
            return CreatedAtRoute("GetAppointmentById", new { id = created.Id }, created);
        }

        //Cancel appointment
        [HttpPut("{id}/cancel")]
        [Authorize(Roles ="Patient,Doctor,Admin")]
        public async Task<IActionResult> Cancel(int id)
        {
            await _service.CancelAsync(id);
            return NoContent();
        }

        //Complete appointment
        [HttpPut("{id}/complete")]
        [Authorize(Roles ="Doctor,Admin")]
        public async Task<IActionResult> Complete(int id)
        {
            await _service.CompleteAsync(id);
            return NoContent();
        }

        //Delete appointment
        [HttpDelete("Delete/{id}")]
        [Authorize(Roles ="Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            await _service.DeleteAsync(id);
            return NoContent();
        }
    }
}
