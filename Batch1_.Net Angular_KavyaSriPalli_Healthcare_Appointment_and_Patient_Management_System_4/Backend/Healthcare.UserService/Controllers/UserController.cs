using Healthcare.UserService.DTOs;
using Healthcare.UserService.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace Healthcare.UserService.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UserController : ControllerBase
    {
        private readonly IUserService _service;

        public UserController(IUserService service)
        {
            _service = service;
        }

        [HttpPost("register")]
        [AllowAnonymous]
        public async Task<ActionResult<ReadUserDto>> Register(RegisterUserDto dto)
        {
            var user=await _service.RegisterAsync(dto);
            return CreatedAtAction(nameof(GetUserById), new { id = user.Id }, user);
        }

        [HttpPost("login")]
        [AllowAnonymous]
        public async Task<ActionResult<LoginResponseDto>> Login(LoginUserDto dto)
        {
            var result=await _service.LoginAsync(dto);
            return Ok(result);
        }

        [HttpGet("Users")]
        [Authorize(Roles ="Admin")]
        public async Task<ActionResult<ReadUserDto>> GetAllUsersAsync()
        {
            var users=await _service.GetAllAsync();
            return Ok(users);
        }

        [HttpGet("User/{id}")]
        [Authorize(Roles ="Admin")]
        public async Task<ActionResult<ReadUserDto>> GetUserById(int id)
        {
            var User=await _service.GetByIdAsync(id);
            return Ok(User);
        }

        [HttpDelete("Delete/{id}")]
        [Authorize(Roles ="Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            await _service.DeleteAsync(id);
            return NoContent();
        }
    }
}
