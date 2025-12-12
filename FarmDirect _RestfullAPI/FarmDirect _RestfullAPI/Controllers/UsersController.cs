using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using FarmDirect__RestfullAPI.Models;

namespace FarmDirect__RestfullAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly FarmDirectDBContext _context;
        public UsersController(FarmDirectDBContext context)
        {
            _context = context;
        }

        [HttpGet]
        public IActionResult GetUsers()
        {
            var users = _context.Users.ToList();
            return Ok(users);
        }

    }
}
