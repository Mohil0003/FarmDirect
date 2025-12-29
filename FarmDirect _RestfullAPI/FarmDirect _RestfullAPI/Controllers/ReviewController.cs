using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using FarmDirect__RestfullAPI.Models;
using FarmDirect__RestfullAPI.DTOs;
using FluentValidation;

namespace FarmDirect__RestfullAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReviewController : ControllerBase
    {
        private readonly FarmDirectDBContext _context;
        private readonly IValidator<ReviewCreateDto> _reviewValidator;
        public ReviewController(FarmDirectDBContext context, IValidator<ReviewCreateDto> reviewvalidator)
        {
            _context = context;
            _reviewValidator = reviewvalidator;
        }

        [HttpGet]
        [Route("GetAllReviews")]
        public IActionResult GetAllReviews()
        {
            var reviews = _context.Reviews.ToList();
            return Ok(reviews);
        }

        [HttpGet]
        [Route("{id:int}")]
        public IActionResult GetReview(int id)
        {
            var review = _context.Reviews.Find(id);
            if (review == null)
            {
                return NotFound();
            }
            return Ok(review);
        }

        [HttpPost]
        [Route("AddReview")]
        public IActionResult CreateReview([FromBody] ReviewCreateDto dto)
        {
            var result = _reviewValidator.Validate(dto);
            if (!result.IsValid)
            {
                return BadRequest(new
                {
                    success = false,
                    errors = result.Errors.Select(e => e.ErrorMessage)
                });
            }
            var review = new Review
            {
                ProductId = dto.ProductId,
                ConsumerId = dto.ConsumerId,
                Rating = dto.Rating,
                Comment = dto.Comment,
                CreatedAt = dto.CreatedAt ?? DateTime.UtcNow
            };
            _context.Reviews.Add(review);
            _context.SaveChanges();
            return Ok(review);
        }

        [HttpPut]
        [Route("UpdateReview/{id:int}")]
        public IActionResult UpdateReview(int id, [FromBody] ReviewCreateDto dto)
        {
            var review = _context.Reviews.Find(id);
            if (review == null)
            {
                return NotFound();
            }

            var result = _reviewValidator.Validate(dto);
            if (!result.IsValid)
            {
                return BadRequest(new
                {
                    success = false,
                    errors = result.Errors.Select(e => e.ErrorMessage)
                });
            }

            review.ProductId = dto.ProductId;
            review.ConsumerId = dto.ConsumerId;
            review.Rating = dto.Rating;
            review.Comment = dto.Comment;
            review.CreatedAt = dto.CreatedAt ?? review.CreatedAt;
            _context.SaveChanges();
            return Ok(review);
        }

        [HttpDelete]
        [Route("DeleteReview/{id:int}")]
        public IActionResult DeleteReview(int id)
        {
            var review = _context.Reviews.Find(id);
            if (review == null)
            {
                return NotFound();
            }
            _context.Reviews.Remove(review);
            _context.SaveChanges();
            return Ok();
        }
    }
}
