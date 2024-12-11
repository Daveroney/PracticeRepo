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

    public async Task<List<Question>> GetAllQuestions()
    {
        var questions = JsonSerializer.Deserialize<List<Question>>(questionData);
        return questions;
    }

    public async Task<Question> GetQuestionById(int id)
    {
        var questions = JsonSerializer.Deserialize<List<Question>>(questionData);
        var selectedQuestion = questions.Where(x => x.Id == id).FirstOrDefault();
        return selectedQuestion;
    }

    public async Task<Question> GetRandomQuestion()
    {
        var questions = JsonSerializer.Deserialize<List<Question>>(questionData);
        var randomQuestion = questions[new Random().Next(0, questions.Count)];
        return randomQuestion;
    }
}