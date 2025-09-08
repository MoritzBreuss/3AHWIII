using System;

static (long whole, long num, long denom) ParseMixedFraction(string input)
{
    var parts = input.Trim().Split(' ');
    long whole = long.Parse(parts[0]);
    var fracParts = parts[1].Split('/');
    long num = long.Parse(fracParts[0]);
    long denom = long.Parse(fracParts[1]);
    return (whole, num, denom);
}

static long GCD(long a, long b)
{
    while (b != 0)
    {
        long t = b;
        b = a % b;
        a = t;
    }
    return a;
}

static string AddMixedFractions(string f1, string f2)
{
    var (w1, n1, d1) = ParseMixedFraction(f1);
    var (w2, n2, d2) = ParseMixedFraction(f2);


    long num1 = w1 * d1 + n1;
    long num2 = w2 * d2 + n2;

    long denom = d1 * d2;
    long num = num1 * d2 + num2 * d1;

    long whole = num / denom;
    long remainder = num % denom;

    if (remainder == 0)
        return $"{whole}";

    long gcd = GCD(remainder, denom);
    remainder /= gcd;
    denom /= gcd;

    return $"{whole} {remainder}/{denom}";
}

if (args.Length == 2)
{
    Console.WriteLine(AddMixedFractions(args[0], args[1]));
}
else
{
    Console.WriteLine("Error: Please provide two mixed fractions as arguments.");
}