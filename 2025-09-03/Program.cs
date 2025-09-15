using _3AHWIII;

// Example usage: dotnet run "1 1/2" "2 1/4"
// This will add the mixed fractions 1 1/2 and 2 1/4

try
{
    if (args.Length != 2)
    {
        throw new ArgumentException("Please provide two mixed fractions as arguments in the format: \"whole numerator/denominator\" \"whole numerator/denominator\"");
    }

    var fraction1 = MixedFraction.Parse(args[0]);
    var fraction2 = MixedFraction.Parse(args[1]);
    
    var result = fraction1 + fraction2;
    Console.WriteLine(result);
}
catch (Exception ex)
{
    Console.WriteLine($"Error: {ex.Message}");
}
