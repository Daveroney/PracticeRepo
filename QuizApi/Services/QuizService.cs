using System.Text.Json;
using QuizApi.Exceptions;
using QuizApi.Models;

namespace QuizApi.Services;

public class QuizService : IQuizService
{
    private readonly List<QuestionSet> _questionSets;
    public QuizService()
    {
        try
        {
            string questionData = File.ReadAllText("Data/questionSets.json");
            _questionSets = JsonSerializer.Deserialize<List<QuestionSet>>(questionData);
        }
        catch (Exception e)
        {
            throw new Exception("Error reading question sets", e);
        }
    }
    
    public async Task<QuestionSet> GetQuestionSet(int setId)
    {
        throw new NotImplementedException("Not implemented");
        var selectedQuestionSet = _questionSets.Where(x => x.Id == setId).FirstOrDefault();
        if (selectedQuestionSet == null)
        {
            throw new QuestionSetNotFoundException(setId);
        }
        return selectedQuestionSet;
    }

    public async Task<List<QuestionSetVM>> GetAllQuestionSets()
    {
            var questionSetsInfo = new List<QuestionSetVM>();
            foreach (var questionSet in _questionSets)
            {
                var newQuestionSet = new QuestionSetVM();
                newQuestionSet.Id = questionSet.Id;
                newQuestionSet.Name = questionSet.Name;
                newQuestionSet.Description = questionSet.Description;
                questionSetsInfo.Add(newQuestionSet);
            }
            return questionSetsInfo;
    }

    public async Task<Question> GetQuestionById(int questionId)
    {
        var questions = _questionSets.SelectMany(x => x.Questions).ToList();
        var selectedQuestion = questions.Where(x => x.Id == questionId).FirstOrDefault();
        return selectedQuestion;
    }

    public async Task<Question> GetRandomQuestionByQuestionSetId(int setId)
    {
        try
        {
            var selectedQuestionSet = _questionSets.Where(x => x.Id == setId).FirstOrDefault();
            var questions = selectedQuestionSet.Questions.Select(x => x).ToList();
            var randomQuestion = questions[new Random().Next(0, questions.Count)];
            return randomQuestion;
        }
        catch (Exception e)
        {
            throw new Exception("Error fetching question set", e);
        }
    }
    public async Task<QuestionSet> CreateQuestionSet(String name, String description)
    {
        var newQuestionSet = new QuestionSet();
        newQuestionSet.Id = GenerateNewQuestionSetId();
        newQuestionSet.Name = name;
        newQuestionSet.Description = description;
        _questionSets.Add(newQuestionSet);
        return newQuestionSet;
    }
    
    private int GenerateNewQuestionSetId()
    {
        int currentHighestId = _questionSets.Max(x => x.Id);
        int newId = currentHighestId + 1;
        return newId;
    }
    
}