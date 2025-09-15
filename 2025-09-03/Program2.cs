using System;

namespace _3AHWIII;

public class Program2
{
    public static void Main(string[] args)
    {
        try
        {
            if (args.Length != 2)
            {
                throw new ArgumentException("Please provide two mixed fractions as arguments");
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
    }
}
