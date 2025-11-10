// See https://aka.ms/new-console-template for more information
class Program
{
    static void Main(string[] args)  //die Hauptklasse ist static
    {
        Console.WriteLine("Hello, World als Klasse!");
        try
        {
            if (args.Length < 2)
            {
                Console.WriteLine("Bitte zwei Brüche als Argumente übergeben. Beispiel: dotnet run -- 3/4 2  or dotnet run -- 1/2 3/4");
                return;
            }

            for (int i = 0; i < args.Length; i++)
            {
                Console.WriteLine($"Arg[{i}] = {args[i]}");
            }

            Bruch b1 = new Bruch(args[0]); //erstellt ein neues objekt der klasse bruch
            Bruch b2 = new Bruch(args[1]);
            Bruch b3 = b1.Addiere(b2);
            Console.WriteLine("Ergebnis: " + b3.ToString());
        }
        catch (System.ArgumentNullException ex)
        {
            Console.WriteLine("Fehler: Ein erwarteter Wert fehlt. " + ex.Message);
            Environment.Exit(1);
        }
        catch (System.ArgumentException ex)
        {
            Console.WriteLine("Fehler: " + ex.Message);
            Environment.Exit(1);
        }
        catch (System.FormatException ex)
        {
            Console.WriteLine("Fehler beim Einlesen der Brüche: " + ex.Message);
            Environment.Exit(1);
        }
        catch (System.Exception ex)
        {
            Console.WriteLine("Unerwarteter Fehler: " + ex.Message);
            Environment.Exit(1);
        }
    }
}
