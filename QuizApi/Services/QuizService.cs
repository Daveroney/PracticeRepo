using System.Text.Json;
using AutoMapper;
using QuizApi.Exceptions;
using QuizApi.Models;

namespace QuizApi.Services;

public class QuizService : IQuizService
{
    private readonly List<QuestionSet> _questionSets;
    private readonly IMapper _mapper;
    public QuizService(IMapper mapper)
    {
        _mapper = mapper;
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
        var selectedQuestionSet = _questionSets.Where(x => x.Id == setId).FirstOrDefault();
        if (selectedQuestionSet == null)
        {
            throw new QuestionSetNotFoundException(setId);
        }
        return selectedQuestionSet;
    }

    public async Task<List<QuestionSetDTO>> GetAllQuestionSets()
    {
            var questionSetsInfo = new List<QuestionSetDTO>();
            foreach (var questionSet in _questionSets)
            {
                QuestionSetDTO questionSetDto = _mapper.Map<QuestionSetDTO>(questionSet);
                
                questionSetsInfo.Add(questionSetDto);
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
        newQuestionSet.Questions = new List<Question>();
        _questionSets.Add(newQuestionSet);
        string path = @"Data/questionSets.json";
        if (!File.Exists(path))
        {
            string newJson = JsonSerializer.Serialize(_questionSets);
            File.WriteAllText(path, newJson);
        }
        string appendJson = JsonSerializer.Serialize(newQuestionSet);
        File.AppendAllText(path, appendJson);
        return newQuestionSet;
    }
    
    private int GenerateNewQuestionSetId()
    {
        int currentHighestId = _questionSets.Max(x => x.Id);
        int newId = currentHighestId + 1;
        return newId;
    }
    
}