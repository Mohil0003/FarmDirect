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
        [Route("GetAllUsers")]
        public IActionResult GetAllUsers()
        {
            var users = _context.Users.ToList();
            return Ok(users);
        }

        [HttpGet]
        [Route("{id:int}")]
        public IActionResult GetUser(int id)
        {
            var user = _context.Users.Find(id);
            if (user == null) 
            { 
                return NotFound();
            }
            return Ok(user);
        }

        [HttpPost]
        [Route("AddUser")]
        public IActionResult CreateUser([FromBody] User user)
        {
            _context.Users.Add(user);
            _context.SaveChanges();
            //return CreatedAtAction(nameof(GetUser), new { id = user.UserId }, user);
            return Ok(user);
        }

        [HttpPut]
        [Route("UpdateUser/{id:int}")]
        public IActionResult UpdateUser(int id, [FromBody] User updatedUser)
        {
            var user = _context.Users.Find(id);
            if (user == null)
            {
                return NotFound();
            }
            user.FullName = updatedUser.FullName;
            user.Email = updatedUser.Email;
            user.PasswordHash = updatedUser.PasswordHash;
            user.Role = updatedUser.Role;
            user.PhoneNumber = updatedUser.PhoneNumber;
            user.Address = updatedUser.Address;
            user.Latitude = updatedUser.Latitude;
            user.Longitude = updatedUser.Longitude;
            _context.SaveChanges();
            return Ok(user);
        }

        [HttpDelete]
        [Route("DeleteUser/{id:int}")]
        public IActionResult DeleteUser(int id)
        {
            var user = _context.Users.Find(id);
            if (user == null)
            {
                return NotFound();
            }
            _context.Users.Remove(user);
            _context.SaveChanges();
            return Ok();
        }

    }
}
