using System;

namespace Bruch
{
    class Program
    {
        static void Main(string[] args)
        {
            if (args.Length != 2)
            {
                Console.WriteLine("Hilfe: Bitte geben Sie genau zwei ganze Zahlen an (Zähler und Nenner).");
                Console.WriteLine("Beispiel: dotnet run -- 3 4");
                return;
            }

            try
            {
                int z = int.Parse(args[0]);
                int n = int.Parse(args[1]);

                Bruch b = new Bruch(z, n);
                Console.WriteLine(b.ToString());
            }
            catch (FormatException)
            {
                Console.WriteLine("Fehler: Die Eingaben müssen gültige ganze Zahlen sein.");
            }
            catch (ArgumentException ex)
            {
                Console.WriteLine($"Fehler: {ex.Message}");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Ein unerwarteter Fehler ist aufgetreten: {ex.Message}");
            }
        }
    }
}
