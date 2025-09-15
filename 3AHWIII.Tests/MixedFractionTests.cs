using Xunit;
using _3AHWIII;

public class MixedFractionTests
{
    [Fact]
    public void Parse_ValidInput_ReturnsCorrectFraction()
    {
        var fraction = MixedFraction.Parse("2 3/4");
        Assert.Equal(2, fraction.Whole);
        Assert.Equal(3, fraction.Numerator);
        Assert.Equal(4, fraction.Denominator);
    }

    [Theory]
    [InlineData("")]
    [InlineData("invalid")]
    [InlineData("1 2")]
    [InlineData("1 2/")]
    public void Parse_InvalidInput_ThrowsException(string input)
    {
        Assert.Throws<FormatException>(() => MixedFraction.Parse(input));
    }

    [Fact]
    public void Constructor_ZeroDenominator_ThrowsArgumentException()
    {
        Assert.Throws<ArgumentException>(() => new MixedFraction(1, 1, 0));
    }

    [Theory]
    [InlineData("1 1/2", "2 1/4", "3 3/4")]
    [InlineData("2 1/3", "1 1/3", "3 2/3")]
    [InlineData("1 1/2", "1 1/2", "3")]
    public void Addition_ReturnsCorrectResult(string f1, string f2, string expected)
    {
        var fraction1 = MixedFraction.Parse(f1);
        var fraction2 = MixedFraction.Parse(f2);
        var result = fraction1 + fraction2;
        Assert.Equal(expected, result.ToString());
    }
}