using FarmDirect__RestfullAPI.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace FarmDirect__RestfullAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly FarmDirectDBContext _context;
        public ProductsController(FarmDirectDBContext context)
        {
            _context = context;
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
        public IActionResult CreateProduct([FromBody] Product product)
        {
            _context.Products.Add(product);
            _context.SaveChanges();
            //return CreatedAtAction(nameof(GetProduct), new { id = product.ProductId }, product);
            return Ok(product);
        }

        [HttpPut]
        [Route("UpdateProduct/{id:int}")]
        public IActionResult UpdateProduct(int id, [FromBody] Product updatedProduct)
        {
            var product = _context.Products.Find(id);
            if (product == null)
            {
                return NotFound();
            }
            product.FarmerId = updatedProduct.FarmerId;
            product.Farmer = updatedProduct.Farmer;

            product.CategoryId  = updatedProduct.CategoryId;
            product.Category = updatedProduct.Category;
            product.Name = updatedProduct.Name;
            product.Description = updatedProduct.Description;
            product.BasePrice = updatedProduct.BasePrice;
            product.CurrentPrice = updatedProduct.CurrentPrice;
            product.StockQuantity=updatedProduct.StockQuantity;
            product.Unit = updatedProduct.Unit;
            product.HarvestDate = updatedProduct.HarvestDate;
            product.ExpiryDate = updatedProduct.ExpiryDate;
            product.ImageUrl = updatedProduct.ImageUrl;
            product.IsActive = updatedProduct.IsActive;
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
