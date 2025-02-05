using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using QuizApi.Exceptions;
using QuizApi.Models;
using QuizApi.Services;

namespace QuizApi.Controllers;

public class QuestionController
{
    private readonly IQuizService _quizService;

    public QuestionController(IQuizService quizService)
    {
        this._quizService = quizService;
    }

    [HttpGet]
    [Route("questionSets/{id}")]
    public async Task<IResult> GetQuestionSetById(int id)
    {
        try
        {
            QuestionSet questionSet = await this._quizService.GetQuestionSet(id);
            return Results.Ok(questionSet);
        }
        catch (QuestionSetNotFoundException e)
        {
            return Results.NotFound(e.Message);
        }
        catch (Exception e)
        {
            Console.WriteLine(e);
            return Results.StatusCode(500);
        }
    }
    
    [HttpGet]
    [Route("questionSets")]
    public async Task<IResult> GetAllQuestionSets()
    {
        List<QuestionSetDTO> questionSets = await this._quizService.GetAllQuestionSets();
        return questionSets == null ? Results.NotFound() : Results.Ok(questionSets);
    }
    
    [HttpGet]
    [Route("questions/{id}")]
    public async Task<IResult> GetQuestionById(int id)
    {
        Question question = await this._quizService.GetQuestionById(id);
        return question == null ? Results.NotFound("Invalid question id") : Results.Ok(question);
    }
    
    [HttpGet]
    [Route("questionSets/{id}/randomQuestions")]
    public async Task<IResult> GetRandomQuestion(int id)
    {
        Question question = await this._quizService.GetRandomQuestionByQuestionSetId(id);
        return question == null ? Results.NotFound() : Results.Ok(question);
    }

    [HttpPost]
    [Route("questionSets")]
    public async Task<IResult> CreateQuestionSet(String name, String description)
    {
        QuestionSet newQuestionSet = await this._quizService.CreateQuestionSet(name, description);
        return newQuestionSet == null ? Results.NotFound() : Results.Ok(newQuestionSet);
    }
}