namespace QuizApi.Exceptions;

public class QuestionSetNotFoundException(int setId) : Exception($"Question set with id {setId} not found");