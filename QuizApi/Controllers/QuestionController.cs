using Microsoft.AspNetCore.Mvc;
using QuizApi.Exceptions;
using QuizApi.Models;
using QuizApi.Services;

namespace QuizApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class QuestionController : ControllerBase
{
    private readonly IQuizService _quizService;

    public QuestionController(IQuizService quizService)
    {
        _quizService = quizService;
    }

    [HttpGet]
    [Route("questionSets/{id}")]
    public async Task<IResult> GetQuestionSetById(int id)
    {
        try
        {
            var questionSet = await _quizService.GetQuestionSet(id);
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
        var questionSets = await _quizService.GetAllQuestionSets();
        return questionSets == null ? Results.NotFound() : Results.Ok(questionSets);
    }

    [HttpGet]
    [Route("questions/{id}")]
    public async Task<IResult> GetQuestionById(int id)
    {
        var question = await _quizService.GetQuestionById(id);
        return question == null ? Results.NotFound("Invalid question id") : Results.Ok(question);
    }

    [HttpGet]
    [Route("questionSets/{id}/randomQuestions")]
    public async Task<IResult> GetRandomQuestion(int id)
    {
        var question = await _quizService.GetRandomQuestionByQuestionSetId(id);
        return question == null ? Results.NotFound() : Results.Ok(question);
    }

    [HttpPost]
    [Route("questionSets")]
    public async Task<IResult> CreateQuestionSet(CreateQuestionSetDTO createQuestionSetDto)
    {
        var newQuestionSet = await _quizService.CreateQuestionSet(createQuestionSetDto);
        return newQuestionSet == null ? Results.NotFound() : Results.Ok(newQuestionSet);
    }

    [HttpPost]
    [Route("questionSets/{id}/questions")]
    public async Task<IResult> CreateQuestion(int id, CreateQuestionDTO createQuestionDto)
    {
        try
        {
            var newQuestion = await _quizService.CreateQuestion(id, createQuestionDto);
            return Results.Ok(newQuestion);
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

    [HttpDelete]
    [Route("questionSets/{id}")]
    public async Task<IActionResult> DeleteQuestionSet(int id)
    {
        await _quizService.DeleteQuestionSet(id);
        return NoContent();
    }

    [HttpPut]
    [Route("questionSets/{id}")]
    public async Task<IResult> UpdateQuestionSet(int id, string newName, string newDescription)
    {
        try
        {
            var questionSet = await _quizService.UpdateQuestionSet(id, newName, newDescription);
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
}