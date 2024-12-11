using QuizApi.Models;

namespace QuizApi.Services;

public interface IQuizService
{
    public Task<QuestionSet> GetQuestionSet(int setId);
    public Task<List<Question>> GetAllQuestions();
    public Task<Question> GetQuestionById(int id);
    public Task<Question> GetRandomQuestion();
}