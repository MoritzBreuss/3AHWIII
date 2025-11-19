using Xunit;
using System;

public class BruchTests
{
    // Tests für einfache Brüche
    [Fact]
    public void Bruch_EinfacherBruch_WirdKorrektErstellt()
    {
        // Arrange & Act
        var bruch = new Bruch("3/4");
        
        // Assert
        Assert.Equal("3/4", bruch.ToString());
    }

    [Fact]
    public void Bruch_GanzeZahl_WirdKorrektErstellt()
    {
        // Arrange & Act
        var bruch = new Bruch("5");
        
        // Assert
        Assert.Equal("5", bruch.ToString());
    }

    // Tests für gemischte Zahlen
    [Fact]
    public void Bruch_GemischteZahl_WirdKorrektErstellt()
    {
        // Arrange & Act
        var bruch = new Bruch("5 3/4");
        
        // Assert
        Assert.Equal("5 3/4", bruch.ToString());
    }

    [Fact]
    public void Bruch_GemischteZahlMitLeerzeichen_WirdKorrektErstellt()
    {
        // Arrange & Act
        var bruch = new Bruch("  2   2/6  ");
        
        // Assert
        // 2 2/6 wird gekürzt zu 2 1/3
        Assert.Equal("2 1/3", bruch.ToString());
    }

    // Tests für Kürzen
    [Fact]
    public void Bruch_WirdAutomatischGekuerzt()
    {
        // Arrange & Act
        var bruch = new Bruch("6/8");
        
        // Assert
        Assert.Equal("3/4", bruch.ToString());
    }

    [Fact]
    public void Bruch_UnechterBruch_WirdAlsGemischteZahlAngezeigt()
    {
        // Arrange & Act
        var bruch = new Bruch("23/4");
        
        // Assert
        Assert.Equal("5 3/4", bruch.ToString());
    }

    // Tests für Addition
    [Fact]
    public void Addiere_ZweiBrueche_ErgibtKorrektesErgebnis()
    {
        // Arrange
        var bruch1 = new Bruch("1/2");
        var bruch2 = new Bruch("1/3");
        
        // Act
        var ergebnis = bruch1.Addiere(bruch2);
        
        // Assert
        Assert.Equal("5/6", ergebnis.ToString());
    }

    [Fact]
    public void Addiere_GemischteZahlen_ErgibtKorrektesErgebnis()
    {
        // Arrange
        var bruch1 = new Bruch("5 3/4");
        var bruch2 = new Bruch("2 2/6");
        
        // Act
        var ergebnis = bruch1.Addiere(bruch2);
        
        // Assert
        // 5 3/4 = 23/4, 2 2/6 = 2 1/3 = 7/3
        // 23/4 + 7/3 = 69/12 + 28/12 = 97/12 = 8 1/12
        Assert.Equal("8 1/12", ergebnis.ToString());
    }

    [Fact]
    public void Addiere_BruchMitGanzerZahl_ErgibtKorrektesErgebnis()
    {
        // Arrange
        var bruch1 = new Bruch("3/4");
        var bruch2 = new Bruch("2");
        
        // Act
        var ergebnis = bruch1.Addiere(bruch2);
        
        // Assert
        Assert.Equal("2 3/4", ergebnis.ToString());
    }

    // Tests für Fehlerfälle
    [Fact]
    public void Bruch_NullString_WirftArgumentNullException()
    {
        // Arrange, Act & Assert
        Assert.Throws<ArgumentNullException>(() => new Bruch(null));
    }

    [Fact]
    public void Bruch_NennerNull_WirftArgumentException()
    {
        // Arrange, Act & Assert
        Assert.Throws<ArgumentException>(() => new Bruch("5/0"));
    }

    [Fact]
    public void Bruch_UngueltigesFormat_WirftFormatException()
    {
        // Arrange, Act & Assert
        Assert.Throws<FormatException>(() => new Bruch("abc"));
    }

    [Fact]
    public void Bruch_UngueltigesFormatMitMehrerenSlashes_WirftFormatException()
    {
        // Arrange, Act & Assert
        Assert.Throws<FormatException>(() => new Bruch("1/2/3"));
    }

    [Fact]
    public void Addiere_NullParameter_WirftArgumentNullException()
    {
        // Arrange
        var bruch = new Bruch("1/2");
        
        // Act & Assert
        Assert.Throws<ArgumentNullException>(() => bruch.Addiere(null));
    }

    // Tests für negative Brüche
    [Fact]
    public void Bruch_NegativerZaehler_WirdKorrektVerarbeitet()
    {
        // Arrange & Act
        var bruch = new Bruch("-3/4");
        
        // Assert
        Assert.Equal("-3/4", bruch.ToString());
    }

    [Fact]
    public void Bruch_NegativerNenner_WirdZuPositivemNenner()
    {
        // Arrange & Act
        var bruch = new Bruch("3/-4");
        
        // Assert
        Assert.Equal("-3/4", bruch.ToString());
    }

    // Tests für Spezialfälle
    [Fact]
    public void Bruch_Null_WirdKorrektDargestellt()
    {
        // Arrange & Act
        var bruch = new Bruch("0");
        
        // Assert
        Assert.Equal("0", bruch.ToString());
    }

    [Fact]
    public void Bruch_EinsAlsBruch_WirdAlsGanzeZahlDargestellt()
    {
        // Arrange & Act
        var bruch = new Bruch("4/4");
        
        // Assert
        Assert.Equal("1", bruch.ToString());
    }
}
