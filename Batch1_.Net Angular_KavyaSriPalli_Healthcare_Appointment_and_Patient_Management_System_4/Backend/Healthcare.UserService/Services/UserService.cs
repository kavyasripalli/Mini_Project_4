using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using AutoMapper;
using Healthcare.UserService.DTOs;
using Healthcare.UserService.Entity;
using Healthcare.UserService.Exceptions;
using Healthcare.UserService.Repositories;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;

namespace Healthcare.UserService.Services
{
    public class UserService:IUserService
    {
        private readonly IUserRepository _repository;
        private readonly IMapper _mapper;
        private readonly IConfiguration _configuration;
        private readonly PasswordHasher<User> _passwordHasher = new();

        private static readonly HashSet<string> AllowedRoles = new(StringComparer.OrdinalIgnoreCase) { "Admin", "Doctor", "Patient" };

        public UserService(IUserRepository repository,IMapper mapper,IConfiguration configuration)
        {
            _repository = repository;
            _mapper = mapper;
            _configuration = configuration;
        }

        public async Task<List<ReadUserDto>> GetAllAsync()
        {
            var users = await _repository.GetUsersAsync();
            return _mapper.Map<List<ReadUserDto>>(users);
        }

        public async Task<ReadUserDto?> GetByIdAsync(int id)
        {
            var user=await _repository.GetUserByIdAsync(id);
            if(user == null)
            {
                throw new NotFoundException($"User with Id{id} Not Found");
            }
            return _mapper.Map<ReadUserDto>(user);
        }

        public async Task<ReadUserDto> RegisterAsync(RegisterUserDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.UserName))
            {
                throw new BadRequestException("UserName is Required");
            }
            if (string.IsNullOrWhiteSpace(dto.Password))
            {
                throw new BadRequestException("Password is Required");
            }
            if (!AllowedRoles.Contains(dto.Role))
            {
                throw new BadRequestException("Role Must be Admin, Doctor, Patient");
            }
            var existing=await _repository.GetUserByNameAsync(dto.UserName);
            if(existing != null)
            {
                throw new BadRequestException("Username already Exists");
            }
            var user = _mapper.Map<User>(dto);
            user.Password=_passwordHasher.HashPassword(user,dto.Password);
            user.Role = dto.Role;

            var created=await _repository.CreateUserAsync(user);
            return _mapper.Map<ReadUserDto>(created);
        }

        public async Task<LoginResponseDto> LoginAsync(LoginUserDto dto)
        {
            var user = await _repository.GetUserByNameAsync(dto.UserName);
            if(user == null)
            {
                throw new NotFoundException("Invalid UserName or Password");
            }
            var result = _passwordHasher.VerifyHashedPassword(user, user.Password,dto.Password);
            if (result == PasswordVerificationResult.Failed)
            {
                throw new NotFoundException("Invalid UserName or Password");
            }

            var token = GenerateJwtToken(user);
            return new LoginResponseDto
            {
                Token = token,
                ExpiresAt = DateTime.Now.AddMinutes(int.Parse(_configuration["Jwt:DurationInMinutes"] ?? "60")),
                User = _mapper.Map<ReadUserDto>(user)
            };
        }

        private string GenerateJwtToken(User user)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));

            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier,user.Id.ToString()),
                new Claim(ClaimTypes.Name,user.UserName),
                new Claim(ClaimTypes.Role,user.Role)
            };

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddMinutes(int.Parse(_configuration["Jwt:DurationInMinutes"] ?? "60")),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        public async Task DeleteAsync(int id)
        {
            var user=await _repository.GetUserByIdAsync(id);
            if (user == null)
            {
                throw new NotFoundException($"User with Id {id} Not Found");
            }
            await _repository.DeleteUserAsync(user);
        }
    }
}
