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
    [Route("questionSet/{id}")]
    public async Task<IResult> GetQuestionSetById(int id)
    {
        QuestionSet questionSet = await this._quizService.GetQuestionSet(id);
        return questionSet == null ? Results.NotFound("Invalid question set id") : Results.Ok(questionSet);
    }
    
    [HttpGet]
    [Route("questions")]
    public async Task<IResult> GetAllQuestions()
    {
        List<Question> questions = await this._quizService.GetAllQuestions();
        return questions == null ? Results.NotFound() : Results.Ok(questions);
    }
    
    [HttpGet]
    [Route("question/{id}")]
    public async Task<IResult> GetQuestionById(int id)
    {
        Question question = await this._quizService.GetQuestionById(id);
        return question == null ? Results.NotFound("Invalid question id") : Results.Ok(question);
    }
    
    [HttpGet]
    [Route("randomQuestion")]
    public async Task<IResult> GetRandomQuestion()
    {
        Question question = await this._quizService.GetRandomQuestion();
        return question == null ? Results.NotFound() : Results.Ok(question);
    }
}