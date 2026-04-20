## Hausübung vom 15.4.2026: Inference Tests in opencode

# Inference Tests in opencode

Dieses README dokumentiert den aktuellen Teststand der Inference-Provider im Free-Tier.

## Teststand

Stand: getestet, Ergebnisse unten dokumentiert.

### Funktioniert gut

- Hugging Face
- OpenRouter
- opencode Zen
- NVIDIA
- GitHub Copilot

### Probleme

1. Google

Fehler:

Your project has been denied access. Please contact support.

Was bereits versucht wurde:

- Reparatur in Google AI Studio
- 2FA aktiviert
- Neues Projekt erstellt
- Neuen API-Key erstellt

Ergebnis:

Trotz dieser Schritte besteht der Fehler weiterhin. Das deutet eher auf ein Zugriffs- oder Projektfreigabeproblem bei Google hin.

2. Groq

Fehler:

Request too large for model qwen/qwen3-32b in organization org_01knrn65yzf2rbjry4npdatpbq service tier on_demand on tokens per minute (TPM): Limit 6000, Requested 32458, please reduce your message size and try again. Need more tokens? Upgrade to Dev Tier today at https://console.groq.com/settings/billing

Beobachtung:

Der Prompt war nur "Good Morning". Im Groq-Dashboard werden trotzdem Tokens verbraucht, obwohl keine Antwort zurueckkommt.


## Fazit

Die lokale Konfiguration funktioniert insgesamt gut, weil mehrere Provider stabil laufen. Die offenen Punkte liegen aktuell bei einzelnen Provider-Limits oder Zugriffsrechten, nicht bei opencode selbst.
