using System.ComponentModel.DataAnnotations;

namespace QuizApi.Models;

public class CreateQuestionSetDTO
{
    [Required(ErrorMessage = "Name is required")]
    public string Name { get; set; }

    public string Description { get; set; }
}