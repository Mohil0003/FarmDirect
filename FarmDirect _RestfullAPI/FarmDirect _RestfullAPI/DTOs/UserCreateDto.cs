using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace FarmDirect__RestfullAPI.DTOs
{
    public class UserCreateDto
    {


        public string FullName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string PasswordHash { get; set; } = null!;

        public string Role { get; set; } = null!;
        public string PhoneNumber { get; set; } = null!;

        public string? Address { get; set; }

        public decimal? Latitude { get; set; }
        public decimal? Longitude { get; set; }
        
    }
}
