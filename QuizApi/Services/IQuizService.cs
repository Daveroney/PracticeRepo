using QuizApi.Models;

namespace QuizApi.Services;

public interface IQuizService
{
    public Task<QuestionSet> GetQuestionSet(int setId);
    public Task<List<Question>> GetAllQuestionsByQuestionSetId(int setId);
    public Task<Question> GetQuestionById(int questionId);
    public Task<Question> GetRandomQuestionByQuestionSetId(int setId);
}