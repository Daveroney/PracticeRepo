using AutoMapper;
namespace QuizApi.Models;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        CreateMap<QuestionSet, QuestionSetDTO>();
    }
}