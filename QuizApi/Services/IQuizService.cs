using QuizApi.Models;

namespace QuizApi.Services;

public interface IQuizService
{
    public Task<QuestionSet> GetQuestionSet(int setId);
    public Task<List<QuestionSetDTO>> GetAllQuestionSets();
    public Task<Question> GetQuestionById(int questionId);
    public Task<Question> GetRandomQuestionByQuestionSetId(int setId);
    public Task<QuestionSet> CreateQuestionSet(String name, String description);
}