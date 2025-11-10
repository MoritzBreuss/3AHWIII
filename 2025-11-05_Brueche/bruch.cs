class Bruch
{
    //alle attribute der klasse bruch müssen erstellt werden wenn es sie nich schon gibt
    private int zaehler;   //private damit nur in der klasse bruch darauf zugegriffen werden kann
    private int nenner;

    public Bruch(string bruchtext)  //konstruktor ist wenn es die gleichen Namen wie die klasse hat
    {
        if (bruchtext == null) throw new System.ArgumentNullException(nameof(bruchtext));
        bruchtext = bruchtext.Trim();
        try
        {
            if (bruchtext.Contains("/"))
            {
                string[] teile = bruchtext.Split('/');
                if (teile.Length != 2) throw new System.FormatException("Ungültiges Bruchformat. Erwartet 'a/b' oder 'c'.");
                int z = int.Parse(teile[0].Trim());
                int n = int.Parse(teile[1].Trim());
                if (n == 0) throw new System.ArgumentException("Nenner darf nicht 0 sein.");
                InitAndReduce(z, n);
            }
            else
            {
                int z = int.Parse(bruchtext);
                InitAndReduce(z, 1);
            }
        }
        catch (System.FormatException)
        {
            throw new System.FormatException("Bruch konnte nicht gelesen werden. Erwartet zum Beispiel '3/4' oder '2'.");
        }
    }
    
    
    private Bruch(int z, int n)
    {
        if (n == 0) throw new System.ArgumentException("Nenner darf nicht 0 sein.");
        InitAndReduce(z, n);
    }

    private void InitAndReduce(int z, int n)
    {
        if (n < 0)
        {
            z = -z;
            n = -n;
        }
        int g = Gcd(System.Math.Abs(z), System.Math.Abs(n));
        if (g == 0) g = 1; 
        this.zaehler = z / g;
        this.nenner = n / g;
    }
    public Bruch Addiere(Bruch b)
    {
        if (b == null) throw new System.ArgumentNullException(nameof(b));
 
        long z = (long)this.zaehler * b.nenner + (long)b.zaehler * this.nenner;
        long n = (long)this.nenner * b.nenner;
        return new Bruch((int)z, (int)n);
    }
    
    public override string ToString()
    {
        if (nenner == 1)
        {
            return zaehler.ToString();
        }

        int absZ = System.Math.Abs(zaehler);
        int absN = System.Math.Abs(nenner);

        if (absZ > absN)
        {
            int ganz = zaehler / nenner;
            int rest = absZ % absN; 
            if (rest == 0) return ganz.ToString();
            return $"{ganz} {rest}/{absN}";
        }
        else
        {
            return $"{zaehler}/{nenner}";
        }
    }

    private static int Gcd(int a, int b)
    {
        if (a == 0) return b;
        if (b == 0) return a;
        while (b != 0)
        {
            int t = a % b;
            a = b;
            b = t;
        }
        return a;
    }
}