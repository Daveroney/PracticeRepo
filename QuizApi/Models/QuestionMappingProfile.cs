using AutoMapper;
namespace QuizApi.Models;

public class QuestionMappingProfile : Profile
{
    public QuestionMappingProfile()
    {
        CreateMap<QuestionSet, QuestionSetDTO>();
    }
}