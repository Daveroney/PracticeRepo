namespace QuizApi.Models;

public class QuestionDTO
{
    public int Id { get; set; }
    public string QuestionText { get; set; }
    public List<string> PossibleAnswers { get; set; }
    public List<int> CorrectAnswersIndex { get; set; }
    public string Explanation { get; set; }
    public string Tip { get; set; }
    public List<string> Tags { get; set; }
    public string Difficulty { get; set; }
}