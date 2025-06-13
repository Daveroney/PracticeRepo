using System.Text.Json;
using AutoMapper;
using QuizApi.Exceptions;
using QuizApi.Models;

namespace QuizApi.Services;

public class QuizService : IQuizService
{
    private readonly IMapper _mapper;
    private readonly List<QuestionSet> _questionSets;

    public QuizService(IMapper mapper)
    {
        _mapper = mapper;
        try
        {
            var questionData = File.ReadAllText("Data/questionSets.json");
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
        if (selectedQuestionSet == null) throw new QuestionSetNotFoundException(setId);
        return selectedQuestionSet;
    }

    public async Task<List<QuestionSetDTO>> GetAllQuestionSets()
    {
        var questionSetsInfo = new List<QuestionSetDTO>();
        foreach (var questionSet in _questionSets)
        {
            var questionSetDto = _mapper.Map<QuestionSetDTO>(questionSet);

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

    public async Task<QuestionSet> CreateQuestionSet(QuestionSetDTO questionSetDto)
    {
        var newQuestionSet = _mapper.Map<QuestionSet>(questionSetDto);
        newQuestionSet.Questions = new List<Question>();
        var path = @"Data/questionSets.json";
        if (!File.Exists(path))
        {
            var newJson = JsonSerializer.Serialize(_questionSets);
            File.WriteAllText(path, newJson);
        }

        using var openStream = File.OpenRead(path);
        var questionSetList = await JsonSerializer.DeserializeAsync<List<QuestionSet>>(openStream);
        questionSetList.Add(newQuestionSet);
        openStream.Close();
        await File.WriteAllTextAsync(path, JsonSerializer.Serialize(questionSetList));
        return newQuestionSet;
    }

    public async Task<Question> CreateQuestion(int questionSetId, QuestionDTO questionDto)
    {
        var newQuestion = _mapper.Map<Question>(questionDto);
        newQuestion.Id = GenerateNewQuestionId();

        var path = @"Data/questionSets.json";
        if (!File.Exists(path))
        {
            var newJson = JsonSerializer.Serialize(_questionSets);
            File.WriteAllText(path, newJson);
        }

        List<QuestionSet> questionSetList;
        using (var openStream = File.OpenRead(path))
        {
            questionSetList = await JsonSerializer.DeserializeAsync<List<QuestionSet>>(openStream);
        }

        var selectedQuestionSet = questionSetList.Where(x => x.Id == questionSetId).FirstOrDefault();
        selectedQuestionSet.Questions.Add(newQuestion);
        await File.WriteAllTextAsync(path, JsonSerializer.Serialize(questionSetList));
        return newQuestion;
    }

    public async Task DeleteQuestionSet(int id)
    {
        var questionSetToDelete = _questionSets.Where(x => x.Id == id).FirstOrDefault();
        if (questionSetToDelete == null) throw new QuestionSetNotFoundException(id);
        var path = @"Data/questionSets.json";
        var questionSetList = new List<QuestionSet>();
        using (var openStream = File.OpenRead(path))
        {
            questionSetList = await JsonSerializer.DeserializeAsync<List<QuestionSet>>(openStream);
        }

        questionSetList.RemoveAll(x => x.Id == id);
        await File.WriteAllTextAsync(path, JsonSerializer.Serialize(questionSetList));
    }

    public async Task<QuestionSet> UpdateQuestionSet(int id, string newName, string newDescription)
    {
        var path = @"Data/questionSets.json";
        List<QuestionSet> questionSetList;
        using (var openStream = File.OpenRead(path))
        {
            questionSetList = await JsonSerializer.DeserializeAsync<List<QuestionSet>>(openStream);
        }

        var questionSetToUpdate = questionSetList.Where(x => x.Id == id).FirstOrDefault();
        questionSetToUpdate.Name = newName;
        questionSetToUpdate.Description = newDescription;
        await File.WriteAllTextAsync(path, JsonSerializer.Serialize(questionSetList));
        return questionSetToUpdate;
    }

    private int GenerateNewQuestionSetId()
    {
        var currentHighestId = _questionSets.Max(x => x.Id);
        var newId = currentHighestId + 1;
        return newId;
    }

    private int GenerateNewQuestionId()
    {
        var currentHighestId = _questionSets.SelectMany(x => x.Questions).Max(x => x.Id);
        var newId = currentHighestId + 1;
        return newId;
    }
}