using AutoMapper;
using Healthcare.UserService.DTOs;
using Healthcare.UserService.Entity;

namespace Healthcare.UserService.Profiles
{
    public class UserProfile:Profile
    {
        public UserProfile()
        {
            CreateMap<User, ReadUserDto>();
            CreateMap<RegisterUserDto, User>();
        }
    }
}
