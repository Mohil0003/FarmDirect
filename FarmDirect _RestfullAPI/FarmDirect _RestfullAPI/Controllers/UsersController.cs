using FarmDirect__RestfullAPI.DTOs;
using FarmDirect__RestfullAPI.Models;
using Microsoft.EntityFrameworkCore;
using FluentValidation;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace FarmDirect__RestfullAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly FarmDirectDBContext _context;
        private readonly IValidator<UserCreateDto> _userValidator;
        public UsersController(FarmDirectDBContext context ,IValidator<UserCreateDto> userValidator)
        {
            _context = context;
            _userValidator = userValidator;
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
        public IActionResult CreateUser([FromBody] UserCreateDto dto)
        {
            var result = _userValidator.Validate(dto);
            if (!result.IsValid)
            {
                return BadRequest(new
                {
                    success = false,
                    errors = result.Errors.Select(e => e.ErrorMessage)
                });
            }

            var user = new User
            {
                FullName = dto.FullName,
                Email = dto.Email,
                PasswordHash = dto.PasswordHash,
                Role = dto.Role,
                PhoneNumber = dto.PhoneNumber,
                Address = dto.Address,
                Latitude = dto.Latitude,
                Longitude = dto.Longitude
            };

            _context.Users.Add(user);
            _context.SaveChanges();
            return Ok(user);
        }

        [HttpPut]
        [Route("UpdateUser/{id:int}")]
        public IActionResult UpdateUser(int id, [FromBody] UserCreateDto dto)
        {
           var user = _context.Users.Find(id);


            if (user == null)
            { 
                return NotFound();
            }
            var result = _userValidator.Validate(dto);
            if (!result.IsValid)
            {
                return BadRequest(new
                {
                    success = false,
                    errors = result.Errors.Select(e => e.ErrorMessage)
                });
            }
                user.FullName = dto.FullName;
                user.Email = dto.Email;
                user.PasswordHash = dto.PasswordHash;
                user.Role = dto.Role;
                user.PhoneNumber = dto.PhoneNumber;
                user.Address = dto.Address;
                user.Latitude = dto.Latitude;
                user.Longitude = dto.Longitude;

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

        [HttpGet]
        [Route("GetFarmerStats")]
        public async Task<IActionResult> GetFarmerStats()
        {
            var farmerStats = await _context.Users
                .Where(u => u.Role == "Farmer")
                .Select(u => new FarmerStatsDto
                {
                    FarmerId = u.UserId,
                    FarmerName = u.FullName,
                    ProductCount = u.Products.Count,
                    Products = u.Products.Select(p => new ProductStatDto
                    {
                        ProductName = p.Name,
                        StockQuantity = p.StockQuantity
                    }).ToList()
                })
                .ToListAsync();

            return Ok(farmerStats);
        }

    }
}
