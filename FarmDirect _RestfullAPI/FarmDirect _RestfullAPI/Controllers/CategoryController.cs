using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using FarmDirect__RestfullAPI.DTOs;
using FarmDirect__RestfullAPI.Models;

namespace FarmDirect__RestfullAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoryController : ControllerBase
    {
        private readonly FarmDirectDBContext _context;
        public CategoryController(FarmDirectDBContext context)
        {
            _context = context;
        }


        [HttpGet]
        [Route("GetAllCategories")]
        public IActionResult GetAllCategories()
        {
            var categories = _context.Categories.ToList();
            return Ok(categories);
        }

        [HttpGet]
        [Route("{id:int}")]
        public IActionResult GetCategory(int id)
        {
            var category = _context.Categories.Find(id);
            if (category == null)
            {
                return NotFound();
            }
            return Ok(category);
        }

        [HttpPost]
        [Route("AddCategory")]

        public IActionResult CreateCategory([FromBody] CategoryCreateDto dto)
        {
            var category = new Category
            {
                CategoryName = dto.CategoryName,
                Description = dto.Description
            };
            _context.Categories.Add(category);
            _context.SaveChanges();
            return Ok(category);

        }

        [HttpPut]
        [Route("UpdateCategory/{id:int}")]
        public IActionResult UpdateCategory(int id, [FromBody] CategoryCreateDto dto)
        {
            var category = _context.Categories.Find(id);
            if (category == null)
            {
                return NotFound();
            }
            category.CategoryName = dto.CategoryName;
            category.Description = dto.Description;
            _context.SaveChanges();
            return Ok(category);
        }


        [HttpDelete]
        [Route("DeleteCategory/{id:int}")]
        public IActionResult DeleteCategory(int id)
        {
            var category = _context.Categories.Find(id);
            if (category == null)
            {
                return NotFound();
            }
            _context.Categories.Remove(category);
            _context.SaveChanges();
            return NoContent();
        }
    }

}
