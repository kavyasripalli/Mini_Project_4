using System.Net;
using System.Text.Json;
using Healthcare.AppointmentService.Exceptions;

namespace Healthcare.AppointmentService.Middleware
{
    public class ExceptionMiddleware
    {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionMiddleware> _logger;
        public ExceptionMiddleware(RequestDelegate next,ILogger<ExceptionMiddleware> logger) 
        {
            _logger = logger;
            _next = next;
        }

        public async Task Invoke(HttpContext context)
        {
            try
            {
                await _next(context);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, ex.Message);
                await HandleException(context, ex);
            }
        }

        private async Task HandleException(HttpContext context, Exception ex)
        {
            HttpStatusCode status = HttpStatusCode.InternalServerError;
            switch (ex)
            {
                case NotFoundException:
                    status = HttpStatusCode.NotFound;
                    break;
                case BadRequestException:
                    status = HttpStatusCode.BadRequest;
                    break;
            }
            context.Response.ContentType= "application/json";
            context.Response.StatusCode = (int)status;
            var response = new
            {
                StatusCode = (int)status,
                error = ex.Message
            };
            await context.Response.WriteAsync(JsonSerializer.Serialize(response));
        }
    }
}
