using System.ComponentModel.DataAnnotations;
using QuizApi.NameMappings;

namespace QuizApi.Models;

public class QuestionDTO
{
    public int Id { get; set; }

    [Required(ErrorMessage = "Question text is required")]
    public string QuestionText { get; set; }

    [Required(ErrorMessage = "Possible answers are required")]
    public List<string> PossibleAnswers { get; set; }

    [Required(ErrorMessage = "Correct answers are required")]
    public List<int> CorrectAnswersIndex { get; set; }

    public string Explanation { get; set; }
    public string Tip { get; set; }
    public List<string> Tags { get; set; }

    [EnumDataType(typeof(Difficulty), ErrorMessage = "Invalid difficulty")]
    public string Difficulty { get; set; }
}