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
        QuestionSet newQuestionSet = new QuestionSet();
        newQuestionSet.Id = GenerateNewQuestionSetId();
        newQuestionSet.Name = name;
        newQuestionSet.Description = description;
        newQuestionSet.Questions = new List<Question>();
        string path = @"Data/questionSets.json";
        if (!File.Exists(path))
        {
            string newJson = JsonSerializer.Serialize(_questionSets);
            File.WriteAllText(path, newJson);
        }
        using FileStream openStream = File.OpenRead(path);
        var questionSetList = await JsonSerializer.DeserializeAsync<List<QuestionSet>>(openStream);
        questionSetList.Add(newQuestionSet);
        openStream.Close();
        await File.WriteAllTextAsync(path, JsonSerializer.Serialize(questionSetList));
        return newQuestionSet;
    }

    public async Task<Question> CreateQuestion(int questionSetId, String questionText,
        String[] possibleAnswers, int[] correctAnswersIndex, string explanation,
        string tip, List<string> tags, string difficulty)
    {
        Question newQuestion = new Question();
        newQuestion.Id = GenerateNewQuestionId();
        newQuestion.QuestionText = questionText;
        newQuestion.PossibleAnswers = possibleAnswers.ToList();
        newQuestion.CorrectAnswersIndex = correctAnswersIndex.ToList();
        newQuestion.Explanation = explanation;
        newQuestion.Tip = tip;
        newQuestion.Tags = tags;
        newQuestion.Difficulty = difficulty;
        
        /*
        QuestionSet selectedQuestionSet = _questionSets.Where(x => x.Id == questionSetId).FirstOrDefault();
        */
        string path = @"Data/questionSets.json";
        if (!File.Exists(path))
        {
            string newJson = JsonSerializer.Serialize(_questionSets);
            File.WriteAllText(path, newJson);
        }

        List<QuestionSet> questionSetList;
        using (FileStream openStream = File.OpenRead(path))
        {
            questionSetList = await JsonSerializer.DeserializeAsync<List<QuestionSet>>(openStream);
        }
        QuestionSet selectedQuestionSet = questionSetList.Where(x => x.Id == questionSetId).FirstOrDefault();
        selectedQuestionSet.Questions.Add(newQuestion);
        await File.WriteAllTextAsync(path, JsonSerializer.Serialize(questionSetList));
        return newQuestion;
    }

    public async Task DeleteQuestionSet(int id)
    {
        QuestionSet questionSetToDelete = _questionSets.Where(x => x.Id == id).FirstOrDefault();
        if (questionSetToDelete == null)
        {
            throw new QuestionSetNotFoundException(id);
        }
        string path = @"Data/questionSets.json";
        List<QuestionSet> questionSetList = new List<QuestionSet>();
        using (FileStream openStream = File.OpenRead(path))
        { 
            questionSetList = await JsonSerializer.DeserializeAsync<List<QuestionSet>>(openStream);
        }
        questionSetList.RemoveAll(x => x.Id == id);
        await File.WriteAllTextAsync(path, JsonSerializer.Serialize(questionSetList));
    }

    public async Task<QuestionSet> UpdateQuestionSet(int id, String newName, String newDescription)
    {
        string path = @"Data/questionSets.json";
        List<QuestionSet> questionSetList;
        using (FileStream openStream = File.OpenRead(path))
        {
            questionSetList = await JsonSerializer.DeserializeAsync<List<QuestionSet>>(openStream);
        }
        QuestionSet questionSetToUpdate = questionSetList.Where(x => x.Id == id).FirstOrDefault();
        questionSetToUpdate.Name = newName;
        questionSetToUpdate.Description = newDescription;
        await File.WriteAllTextAsync(path, JsonSerializer.Serialize(questionSetList));
        return questionSetToUpdate;
    }
    
    private int GenerateNewQuestionSetId()
    {
        int currentHighestId = _questionSets.Max(x => x.Id);
        int newId = currentHighestId + 1;
        return newId;
    }
    
    private int GenerateNewQuestionId()
    {
        int currentHighestId = _questionSets.SelectMany(x => x.Questions).Max(x => x.Id);
        int newId = currentHighestId + 1;
        return newId;
    }
    
}