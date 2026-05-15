using System.Security.Claims;
using System.Text;
using Healthcare.AppointmentService.Data;
using Healthcare.AppointmentService.Middleware;
using Healthcare.AppointmentService.Profiles;
using Healthcare.AppointmentService.Repositories;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;

namespace Healthcare.AppointmentService
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add Controllers
            builder.Services.AddControllers();

            // Database Connection
            builder.Services.AddDbContext<AppointmentDbContext>(options =>
                options.UseSqlServer(
                    builder.Configuration.GetConnectionString("AppointmentDbConnection")));

            // Dependency Injection
            builder.Services.AddScoped<IAppointmentRepository, AppointmentRepository>();

            builder.Services.AddScoped<
                Healthcare.AppointmentService.Services.IAppointmentService,
                Healthcare.AppointmentService.Services.AppointmentService>();

            // Http Context
            builder.Services.AddHttpContextAccessor();

            // AutoMapper
            builder.Services.AddAutoMapper(typeof(AppointmentProfile));

            // Swagger
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();

            // HTTP Client Connections
            builder.Services.AddHttpClient("PatientApi", client =>
            {
                client.BaseAddress = new Uri(
                    builder.Configuration["ServiceUrls:PatientApi"]!);
            });

            builder.Services.AddHttpClient("DoctorApi", client =>
            {
                client.BaseAddress = new Uri(
                    builder.Configuration["ServiceUrls:DoctorApi"]!);
            });

            // JWT Authentication
            builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    options.RequireHttpsMetadata = false;
                    options.SaveToken = true;

                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidateLifetime = true,
                        ValidateIssuerSigningKey = true,

                        ValidIssuer = builder.Configuration["Jwt:Issuer"],
                        ValidAudience = builder.Configuration["Jwt:Audience"],

                        IssuerSigningKey = new SymmetricSecurityKey(
                            Encoding.UTF8.GetBytes(
                                builder.Configuration["Jwt:Key"]!)),

                        RoleClaimType = ClaimTypes.Role,
                        NameClaimType = ClaimTypes.Name
                    };
                });

            // Authorization
            builder.Services.AddAuthorization();

            // CORS Configuration
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowAngular",
                    policy =>
                    {
                        policy.AllowAnyOrigin()
                              .AllowAnyHeader()
                              .AllowAnyMethod();
                    });
            });

            var app = builder.Build();

            // Swagger
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            // Global Exception Middleware
            app.UseMiddleware<ExceptionMiddleware>();

            // HTTPS Redirection
            app.UseHttpsRedirection();

            // CORS
            app.UseCors("AllowAngular");

            // Authentication & Authorization
            app.UseAuthentication();
            app.UseAuthorization();

            // Map Controllers
            app.MapControllers();

            // Run Application
            app.Run();
        }
    }
}