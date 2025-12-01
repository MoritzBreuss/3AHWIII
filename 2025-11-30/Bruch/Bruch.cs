using System;

namespace Bruch
{
    public class Bruch
    {
        public int Zaehler { get; private set; }
        public int Nenner { get; private set; }

        public Bruch(int z, int n)
        {
            if (n == 0)
            {
                throw new ArgumentException("Nenner darf nicht 0 sein.");
            }
            Zaehler = z;
            Nenner = n;
        }

        private int Ggt(int a, int b)
        {
            return b == 0 ? Math.Abs(a) : Ggt(b, a % b);
        }

        public override string ToString()
        {
            if (Zaehler == 0) return "0";

            int teiler = Ggt(Zaehler, Nenner);
            int z = Zaehler / teiler;
            int n = Nenner / teiler;

            // Ensure denominator is positive
            if (n < 0) { n = -n; z = -z; }

            // Case: Whole number
            if (n == 1) return z.ToString();

            // Case: Mixed number
            int ganz = z / n;
            int rest = Math.Abs(z % n);

            if (ganz != 0)
            {
                return $"{ganz} {rest}/{n}";
            }
            
            // Case: Simple fraction
            return $"{z}/{n}";
        }
    }
}