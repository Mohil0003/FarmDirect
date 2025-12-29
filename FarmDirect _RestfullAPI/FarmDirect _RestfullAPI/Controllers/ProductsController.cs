using FarmDirect__RestfullAPI.DTOs;
using FarmDirect__RestfullAPI.Models;
using FluentValidation;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace FarmDirect__RestfullAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly FarmDirectDBContext _context;
        private readonly IValidator<ProductCreateDto> _productValidator;
        public ProductsController(FarmDirectDBContext context,IValidator<ProductCreateDto> validator)
        {
            _context = context;
            _productValidator = validator;
        }

        [HttpGet]
        [Route("GetAllProducts")]
        public IActionResult GetAllProducts()
        {
            var products = _context.Products.ToList();
            return Ok(products);
        }





        [HttpGet]
        [Route("{id:int}")]
        public IActionResult GetProduct(int id)
        {
            var product = _context.Products.Find(id);
            if (product == null)
            {
                return NotFound();
            }
            return Ok(product);
        }

        [HttpPost]
        [Route("AddProduct")]
        public IActionResult CreateProduct([FromBody] ProductCreateDto dto)
        {
            // 1. Map DTO to the actual Product Model
            var result = _productValidator.Validate(dto);
            if (!result.IsValid)
            {
                return BadRequest(new
                {
                    success = false,
                    errors = result.Errors.Select(e => e.ErrorMessage)
                });
            }

            var product = new Product
            {
                FarmerId = dto.FarmerId,
                CategoryId = dto.CategoryId,
                Name = dto.Name,
                Description = dto.Description,
                BasePrice = dto.BasePrice,
                CurrentPrice = dto.CurrentPrice,
                StockQuantity = dto.StockQuantity,
                Unit = dto.Unit,
                HarvestDate = dto.HarvestDate,
                ExpiryDate = dto.ExpiryDate,
                ImageUrl = dto.ImageUrl,
                IsActive = true, // Default value
                CreatedAt = DateTime.Now // Set server-side timestamp
            };

            // 2. Add to context and save
            _context.Products.Add(product);
            _context.SaveChanges();

            return Ok(product);
        }



        [HttpPut]
        [Route("UpdateProduct/{id:int}")]
        public IActionResult UpdateProduct(int id, [FromBody] ProductCreateDto updatedDto)
        {
            var product = _context.Products.Find(id);
            if (product == null)
            {
                return NotFound();
            }

            var result = _productValidator.Validate(updatedDto);
            if (!result.IsValid)
            {
                return BadRequest(new
                {
                    success = false,
                    errors = result.Errors.Select(e => e.ErrorMessage)
                });
            }

            product.FarmerId = updatedDto.FarmerId;
            product.CategoryId  = updatedDto.CategoryId;
            product.Name = updatedDto.Name;
            product.Description = updatedDto.Description;
            product.BasePrice = updatedDto.BasePrice;
            product.CurrentPrice = updatedDto.CurrentPrice;
            product.StockQuantity=updatedDto.StockQuantity;
            product.Unit = updatedDto.Unit;
            product.HarvestDate = updatedDto.HarvestDate;
            product.ExpiryDate = updatedDto.ExpiryDate;
            product.ImageUrl = updatedDto.ImageUrl;
            _context.SaveChanges();
            return Ok(product);
        }
        [HttpDelete]
        [Route("DeleteProduct/{id:int}")]
        public IActionResult DeleteProduct(int id)
        {
            var product = _context.Products.Find(id);
            if (product == null)
            {
                return NotFound();
            }
            _context.Products.Remove(product);
            _context.SaveChanges();
            return Ok();
        }
    }
}
