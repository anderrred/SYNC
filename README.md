# SYNC

System zarządzania zmianami w fabryce — aplikacja klient-serwer (React + ASP.NET Core + PostgreSQL).

## Stack

| Warstwa | Technologia |
|---------|-------------|
| Frontend | React, TypeScript, Vite, Tailwind CSS |
| Backend | ASP.NET Core 8, Entity Framework Core |
| Baza | PostgreSQL (Neon) |
| Auth | JWT (Bearer) |

## Wymagania

- [.NET 8 SDK](https://dotnet.microsoft.com/download)
- [Node.js](https://nodejs.org/) (LTS)
- Dostęp do bazy: connection string w `SYNC.Api/appsettings.json` (`DefaultConnection`)

Polecenia poniżej zakładają katalog roboczy **`SYNC/`** (root repozytorium, obok `SYNC.sln`).

## Struktura repozytorium

```
SYNC/
├── SYNC.sln
├── SYNC.Api/          # REST API
└── SYNC.Client/       # aplikacja SPA
```

## Pierwsze uruchomienie

```powershell
dotnet restore SYNC.sln
dotnet build SYNC.sln

cd SYNC.Client
npm install
cd ..
```

## Uruchomienie lokalne

Uruchom **dwa** procesy (kolejność dowolna):

**1. API**

```powershell
cd SYNC.Api
dotnet run --launch-profile http
```

- API: `http://localhost:5299`
- Swagger: `http://localhost:5299/swagger`

**2. Frontend**

```powershell
cd SYNC.Client
npm run dev
```

- Aplikacja: `http://localhost:5173`
- Logowanie: `http://localhost:5173/login`

Domyślny adres API w kliencie: `http://localhost:5299/api`. Nadpisanie: zmienna `VITE_API_URL` (np. plik `.env` w `SYNC.Client`).

## Konfiguracja

| Plik | Opis |
|------|------|
| `SYNC.Api/appsettings.json` | PostgreSQL, klucz JWT |
| `SYNC.Api/appsettings.Development.json` | ustawienia dev (opcjonalnie) |

Hasła do bazy, klucz JWT i hasła kont demo **nie commituj** do publicznego repozytorium — przekazuj je zespołowi poza gitem (chat, menedżer haseł).

## Logowanie i konta

- Użytkownicy w tabeli `Users` (PostgreSQL); hasła wyłącznie jako skrót BCrypt.
- Logowanie w UI: **email + hasło**. Brak ekranu rejestracji w React (M1).
- Nowe konto: `POST /api/Auth/register` w Swaggerze — najpierw zaloguj się jako **Admin**, skopiuj `token`, w Swaggerze **Authorize** → `Bearer <token>`.

### Konta demo (testy lokalne)

| Rola | Email | Hasło |
|------|-------|--------|
| Worker | `ss17.worker@sync.pl` | `SyncTest18` |
| Admin | `adminglowny@sync.pl` | `Admin0990` |

Po zalogowaniu Worker nie widzi zakładki **Pracownicy**; Admin — widzi.

## Build (weryfikacja)

```powershell
dotnet build SYNC.sln
cd SYNC.Client
npm run build
```

## Migracje bazy

```powershell
cd SYNC.Api
dotnet ef database update
```

Przy pierwszym użyciu narzędzia EF (jednorazowo):

```powershell
dotnet tool install --global dotnet-ef
```

## Zespół

Wszyscy deweloperzy używają tej samej bazy Neon z `appsettings.json` — użytkownicy i zmiany w bazie są wspólne dla całego zespołu.
