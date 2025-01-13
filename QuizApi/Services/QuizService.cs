using System.Text.Json;
using QuizApi.Models;

namespace QuizApi.Services;

public class QuizService : IQuizService
{
    private string questionData = File.ReadAllText("Data/questionSets.json");
    
    public async Task<QuestionSet> GetQuestionSet(int setId)
    {
        var questionSets = JsonSerializer.Deserialize<List<QuestionSet>>(questionData);
        var selectedQuestionSet = questionSets.Where(x => x.Id == setId).FirstOrDefault();
        return selectedQuestionSet;
    }

    public async Task<List<Question>> GetAllQuestionsByQuestionSetId(int setId)
    {
        var questionSets = JsonSerializer.Deserialize<List<QuestionSet>>(questionData);
        var selectedQuestionSet = questionSets.Where(x => x.Id == setId).FirstOrDefault();
        var questions = selectedQuestionSet.Questions.Select(x => x).ToList();
        return questions;
    }

    public async Task<Question> GetQuestionById(int questionId)
    {
        var questionSets = JsonSerializer.Deserialize<List<QuestionSet>>(questionData);
        var questions = questionSets.SelectMany(x => x.Questions).ToList();
        var selectedQuestion = questions.Where(x => x.Id == questionId).FirstOrDefault();
        return selectedQuestion;
    }

    public async Task<Question> GetRandomQuestionByQuestionSetId(int setId)
    {
        var questionSets = JsonSerializer.Deserialize<List<QuestionSet>>(questionData);
        var selectedQuestionSet = questionSets.Where(x => x.Id == setId).FirstOrDefault();
        var questions = selectedQuestionSet.Questions.Select(x => x).ToList();
        var randomQuestion = questions[new Random().Next(0, questions.Count)];
        return randomQuestion;
    }
}