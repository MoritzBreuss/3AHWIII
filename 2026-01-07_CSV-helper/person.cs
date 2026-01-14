using System;
using System.Globalization;
using CsvHelper;
using CsvHelper.Configuration;


namespace CSV_helper
{
    public class Person
    {
        public string Fullname { get; set; }
        public string Email { get; set; }
        public string Telefon { get; set; }
        public string Adresse { get; set; }
        public string? unicode { get; set; }
    }

    public class Program
    {
        static void Main(string[] args)
        {
            var config = new CsvConfiguration(CultureInfo.InvariantCulture)
            {
                Delimiter = ";",
                MissingFieldFound = null
            };

            using var reader = new StreamReader("persons.csv");
            using var csv = new CsvReader(reader, config);
            
            Person[] personsArray = csv.GetRecords<Person>().ToArray();

            foreach (var person in personsArray)
            {
                Console.WriteLine($"{person.Fullname} | {person.Email} | {person.Telefon} | {person.Adresse} | {person.unicode}");
                Console.WriteLine("--------------------------------------------------------------");
            }

            Console.ReadKey(); 
        }
    }
}
