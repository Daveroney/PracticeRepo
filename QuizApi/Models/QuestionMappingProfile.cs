using AutoMapper;
using QuizApi.NameMappings;

namespace QuizApi.Models;

public class QuestionMappingProfile : Profile
{
    public QuestionMappingProfile()
    {
        CreateMap<QuestionSet, CreateQuestionSetDTO>().ReverseMap();
        CreateMap<QuestionSet, QuestionSetDTO>().ReverseMap();
        CreateMap<Question, QuestionDTO>()
            .ForMember(dest => dest.Difficulty, options => options.MapFrom(src => src.Difficulty.ToString()))
            .ReverseMap()
            .ForMember(dest => dest.Difficulty, options => options.MapFrom(src => Enum.Parse<Difficulty>(src.Difficulty)))
                ;
        CreateMap<Question, CreateQuestionDTO>().ReverseMap().ForMember(dest => dest.Difficulty, options => options.MapFrom(src => src.Difficulty.ToString()))
            .ReverseMap()
            .ForMember(dest => dest.Difficulty, options => options.MapFrom(src => Enum.Parse<Difficulty>(src.Difficulty)))
            ;
    }
}