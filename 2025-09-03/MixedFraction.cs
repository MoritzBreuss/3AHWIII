namespace _3AHWIII;

public class MixedFraction
{
    public long Whole { get; private set; }
    public long Numerator { get; private set; }
    public long Denominator { get; private set; }

    public MixedFraction(long whole, long numerator, long denominator)
    {
        if (denominator == 0)
            throw new ArgumentException("Denominator cannot be zero");

        Whole = whole;
        Numerator = numerator;
        Denominator = denominator;
        Simplify();
    }

    private void Simplify()
    {
        long totalNumerator = Whole * Denominator + Numerator;
        Whole = totalNumerator / Denominator;
        Numerator = Math.Abs(totalNumerator % Denominator);
        
        long gcd = GCD(Numerator, Denominator);
        Numerator /= gcd;
        Denominator /= gcd;
    }

    private static long GCD(long a, long b)
    {
        while (b != 0)
        {
            long t = b;
            b = a % b;
            a = t;
        }
        return Math.Abs(a);
    }

    public static MixedFraction Parse(string input)
    {
        if (string.IsNullOrWhiteSpace(input))
            throw new FormatException("Input cannot be empty");

        try
        {
            var parts = input.Trim().Split(' ');
            if (parts.Length != 2)
                throw new FormatException("Invalid mixed fraction format");

            long whole = long.Parse(parts[0]);
            var fracParts = parts[1].Split('/');
            if (fracParts.Length != 2)
                throw new FormatException("Invalid fraction format");

            return new MixedFraction(whole, long.Parse(fracParts[0]), long.Parse(fracParts[1]));
        }
        catch (Exception ex) when (ex is FormatException || ex is OverflowException)
        {
            throw new FormatException($"Invalid mixed fraction format: {input}", ex);
        }
    }

    public static MixedFraction operator +(MixedFraction left, MixedFraction right)
    {
        long num1 = left.Whole * left.Denominator + left.Numerator;
        long num2 = right.Whole * right.Denominator + right.Numerator;
        
        return new MixedFraction(0, 
            num1 * right.Denominator + num2 * left.Denominator,
            left.Denominator * right.Denominator);
    }

    public override string ToString()
    {
        if (Numerator == 0)
            return $"{Whole}";
        return $"{Whole} {Numerator}/{Denominator}";
    }
}