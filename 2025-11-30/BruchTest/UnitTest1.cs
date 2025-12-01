using Xunit;
using Bruch;
using System;

namespace BruchTest
{
    public class UnitTest1
    {
        [Theory]
        [InlineData(1, 2, "1/2")]
        [InlineData(3, 4, "3/4")]
        [InlineData(2, 4, "1/2")] // Should be simplified
        [InlineData(3, 6, "1/2")] // Should be simplified
        public void TestToString_SimpleFractions(int z, int n, string expected)
        {
            // Arrange
            var b = new Bruch.Bruch(z, n);

            // Act
            string result = b.ToString();

            // Assert
            Assert.Equal(expected, result);
        }

        [Theory]
        [InlineData(3, 2, "1 1/2")]
        [InlineData(5, 2, "2 1/2")]
        [InlineData(40, 11, "3 7/11")]
        public void TestToString_MixedFractions(int z, int n, string expected)
        {
            var b = new Bruch.Bruch(z, n);
            Assert.Equal(expected, b.ToString());
        }

        [Theory]
        [InlineData(4, 1, "4")]
        [InlineData(8, 2, "4")]
        [InlineData(0, 5, "0")]
        public void TestToString_WholeNumbers(int z, int n, string expected)
        {
            var b = new Bruch.Bruch(z, n);
            Assert.Equal(expected, b.ToString());
        }

        [Fact]
        public void TestConstructor_ZeroDenominator_ThrowsException()
        {
            Assert.Throws<ArgumentException>(() => new Bruch.Bruch(1, 0));
        }
    }
}
