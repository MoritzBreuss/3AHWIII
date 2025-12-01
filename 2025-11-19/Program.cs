using System;

namespace EinfachesBeispiel
{
    class Program
    {
        static void Main(string[] args)
        {
            Hund meinHund = new Hund(name: "Bello", alterInMenschenJahren: 3);
            Hund dejansHund = new Hund("Dejan", -4);

            Console.WriteLine($"Name: {meinHund.Name}");
            Console.WriteLine($"Alter (Menschenjahre): {meinHund.AlterInMenschenJahren}");
            Console.WriteLine($"Alter (Hundejahre): {meinHund.BerechneHundeJahre()}");

            Console.WriteLine($"\nName: {dejansHund.Name}");
            Console.WriteLine($"Aktualisiertes Alter (Menschenjahre): {dejansHund.AlterInMenschenJahren}");
            Console.WriteLine($"Aktualisiertes Alter (Hundejahre): {dejansHund.BerechneHundeJahre()}");
        }
    }


    class Hund
    {
        private string _name;
        private double _alterInMenschenJahren;

               public Hund(string name, int alterInMenschenJahren)
        {
                   this.Name = name;
            this.AlterInMenschenJahren = alterInMenschenJahren;
        }

        public string Name
        {
            get 
            { 
                return _name; 
            }
            set 
            { 
                _name = value; 
            }
        }

        public double AlterInMenschenJahren
        {
            get 
            { 
                return _alterInMenschenJahren; 
            }
            set
            {
                if (value < 0) 
                {
                    Console.WriteLine("Fehler: Alter darf nicht negativ sein.");
                    _alterInMenschenJahren = value;
                }
                else
                {
                    _alterInMenschenJahren = value;
                }
            }
        }

        public double BerechneHundeJahre()
        {
            return this.AlterInMenschenJahren * 7;
        }
    }
}
