using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
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
        QuestionSet questionSet = await this._quizService.GetQuestionSet(id);
        return questionSet == null ? Results.NotFound("Invalid question set id") : Results.Ok(questionSet);
    }
    
    [HttpGet]
    [Route("questionSets")]
    public async Task<IResult> GetAllQuestionSets()
    {
        List<QuestionSetVM> questionSets = await this._quizService.GetAllQuestionSets();
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
}