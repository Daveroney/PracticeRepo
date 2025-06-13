using System.ComponentModel.DataAnnotations;
using QuizApi.NameMappings;

namespace QuizApi.Models;

public class Question
{
    public int Id { get; set; }
    public string QuestionText { get; set; }
    public List<string> PossibleAnswers { get; set; }
    public List<int> CorrectAnswersIndex { get; set; }
    public string Explanation { get; set; }
    public string Tip { get; set; }
    public List<string> Tags { get; set; }
    [EnumDataType(typeof(Difficulty), ErrorMessage = "Invalid difficulty")]
    public Difficulty Difficulty { get; set; }
}