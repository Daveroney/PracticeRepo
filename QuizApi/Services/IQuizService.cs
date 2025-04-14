using QuizApi.Models;

namespace QuizApi.Services;

public interface IQuizService
{
    public Task<QuestionSet> GetQuestionSet(int setId);
    public Task<List<QuestionSetDTO>> GetAllQuestionSets();
    public Task<Question> GetQuestionById(int questionId);
    public Task<Question> GetRandomQuestionByQuestionSetId(int setId);
    public Task<QuestionSet> CreateQuestionSet(String name, String description);

    public Task<Question> CreateQuestion(int questionSetId, String questionText,
        String[] possibleAnswers, int[] correctAnswersIndex, string explanation,
        string tip, List<string> tags, string difficulty);
    public Task DeleteQuestionSet(int id);
    public Task<QuestionSet> UpdateQuestionSet(int id, String newName, String newDescription);
}