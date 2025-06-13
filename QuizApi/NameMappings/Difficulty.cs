using System.Runtime.Serialization;
using System.Text.Json.Serialization;

namespace QuizApi.NameMappings;

[JsonConverter(typeof(JsonStringEnumConverter))]
public enum Difficulty
{
    [EnumMember(Value = "Easy")]
    Easy,
    [EnumMember(Value = "Medium")]
    Medium,
    [EnumMember(Value = "Hard")]
    Hard
}