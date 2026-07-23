# Instrukcja obsługi systemu Valeris

### Strona internetowa, CRM i Arkusz Google — kompletny podręcznik użytkownika

---

## Spis treści

1. [Wprowadzenie](#1-wprowadzenie)
2. [Jak to wszystko działa razem](#2-jak-to-wszystko-działa-razem)
3. [Strona internetowa — formularz kontaktowy](#3-strona-internetowa--formularz-kontaktowy)
4. [Logowanie do CRM](#4-logowanie-do-crm)
5. [Menu główne CRM](#5-menu-główne-crm)
6. [Pulpit (Dashboard)](#6-pulpit-dashboard)
7. [Zapytania (Leads)](#7-zapytania-leads)
8. [Firmy (Companies)](#8-firmy-companies)
9. [Kontakty (Contacts)](#9-kontakty-contacts)
10. [Projekty (Projects)](#10-projekty-projects)
11. [Zadania (Tasks)](#11-zadania-tasks)
12. [Usługi (Services)](#12-usługi-services)
13. [Zespół (Team)](#13-zespół-team)
14. [Ustawienia (Settings)](#14-ustawienia-settings)
15. [Arkusz Google — co się w nim znajduje](#15-arkusz-google--co-się-w-nim-znajduje)
16. [Typowe sytuacje — instrukcje krok po kroku](#16-typowe-sytuacje--instrukcje-krok-po-kroku)
17. [Rozwiązywanie problemów](#17-rozwiązywanie-problemów)
18. [Dobre praktyki na co dzień](#18-dobre-praktyki-na-co-dzień)
19. [Słowniczek pojęć](#19-słowniczek-pojęć)

---

## 1. Wprowadzenie

Ta instrukcja opisuje trzy elementy, które razem tworzą system obsługi zapytań od klientów firmy Valeris:

| Element | Do czego służy |
|---|---|
| **Strona internetowa** | Miejsce, w którym potencjalny klient wypełnia formularz kontaktowy. |
| **CRM** (skrót od *Customer Relationship Management* — system do zarządzania relacjami z klientami) | Wewnętrzny program, w którym pracownicy Valeris przeglądają zapytania, prowadzą projekty i zadania. |
| **Arkusz Google** (Google Sheets) | Baza danych — miejsce, w którym fizycznie przechowywane są wszystkie dane (zapytania, firmy, kontakty, projekty). CRM jedynie je wyświetla i pozwala nimi zarządzać w wygodny sposób. |

> **Ważne do zapamiętania:** CRM i Arkusz Google to w praktyce dwa okna do tej samej szafy z dokumentami. Wszystko, co zrobisz w CRM, natychmiast pojawia się w Arkuszu. Nie musisz nic „synchronizować" ręcznie.

> **Uwaga językowa:** Sam **interfejs CRM** (czyli wszystkie przyciski, nagłówki i nazwy pól wewnątrz aplikacji, w odróżnieniu od strony internetowej) działa obecnie **wyłącznie w języku angielskim** — nie ma w nim przełącznika PL/EN, jak na stronie internetowej. Dlatego w tej instrukcji nazwy przycisków i pól podawane są w oryginalnym, angielskim brzmieniu (np. **„Save changes"**, **„New project"**), a obok każdej z nich znajduje się wyjaśnienie po polsku, co dana rzecz oznacza i do czego służy.

Ta instrukcja nie zakłada żadnej wiedzy technicznej. Terminy techniczne, których nie dało się uniknąć, są za każdym razem wyjaśnione zwykłym językiem. Na końcu instrukcji znajduje się też słowniczek (rozdział 19), do którego można wracać w dowolnym momencie.

---

## 2. Jak to wszystko działa razem

Poniżej znajduje się uproszczony opis tego, co dzieje się „pod maską", kiedy klient wypełnia formularz na stronie internetowej:

1. Klient wchodzi na stronę Valeris i wypełnia formularz kontaktowy.
2. Klient klika **„Wyślij wiadomość"**.
3. Zapytanie trafia automatycznie do Arkusza Google, do zakładki **„Leads"** (Zapytania), jako nowy wiersz.
4. To samo zapytanie natychmiast widać w CRM, w zakładce **Zapytania**.
5. Wszystkie liczby na Pulpicie (Dashboard) — zarówno w CRM, jak i w Arkuszu — automatycznie się aktualizują.

Nie ma żadnego opóźnienia, na które trzeba czekać, ani przycisku „odśwież dane", który trzeba kliknąć — dzieje się to samo, w ciągu kilku sekund.

---

## 3. Strona internetowa — formularz kontaktowy

Formularz kontaktowy znajduje się na stronie głównej Valeris, w sekcji **„Rozpocznij rozmowę"** (na dole strony). Jest dostępny w dwóch wersjach językowych: polskiej i angielskiej — przełącznik języka (**PL / EN**) znajduje się w prawym górnym rogu strony.

### 3.1 Pola formularza

| Pole | Wymagane? | Co można wpisać |
|---|:---:|---|
| **Imię** | Tak | Tylko litery (w tym polskie znaki: ą, ć, ę, ł, ń, ó, ś, ź, ż), spacje, apostrofy (`'`) i myślniki (`-`). |
| **Nazwisko** | Tak | Jak wyżej. |
| **Firma** | Nie | Dowolny tekst (nazwa firmy klienta). |
| **E-mail** | Tak | Musi mieć poprawny format adresu e-mail (np. `jan@firma.pl`). |
| **Telefon** | Nie | Tylko cyfry, spacje, znak `+`, myślnik `-` oraz nawiasy `( )`. Żadnych liter. |
| **Interesuje mnie** | Nie | Lista rozwijana z dostępnymi usługami (patrz niżej). |
| **Opowiedz nam krótko o swoim projekcie** | Tak | Dowolny tekst — treść zapytania klienta. |

> **Uwaga:** Pole „Interesuje mnie" **nie jest obowiązkowe** — klient może wysłać formularz bez wybierania konkretnej usługi. Jeśli nic nie wybierze, w systemie zapisze się to jako brak wskazanej usługi.

### 3.2 Dostępne usługi w liście rozwijanej

Aktualna lista usług (na dzień powstania tej instrukcji):

1. Weryfikacja dostawców
2. Doradztwo wejścia na rynek indyjski
3. Reprezentacja w Indiach
4. Wsparcie operacyjne
5. Wejście na rynek polski (firma indyjska)
6. Pharma — wejście na rynek europejski
7. Interesuje mnie logistyka
8. Inne / jeszcze nie wiem

> **Ważne:** Ta lista **nie jest zapisana na sztywno na stronie**. Jest zarządzana z poziomu CRM (patrz rozdział 12 — „Usługi"). Administrator może dodać, zmienić kolejność, zmienić nazwę albo usunąć dowolną usługę z tej listy w CRM — strona internetowa automatycznie pokaże nową wersję listy przy najbliższym wejściu klienta na stronę, **bez potrzeby proszenia programisty o zmianę czegokolwiek na stronie**.
>
> Jeśli z jakiegoś powodu strona nie może akurat pobrać aktualnej listy usług (np. chwilowy problem z połączeniem), pokaże się wcześniej zapisana, standardowa lista — formularz **zawsze będzie działał**, nawet w takiej sytuacji.

### 3.3 Co się dzieje, gdy klient kliknie „Wyślij"

1. Strona sprawdza, czy wszystkie wymagane pola są wypełnione i czy dane w polach Imię, Nazwisko, E-mail i Telefon mają poprawny format (patrz tabela wyżej).
2. Jeśli coś jest nie tak, pod formularzem pojawia się **czerwony komunikat błędu** (patrz tabela poniżej) i wiadomość **nie zostaje wysłana**.
3. Jeśli wszystko jest poprawne, przycisk zmienia napis na **„Wysyłanie…"**, a formularz zostaje zablokowany na czas wysyłki (żeby klient nie wysłał tego samego zapytania dwa razy przypadkowym podwójnym kliknięciem).
4. Po chwili pojawia się komunikat **„Dziękujemy — wiadomość została wysłana. Odezwiemy się w ciągu jednego dnia roboczego."** (na zielono), a formularz się czyści.
5. Nowe zapytanie natychmiast pojawia się w CRM i w Arkuszu Google.

### 3.4 Komunikaty błędów — co oznaczają

| Komunikat (po polsku) | Co oznacza | Co zrobić |
|---|---|---|
| „Uzupełnij wymagane pola." | Klient nie wypełnił jednego z pól: Imię, Nazwisko, E-mail lub treści wiadomości. | Uzupełnić brakujące pole. |
| „Imię i nazwisko mogą zawierać tylko litery, spacje, apostrofy i myślniki." | W polu Imię lub Nazwisko znalazła się cyfra albo inny niedozwolony znak (np. `@`, `#`, `$`). | Poprawić imię/nazwisko — usunąć cyfry i znaki specjalne. |
| „Podaj prawidłowy adres e-mail." | Adres e-mail nie ma poprawnego formatu (np. brakuje `@` albo końcówki typu `.pl`). | Poprawić adres e-mail. |
| „Podaj prawidłowy numer telefonu (tylko cyfry, spacje, +, - oraz nawiasy)." | W polu Telefon znalazła się litera lub inny niedozwolony znak. | Poprawić numer telefonu. |
| „Coś poszło nie tak. Spróbuj ponownie lub napisz do nas bezpośrednio." | Wiadomość nie dotarła z powodu np. przerwy w połączeniu internetowym. | Spróbować wysłać ponownie za chwilę. Jeśli problem się powtarza, patrz rozdział 17 (Rozwiązywanie problemów). |
| „Formularz nie jest jeszcze podłączony. Napisz do nas bezpośrednio e-mailem." | Techniczny problem z konfiguracją strony (nie powinno się zdarzyć w normalnym działaniu). | Zgłosić to od razu osobie technicznej odpowiedzialnej za stronę. |

> **Dlaczego te ograniczenia?** Imię i nazwisko z cyframi albo dziwnymi znakami to zwykle błąd klienta przy wpisywaniu albo próba wysłania „śmieciowego" zgłoszenia — takie ograniczenie sprawia, że lista zapytań w CRM pozostaje czysta i czytelna.

---

## 4. Logowanie do CRM

Adres CRM zostanie przekazany zespołowi osobno (jest inny niż adres strony internetowej — CRM to osobna, wewnętrzna aplikacja, niewidoczna publicznie).

### Krok po kroku

1. Wejdź na adres CRM w przeglądarce.
2. Wpisz swój **adres e-mail** oraz **hasło**.
3. Kliknij **„Sign in"** (Zaloguj).

Jeśli dane logowania są niepoprawne, pod formularzem pojawi się komunikat o błędzie w języku angielskim, ponieważ — jak wyjaśniono w rozdziale 1 — cały interfejs CRM działa obecnie tylko w tej wersji językowej.

### Nie pamiętam hasła

Pod polem hasła znajduje się link **„Forgot password?"** (Nie pamiętasz hasła?). Po kliknięciu zobaczysz informację:

> „Password resets are managed by your team administrator. Please contact them directly to have your password reset."
> *(Resetowanie hasła jest obsługiwane przez administratora zespołu. Skontaktuj się z nim bezpośrednio, aby zresetować hasło.)*

> **Ważne — to jedyne miejsce w całym systemie, które wymaga pomocy osoby technicznej.** Zresetowanie hasła nie odbywa się samodzielnie przez pracownika ani nawet przez administratora w samym CRM — wymaga uruchomienia krótkiej komendy bezpośrednio w Arkuszu Google (w tzw. edytorze skryptów). Jeśli hasło trzeba zresetować, poproś o to osobę techniczną obsługującą wasz system (np. dostawcę, który wdrażał CRM). To jedyna czynność w tym podręczniku, której **nie da się** wykonać samodzielnie z poziomu CRM.

### Role użytkowników

Każdy użytkownik CRM ma przypisaną **rolę**, która określa, co może robić:

| Rola | Co może |
|---|---|
| **Owner** (Właściciel) | Pełny dostęp do wszystkiego, łącznie z zarządzaniem zespołem i usuwaniem zapytań. |
| **Administrator** | To samo co Owner, poza jedną rzeczą: nie może zdegradować Właściciela do niższej roli. |
| **Sales** (Sprzedaż) | Widzi wszystkie Zapytania, Firmy i Kontakty. Może edytować te rekordy, których jest właścicielem albo do których jest przypisany. |
| **Operations** (Operacje) | Ten sam dostęp do odczytu co Sales. Może w pełni zarządzać (tworzyć/edytować) Projektami i Zadaniami, do których jest przypisany. |

> Tylko role **Owner** i **Administrator** widzą przycisk usuwania zapytania oraz mają dostęp do zarządzania Usługami (rozdział 12) i dodawania nowych osób do zespołu.

---

## 5. Menu główne CRM

Po zalogowaniu, po lewej stronie ekranu (na telefonie: w rozwijanym menu) znajduje się główna nawigacja:

| Pozycja menu | Co tam znajdziesz |
|---|---|
| **Dashboard** (Pulpit) | Podsumowanie liczbowe całej firmy — ile jest zapytań, projektów, zadań. |
| **Leads** (Zapytania) | Lista wszystkich zapytań od klientów ze strony internetowej. |
| **Companies** (Firmy) | Lista firm — klientów i partnerów biznesowych. |
| **Contacts** (Kontakty) | Lista osób kontaktowych przypisanych do firm. |
| **Projects** (Projekty) | Aktywne i zakończone projekty (np. zlecenie weryfikacji dostawcy). |
| **Tasks** (Zadania) | Konkretne czynności do wykonania, przypisane do osób. |
| **Team** (Zespół) | Lista osób pracujących w CRM i ich role. |
| **Services** (Usługi) | Zarządzanie listą usług widoczną na stronie internetowej. |
| **Settings** (Ustawienia) | Informacje o Twoim koncie i o systemie (strona tylko do odczytu). |

---

## 6. Pulpit (Dashboard)

Po zalogowaniu domyślnie widzisz stronę **Dashboard**. To pierwsza rzecz, na którą warto zerknąć każdego dnia — pokazuje aktualny stan firmy jednym rzutem oka.

> **Uwaga — istnieją DWA pulpity, nie jeden.** Ten opisany w tym rozdziale znajduje się **w CRM** (kiedy jesteś zalogowany w przeglądarce). Zupełnie osobny pulpit istnieje też **bezpośrednio w Arkuszu Google**, na zakładce o nazwie „Dashboard" — opisany jest w rozdziale 15.4. Oba pokazują podobne informacje, ale są od siebie niezależne — to normalne i zamierzone, nie jest to błąd.

Dashboard w CRM podzielony jest na cztery sekcje:

### 6.1 Sekcja „Leads" (Zapytania)

| Kafelek | Co pokazuje |
|---|---|
| **Total leads** | Łączna liczba wszystkich aktywnych zapytań (bez usuniętych). |
| **Open** | Liczba zapytań w statusie „New", „Contacted", „Qualified" lub „Proposal" — czyli takich, które są jeszcze „w grze", nie zostały zamknięte. |
| **High priority** | Liczba zapytań oznaczonych jako priorytet „High" (Wysoki). Podświetlone na czerwono, jeśli jest ich więcej niż zero. |
| **New this month** | Liczba zapytań, które wpłynęły w bieżącym miesiącu kalendarzowym. Pod spodem widać też, ile z nich zakończyło się statusem „Won" (Wygrane). |

Kliknięcie w dowolny z tych kafelków przenosi bezpośrednio do listy Zapytań.

### 6.2 Sekcja „Projects" (Projekty)

Pokazuje: **Total** (wszystkie), **Active** (aktywne, na zielono) i **Completed** (zakończone).

### 6.3 Sekcja „Tasks" (Zadania)

Pokazuje: **Total** (wszystkie), **Open** (otwarte), **Due today** (termin dziś — podświetlone na żółto, jeśli jakieś są) i **Overdue** (przeterminowane — podświetlone na czerwono, jeśli jakieś są).

### 6.4 Karta „Lead pipeline" (Ścieżka zapytań)

Tabela pokazująca, ile zapytań znajduje się w każdym z siedmiu możliwych statusów: **New, Contacted, Qualified, Proposal, Won, Lost, Spam** (znaczenie każdego statusu opisane jest w rozdziale 7.3).

> Wszystkie liczby na tym Pulpicie liczą się **same, automatycznie**, na podstawie aktualnych danych w Arkuszu. Nie trzeba niczego samodzielnie sumować ani odświeżać.

---

## 7. Zapytania (Leads)

To najważniejsza część CRM na co dzień — tutaj trafiają wszystkie zapytania klientów ze strony internetowej.

> **Ważne:** w tej zakładce **nie ma przycisku „utwórz zapytanie ręcznie"** — i nie jest to przeoczenie. Zapytania mogą powstać tylko w jeden sposób: gdy klient wypełni formularz kontaktowy na stronie internetowej (rozdział 3). Zespół Valeris tylko przegląda, edytuje i porządkuje to, co przyszło ze strony — nie tworzy nowych zapytań samodzielnie w CRM.

### 7.1 Lista zapytań

Tabela pokazuje kolumny: **Received** (data wpłynięcia), **Name** (imię i nazwisko), **Company** (firma), **Interest** (wybrana usługa), **Status**, **Priority** (priorytet), **Next Action** (planowana kolejna czynność), **Owner** (osoba odpowiedzialna).

Nad tabelą znajdują się narzędzia:

- **Pole wyszukiwania** — wpisz dowolny fragment imienia, nazwiska, firmy lub e-maila, a lista przefiltruje się na bieżąco.
- **Filtr statusu** — rozwijana lista, żeby pokazać tylko zapytania w wybranym statusie (np. tylko „New").
- **Filtr priorytetu** — analogicznie, dla priorytetu.
- **Przycisk „Clear"** (Wyczyść) — pojawia się, gdy jakiś filtr jest aktywny; czyści wszystkie filtry naraz.
- Licznik z prawej strony (np. „12 of 45") pokazuje, ile wierszy jest widocznych po filtrowaniu, na tle wszystkich zapytań.

Kliknięcie w dowolny wiersz otwiera szczegóły tego zapytania.

**Sortowanie:** kliknięcie na nagłówek dowolnej kolumny (np. „Received") sortuje tabelę rosnąco, ponowne kliknięcie — malejąco. Strzałka obok nazwy kolumny pokazuje aktualny kierunek sortowania.

### 7.2 Szczegóły zapytania

Po kliknięciu w wiersz widzisz pełne informacje podzielone na sekcje:

- **Dane kontaktowe** — imię, nazwisko, e-mail (klikalny — otwiera program pocztowy), telefon (klikalny — inicjuje połączenie), język, wybrana usługa, kierunek handlu.
- **Wiadomość** — treść zapytania wpisana przez klienta.
- **Źródło (Source)** — skąd przyszedł klient: parametry UTM (patrz słowniczek, rozdział 19), strona odsyłająca, konkretna podstrona, urządzenie, przeglądarka, system operacyjny, język.
- **Lokalizacja (Location)** — adres IP, kraj, miasto, strefa czasowa, dokładna data i godzina wysłania formularza. (Więcej o tych danych w rozdziale 7.5.)
- **Oś czasu (Activity timeline)** — chronologiczna lista wszystkich zdarzeń związanych z tym zapytaniem (np. „Lead received", zmiany statusu) oraz notatek dodanych ręcznie przez zespół. Pod spodem znajduje się pole do dodania własnej notatki — wpisz tekst i kliknij **„Add note"**.
- **Pola CRM** (panel po prawej stronie) — tutaj edytujesz zapytanie (patrz niżej).

### 7.3 Statusy zapytania

| Status | Znaczenie |
|---|---|
| **New** | Świeże zapytanie, jeszcze nie skontaktowano się z klientem. |
| **Contacted** | Ktoś z zespołu już się odezwał do klienta. |
| **Qualified** | Zapytanie zostało wstępnie zweryfikowane jako realna szansa biznesowa. |
| **Proposal** | Klientowi przedstawiono ofertę/propozycję. |
| **Won** | Zapytanie zakończyło się sukcesem (klient został pozyskany). |
| **Lost** | Zapytanie nie zakończyło się sukcesem. |
| **Spam** | Zapytanie uznane za niechciane/nieistotne (np. spam, testowe zgłoszenie, oczywista pomyłka). |

### 7.4 Priorytety

**High** (Wysoki), **Medium** (Średni), **Low** (Niski). Nowe zapytania dotyczące weryfikacji dostawców oraz usług Pharma otrzymują automatycznie priorytet **High** — resztę system oznacza domyślnie jako **Medium**. Priorytet można zmienić ręcznie w dowolnym momencie.

### 7.5 Skąd biorą się dodatkowe dane (metadane)

Każde zapytanie ze strony internetowej automatycznie zbiera dodatkowe informacje, które pomagają zrozumieć, skąd przyszedł klient:

| Dana | Skąd pochodzi | Czy zawsze dostępna? |
|---|---|---|
| Data i godzina wysłania | Zapisywana automatycznie w momencie wysłania formularza. | Zawsze. |
| Strefa czasowa klienta | Odczytywana z ustawień przeglądarki klienta. | Prawie zawsze. |
| Adres IP, kraj, miasto | Ustalane na podstawie publicznie dostępnej usługi sprawdzającej adres IP odwiedzającego. | **Nie zawsze.** Jeśli usługa jest niedostępna (np. przez ustawienia przeglądarki klienta blokujące taką usługę), pola te zostają po prostu puste — formularz i tak działa poprawnie. |
| Przeglądarka i system operacyjny | Odczytywane z przeglądarki klienta. | Prawie zawsze — w rzadkich przypadkach system pokaże „Other" (Inne), jeśli nie rozpozna dokładnie typu przeglądarki. |
| Język strony | Wersja językowa, w której klient wypełniał formularz (PL lub EN). | Zawsze. |
| Strona odsyłająca (Referrer) i parametry UTM | Jeśli klient trafił na stronę z linku w reklamie/kampanii, który zawierał specjalne oznaczenia (np. `utm_source=facebook`). | Tylko jeśli takie oznaczenia były w linku, z którego skorzystał klient. |
| Strona, na której wypełniono formularz | Adres konkretnej podstrony. | Zawsze. |

> **To normalne, że część tych pól bywa pusta.** System jest zaprojektowany tak, aby żadne zapytanie nigdy nie zostało odrzucone z powodu braku którejś z tych dodatkowych informacji — liczy się przede wszystkim to, że dane kontaktowe klienta zostały poprawnie zapisane.

### 7.6 Edytowanie zapytania

W panelu **„CRM fields"** po prawej stronie szczegółów zapytania możesz zmienić:

- **Status** (lista rozwijana),
- **Priority** (lista rozwijana),
- **Owner** (osoba odpowiedzialna — wpisz imię lub e-mail),
- **Trade direction** (kierunek handlu, jeśli dotyczy),
- **Next action** (opis planowanej kolejnej czynności, np. „Zadzwonić jutro"),
- **Next action date** (data tej czynności),
- **Internal notes** (notatki wewnętrzne, widoczne tylko dla zespołu).

Po wprowadzeniu zmian kliknij **„Save changes"**. Pod przyciskiem pojawi się napis **„Saved."** po zapisaniu, lub czerwony komunikat błędu, jeśli coś poszło nie tak.

> Zmiana statusu jest automatycznie zapisywana na osi czasu jako zdarzenie (np. „Status changed from New to Contacted") — nikt nie musi tego ręcznie notować.

### 7.7 Usuwanie zapytania

1. Wejdź w szczegóły zapytania.
2. W prawym górnym rogu kliknij czerwony przycisk **„Delete"** (widoczny tylko dla ról Owner i Administrator).
3. Pojawi się okno z prośbą o potwierdzenie, z opisem: *„Zapytanie zniknie ze wszystkich list i liczników w CRM. Sam rekord zostaje zachowany (usunięcie odwracalne) i można go przywrócić z poziomu Arkusza Google, jeśli zajdzie taka potrzeba — nic nie jest trwale kasowane."*
4. Kliknij **„Delete lead"**, żeby potwierdzić, albo **„Cancel"**, żeby się wycofać.

> **Ważne — usunięcie jest odwracalne.** System nigdy nie kasuje wiersza z Arkusza fizycznie. Zamiast tego oznacza go jako usunięty (ukryty), dzięki czemu w razie pomyłki dane można odzyskać (patrz rozdział 17 — „Przypadkowo coś usunąłem/am").

### 7.8 Synchronizacja z Arkuszem Google

Każda zmiana wykonana w CRM (edycja pola, zmiana statusu, usunięcie) **natychmiast** zapisuje się w Arkuszu Google, w zakładce **Leads**. Nie ma żadnego opóźnienia ani osobnego przycisku „zapisz do Arkusza" — to jeden i ten sam zbiór danych, tylko oglądany z dwóch różnych miejsc.

---

## 8. Firmy (Companies)

Zakładka **Companies** to lista firm — zarówno klientów, jak i partnerów biznesowych.

### 8.1 Lista firm

Kolumny: **Company** (nazwa), **Type** (typ — np. Importer, Exporter, Manufacturer), **Country**, **Industry** (branża), **Trade direction**, **Status**, **Email**.

Nad tabelą: pole wyszukiwania oraz filtr statusu (**Active, Inactive, Prospect, Partner**).

### 8.2 Dodawanie nowej firmy

1. Kliknij **„New company"** (przycisk w prawym górnym rogu listy — widoczny dla każdej zalogowanej osoby, niezależnie od roli).
2. Wypełnij formularz — jedyne wymagane pole to **nazwa firmy**. Pozostałe pola (typ, status, kraj, miasto, branża, kierunek handlu, e-mail, telefon, strona www, LinkedIn, notatki) są opcjonalne.
3. Kliknij **„Create company"**.

### 8.3 Szczegóły i edycja firmy

Strona szczegółów firmy pokazuje pełne dane kontaktowe, listę powiązanych **Kontaktów** (z przyciskiem **„Add contact"**, żeby dodać kolejną osobę kontaktową bezpośrednio przypisaną do tej firmy) oraz oś czasu z notatkami — działa dokładnie tak samo, jak w przypadku Zapytań (rozdział 7.2 i 7.6).

Edycja danych firmy odbywa się w panelu po prawej stronie, analogicznie do edycji zapytania.

> **Ograniczenie:** obecnie **nie ma** przycisku do usuwania firmy bezpośrednio w CRM (w przeciwieństwie do Zapytań). Jeśli firma nie jest już aktualna, najlepszym rozwiązaniem jest zmiana jej statusu na **„Inactive"** — to odpowiednik „zarchiwizowania" bez usuwania danych. Jeśli naprawdę trzeba trwale usunąć firmę z systemu, skontaktuj się z osobą techniczną.

---

## 9. Kontakty (Contacts)

Zakładka **Contacts** to lista konkretnych osób (np. „Jan Kowalski, Dyrektor Zakupów w firmie X").

### 9.1 Lista kontaktów

Kolumny: **Name**, **Title** (stanowisko), **Email**, **Phone**, **Language**, **Status**, **Primary** (widoczna gwiazdka/oznaczenie, jeśli dana osoba jest głównym kontaktem w swojej firmie).

### 9.2 Dodawanie kontaktu

Są dwie drogi, tak samo jak przy Zadaniach (rozdział 11.3):

1. **Z głównej zakładki Contacts** — kliknij **„New contact"** w prawym górnym rogu listy.
2. **Ze strony konkretnej firmy** (droga zalecana) — na stronie szczegółów firmy kliknij **„Add contact"**; pole „Firma" wypełni się wtedy samo.

W obu przypadkach formularz jest taki sam: wypełnij **Imię i Nazwisko** (wymagane), Firma (lista rozwijana), Stanowisko, E-mail, Telefon, Język, Status, LinkedIn oraz zaznacz opcjonalnie **„Primary contact for this company"**, jeśli to główna osoba kontaktowa w danej firmie, a następnie kliknij **„Create contact"**.

### 9.3 Ograniczenie

Podobnie jak w przypadku Firm, **nie ma** obecnie przycisku do usuwania kontaktu bezpośrednio w CRM. Zmień status na **„Inactive"**, jeśli kontakt jest nieaktualny, albo skontaktuj się z osobą techniczną w sprawie trwałego usunięcia.

---

## 10. Projekty (Projects)

Projekt to konkretne, aktywne zlecenie realizowane dla klienta (np. „Weryfikacja dostawcy — Gudżarat, sierpień 2026").

### 10.1 Lista projektów

Kolumny: **Project** (nazwa), **Status**, **Phase** (faza), **Priority**, **Service** (usługa), **Start** (data rozpoczęcia), **Due** (planowany termin zakończenia).

### 10.2 Statusy projektu

**Active** (w toku), **On Hold** (wstrzymany), **Completed** (zakończony), **Cancelled** (anulowany).

### 10.3 Fazy projektu

**Discovery** (rozpoznanie), **Proposal** (oferta), **Execution** (realizacja), **Delivery** (dostarczenie wyników), **Closed** (zamknięty).

### 10.4 Tworzenie projektu

1. Kliknij **„New project"** (lub **„Convert to project"** bezpośrednio ze szczegółów zapytania — patrz rozdział 16.4, to najwygodniejsza droga).
2. Wypełnij: nazwa projektu (wymagana), status, faza, priorytet, usługa (Service line), kierunek handlu, powiązana firma, osoba odpowiedzialna (Owner), osoba operacyjna (Operations), data rozpoczęcia, planowany termin zakończenia, opis.
3. Kliknij **„Create project"**.

### 10.5 Szczegóły projektu

Strona projektu pokazuje pełne dane, powiązaną firmę (klikalny link), listę **Zadań** przypisanych do tego projektu (z przyciskiem **„Add task"**, żeby dodać kolejne zadanie bezpośrednio dla tego projektu) oraz oś czasu z notatkami.

Edycja odbywa się w panelu po prawej stronie, tak samo jak w innych sekcjach.

---

## 11. Zadania (Tasks)

Zadanie to konkretna, pojedyncza czynność do wykonania (np. „Wysłać ofertę klientowi", „Zadzwonić w sprawie kontraktu").

### 11.1 Lista zadań

Kolumny: **Task** (tytuł), **Status**, **Priority**, **Linked to** (do czego przypisane — np. „Project"), **Due** (termin — podświetlony na czerwono, jeśli jest już przeterminowany).

### 11.2 Statusy zadania

**Open** (otwarte), **In Progress** (w trakcie realizacji), **Done** (wykonane), **Cancelled** (anulowane).

### 11.3 Tworzenie zadania

Są dwie drogi:

**Droga zalecana** — dodanie zadania bezpośrednio ze strony konkretnego projektu, klikając przycisk **„Add task"**. Wtedy pole „powiązanie" wypełnia się samo, prawidłowo, bez ryzyka pomyłki.

**Droga ogólna** — kliknięcie **„New task"** w głównej zakładce Zadania. W tym przypadku formularz zawiera dodatkowo dwa pola: **„Linked entity type"** (typ powiązanego rekordu — Lead / Company / Contact / Project) oraz **„Entity ID"**, w które trzeba ręcznie wpisać identyfikator (np. `PRJ-20260723...`).

> **Wskazówka:** Jeśli nie masz pewności co do dokładnego identyfikatora (Entity ID), zdecydowanie łatwiej i bezpieczniej jest dodać zadanie z poziomu strony danego projektu (droga zalecana powyżej), zamiast wpisywać identyfikator ręcznie. Zadanie nie musi być powiązane z niczym — pole to można też zostawić puste, wybierając „Not linked".

### 11.4 Edycja i zamykanie zadania

Wejdź w szczegóły zadania i w panelu po prawej stronie zmień status na **„Done"**, kiedy zadanie zostanie wykonane, a następnie kliknij **„Save"**.

---

## 12. Usługi (Services)

To zakładka, dzięki której **administrator może samodzielnie zarządzać listą usług widoczną w formularzu kontaktowym na stronie internetowej** — bez potrzeby kontaktowania się z programistą.

> **Dostępność:** Tylko role **Owner** i **Administrator** mogą tutaj cokolwiek zmieniać. Pozostałe role widzą listę, ale bez możliwości edycji.

### 12.1 Dodawanie nowej usługi

1. Przejdź do zakładki **Services**.
2. Na dole listy znajdują się dwa puste pola: **„English label"** (nazwa po angielsku) i **„Polish label"** (nazwa po polsku).
3. Wpisz nazwę usługi w obu językach.
4. Kliknij **„Add option"**.
5. Nowa usługa natychmiast pojawia się na liście — i automatycznie w formularzu na stronie internetowej.

> **Uwaga:** Nazwa angielska jest wymagana. Nazwę polską warto wypełnić zawsze — jeśli zostanie pusta, polscy odwiedzający zobaczą tekst angielski.

### 12.2 Edytowanie usługi

Przy każdej usłudze na liście znajdują się dwa pola tekstowe (angielska i polska nazwa). Zmień treść bezpośrednio w polu, a następnie kliknij przycisk **„Save"** obok tej pozycji (przycisk staje się aktywny dopiero, gdy coś rzeczywiście zmieniono).

### 12.3 Zmiana kolejności usług

Obok każdej pozycji znajdują się dwie małe strzałki — **w górę** i **w dół**. Kliknięcie strzałki przenosi daną usługę o jedną pozycję wyżej lub niżej. Kolejność na liście w CRM to dokładnie ta sama kolejność, w jakiej usługi pojawiają się w formularzu na stronie internetowej.

### 12.4 Usuwanie usługi

1. Kliknij czerwoną ikonę kosza przy danej usłudze.
2. Pojawi się okno z pytaniem: *„Usunąć [nazwa usługi]? Zniknie natychmiast z listy rozwijanej na stronie. Zapytania, które już wcześniej wybrały tę usługę, zachowują swoją pierwotną wartość — nic w ich danych się nie zmienia."*
3. Potwierdź, klikając **„Remove"**.

> **To usunięcie jest odwracalne w tym sensie, że nic z historycznych danych nie ginie** — usunięta usługa po prostu przestaje być proponowana nowym klientom. Stare zapytania, w których klient wybrał tę usługę, nadal poprawnie pokazują jej nazwę.

### 12.5 Jak szybko zmiany trafiają na stronę?

**Natychmiast.** Każda zmiana w Usługach (dodanie, edycja, usunięcie, zmiana kolejności) od razu aktualizuje listę, którą widzi kolejny odwiedzający stronę — nie trzeba niczego wgrywać, publikować ani czekać.

---

## 13. Zespół (Team)

Zakładka **Team** pokazuje wszystkie osoby mające dostęp do CRM, wraz z ich rolami i statusem (Active/Inactive).

### 13.1 Dodawanie nowego członka zespołu

> Dostępne tylko dla ról **Owner** i **Administrator**.

1. Kliknij **„Add member"**.
2. Wypełnij: **Imię i nazwisko**, **E-mail**, **Rolę** (lista dostępnych ról zależy od Twojej własnej roli — Administrator nie może np. utworzyć konta z rolą Owner) oraz **tymczasowe hasło**.
3. Kliknij **„Add team member"**.
4. Przekaż tę osobę (imię, e-mail i tymczasowe hasło) w bezpieczny sposób nowemu członkowi zespołu — np. osobiście lub telefonicznie, nie przez zwykłego e-maila w otwartym tekście.

### 13.2 Zmiana statusu osoby (aktywna / nieaktywna)

Na liście Zespołu, przy każdej osobie (jeśli masz odpowiednią rolę), możesz zmienić jej status na **Inactive**, jeśli dana osoba nie powinna już mieć dostępu do systemu (np. odeszła z firmy), i kliknąć **„Save"**.

### 13.3 Resetowanie hasła

Jak wspomniano w rozdziale 4, **resetowanie hasła nie odbywa się w samym CRM**. Wymaga to poproszenia osoby technicznej o uruchomienie krótkiej komendy bezpośrednio w Arkuszu Google. Nie da się tego zrobić samodzielnie z poziomu przeglądarki.

---

## 14. Ustawienia (Settings)

Ta zakładka jest **wyłącznie informacyjna** — nic tutaj się nie klika ani nie edytuje. Pokazuje:

- **Twoje konto**: imię, e-mail, rola.
- **Wartości odniesienia**: pełne listy dostępnych statusów, faz i ról używanych w systemie (przydatne jako „ściągawka").
- **Informacje systemowe**: jakiego rodzaju technologia stoi za systemem oraz numer wersji struktury danych (tzw. „schema version") — to informacja czysto techniczna, przydatna wyłącznie w rozmowie z osobą techniczną, gdyby kiedyś zaszła taka potrzeba.

---

## 15. Arkusz Google — co się w nim znajduje

Arkusz Google to plik w Google Sheets, w którym fizycznie przechowywane są wszystkie dane systemu. Można go otworzyć bezpośrednio (tak jak zwykły plik Excela w przeglądarce), żeby np. szybko przejrzeć dane albo zrobić własne zestawienie.

> **Podstawowa zasada bezpieczeństwa: CRM jest głównym narzędziem pracy na co dzień. Arkusz Google służy głównie do podglądu i do sytuacji awaryjnych.** Ręczna edycja danych bezpośrednio w Arkuszu jest możliwa, ale należy robić to bardzo ostrożnie — patrz uwagi przy każdej zakładce poniżej.

### 15.1 Lista zakładek (arkuszy) i ich przeznaczenie

| Nazwa zakładki | Co zawiera |
|---|---|
| **Leads** | Wszystkie zapytania ze strony internetowej — to jedyna zakładka, którą można edytować ręcznie bez ograniczeń. |
| **Companies** | Firmy. |
| **Contacts** | Osoby kontaktowe. |
| **Projects** | Projekty. |
| **Tasks** | Zadania. |
| **Notes** | Notatki dodane w CRM do dowolnego rekordu (Zapytania, Firmy, Kontaktu lub Projektu). |
| **Activities** | Automatyczny, niezmienny dziennik zdarzeń (np. „zmieniono status", „przyjęto zapytanie") — to historia systemu, nigdy nie jest z niej nic usuwane. |
| **Users** | Osoby mające dostęp do CRM — zawiera też dane techniczne (zaszyfrowane hasła), dlatego kolumny te są domyślnie ukryte w Arkuszu. |
| **Settings** | Lista usług (i innych wartości), zarządzana przez zakładkę Usługi w CRM. |
| **_Meta** | Czysto techniczna zakładka z numerem wersji systemu — nie dotyczy codziennej pracy. |
| **Dashboard** | Automatycznie liczone podsumowanie — patrz rozdział 15.4 poniżej. |
| **README** | Krótkie podsumowanie działania systemu (po angielsku, dla osób technicznych). |

### 15.2 Zakładka „Leads" — znaczenie kolumn

| Kolumna | Znaczenie | Czy edytować ręcznie? |
|---|---|:---:|
| Received | Data i godzina wpłynięcia zapytania. | **Nie** |
| Lead ID | Unikalny numer identyfikacyjny zapytania, tworzony automatycznie. | **Nie** |
| Status | Status zapytania (patrz rozdział 7.3). | Tak — ale wygodniej i bezpieczniej robić to w CRM. |
| Priority | Priorytet. | Tak (jak wyżej). |
| Owner | Osoba odpowiedzialna. | Tak (jak wyżej). |
| Next Action / Next Action Date | Planowana kolejna czynność i jej data. | Tak (jak wyżej). |
| Updated At | Data ostatniej zmiany rekordu. | **Nie** — ustawiane automatycznie. |
| First Name / Last Name / Full Name | Dane klienta. | Nie zaleca się. |
| Company / Email / Phone / Interest / Message | Dane z formularza. | Nie zaleca się. |
| Language / UTM Source / UTM Medium / UTM Campaign / UTM Term / UTM Content / Referrer / Page URL / Device / Browser / Operating System / Client Time / Timezone / IP Address / Country / City / Submission Date / Submission Time | Automatycznie zebrane dodatkowe informacje (patrz rozdział 7.5). | **Nie** |
| Notes | Notatki wewnętrzne. | Tak. |
| Created By / Updated By | Kto utworzył/ostatnio zmienił rekord (np. „website" dla zapytań ze strony). | **Nie** |
| Deleted At | Data usunięcia — jeśli wypełniona, ten wiersz jest traktowany jako usunięty i nie pojawia się w CRM. | **Nie** (patrz rozdział 17 — jak przywrócić przypadkowo usunięty wiersz). |
| Trade Direction / Company Id / Contact Id / Converted To Project Id / Converted At / Converted By | Powiązania z innymi zakładkami, tworzone automatycznie np. przy zamianie zapytania na projekt. | **Nie** |

> **Najważniejsza zasada tej tabeli:** kolumny z automatycznie generowanymi danymi (data, identyfikatory, metadane techniczne) **nigdy nie powinny być edytowane ręcznie** — mogłoby to zaburzyć poprawne działanie CRM i Pulpitu. Pola dotyczące bieżącej pracy (Status, Priority, Owner, Next Action, Notes) można edytować ręcznie w Arkuszu, ale zdecydowanie wygodniej i bezpieczniej jest robić to w CRM.

### 15.3 Pozostałe zakładki

Zakładki **Companies, Contacts, Projects, Tasks, Notes, Settings** działają na tej samej zasadzie: pierwsza kolumna to zawsze unikalny identyfikator generowany automatycznie (np. `CMP-...`, `PRJ-...`) — **nigdy nie edytuj tej kolumny ręcznie**. Kolumny takie jak `Created At`, `Created By`, `Updated At`, `Updated By` oraz `Deleted At` również są zarządzane automatycznie przez system i nie powinny być zmieniane ręcznie.

> **Wszystkie zakładki poza „Leads" powinny być chronione przed przypadkową ręczną edycją** (ustawienie ochrony arkuszy wykonuje osoba techniczna przy wdrożeniu systemu). Jeśli zauważysz, że dana zakładka daje się edytować bez ograniczeń, a nie powinna — zgłoś to osobie technicznej.

### 15.4 Zakładka „Dashboard" w Arkuszu

To osobny, automatycznie generowany widok bezpośrednio w Arkuszu Google (niezależny od Pulpitu w CRM, opisanego w rozdziale 6). Pokazuje:

- Podsumowanie liczbowe: łączna liczba zapytań, otwarte zapytania, wygrane, wysoki priorytet, nowe w tym miesiącu — oraz analogiczne podsumowanie dla Projektów i Zadań.
- Tabelę z liczbą zapytań w każdym statusie.
- Tabelę z liczbą zapytań dla każdej usługi (automatycznie dopasowuje się do aktualnej listy Usług z rozdziału 12 — jeśli dodasz nową usługę, ta tabela sama uzupełni się o nowy wiersz przy najbliższej aktualizacji systemu).

> **Ta zakładka liczy się sama, na podstawie wzorów (formuł)** wpisanych w komórki — nie trzeba (i nie należy) ręcznie wpisywać tam żadnych liczb. Jeśli kiedykolwiek zobaczysz w tej zakładce komunikat typu `#ERROR!` albo liczby, które wyglądają na nieaktualne/zamrożone, oznacza to problem techniczny do zgłoszenia (patrz rozdział 17).

---

## 16. Typowe sytuacje — instrukcje krok po kroku

### 16.1 Przyszło nowe zapytanie od klienta

1. Zaloguj się do CRM.
2. Wejdź w zakładkę **Leads**. Nowe zapytanie widoczne jest na samej górze listy (najnowsze na górze).
3. Kliknij w wiersz, aby zobaczyć pełne dane klienta i treść wiadomości.
4. Zdecyduj, czy priorytet ustawiony automatycznie jest odpowiedni — jeśli nie, zmień go w panelu po prawej.
5. Ustaw **Owner** (kto się tym zajmie) i **Next action** (np. „Zadzwonić", z datą).
6. Skontaktuj się z klientem, a następnie zmień **Status** na „Contacted".

### 16.2 Trzeba poprawić dane w zapytaniu

1. Wejdź w szczegóły zapytania (zakładka Leads → kliknięcie w wiersz).
2. W panelu **„CRM fields"** po prawej zmień potrzebne pole.
3. Kliknij **„Save changes"**.

### 16.3 Trzeba usunąć zapytanie (np. spam albo pomyłkowe zgłoszenie)

1. Wejdź w szczegóły zapytania.
2. Kliknij **„Delete"** w prawym górnym rogu.
3. Potwierdź w oknie dialogowym, klikając **„Delete lead"**.

*(Dostępne tylko dla ról Owner i Administrator — patrz rozdział 7.7.)*

### 16.4 Zapytanie przerodziło się w realny projekt

1. Wejdź w szczegóły zapytania.
2. Kliknij przycisk **„Convert to project"** (obok statusu, w górnej części strony).
3. Wypełnij formularz nowego projektu — pole `lead_id` (powiązanie z tym zapytaniem) wypełni się automatycznie.
4. Kliknij **„Create project"**.

### 16.5 Trzeba dodać zadanie do projektu

1. Wejdź w szczegóły danego projektu.
2. W sekcji **„Tasks"** kliknij **„Add task"**.
3. Wypełnij tytuł zadania, priorytet, osobę przypisaną i termin.
4. Kliknij **„Create task"**.

### 16.6 Zadanie zostało wykonane

1. Wejdź w szczegóły zadania (zakładka Tasks → kliknięcie w wiersz, lub bezpośrednio z listy zadań na stronie projektu).
2. Zmień **Status** na **„Done"**.
3. Kliknij **„Save"**.

### 16.7 Trzeba dodać nową usługę na stronę internetową

1. Wejdź w zakładkę **Services**.
2. Wpisz nazwę angielską i polską w polach na dole listy.
3. Kliknij **„Add option"**.
4. Gotowe — usługa jest już widoczna na stronie internetowej.

*(Dostępne tylko dla ról Owner i Administrator — patrz rozdział 12.)*

---

## 17. Rozwiązywanie problemów

| Problem | Prawdopodobna przyczyna | Co zrobić |
|---|---|---|
| **Nowe zapytanie nie pojawia się w CRM.** | Klient mógł nie ukończyć wysyłania formularza, albo chwilowy problem z połączeniem internetowym. | Odśwież stronę w CRM (klawisz F5 lub przycisk odświeżania przeglądarki). Sprawdź też bezpośrednio w Arkuszu Google, zakładka **Leads** — jeśli wiersza tam też nie ma, poproś klienta o ponowne wysłanie formularza. |
| **Liczby na Pulpicie wyglądają na nieprawidłowe.** | Dane mogły się jeszcze nie odświeżyć w przeglądarce (CRM chwilowo pokazuje zapisaną wcześniej wersję danych, żeby działać szybciej). | Odśwież stronę w przeglądarce. Jeśli to nie pomoże, sprawdź te same liczby bezpośrednio w zakładce **Dashboard** w Arkuszu Google — powinny się zgadzać. Jeśli nadal się nie zgadzają, zgłoś to osobie technicznej. |
| **W zakładce Dashboard w Arkuszu Google widać `#ERROR!`.** | To sygnał problemu technicznego z formułami arkusza. | Zrób zrzut ekranu (screenshot) i zgłoś to osobie technicznej wraz z opisem, w której dokładnie komórce widać błąd. Nie próbuj samodzielnie poprawiać formuł w tej zakładce. |
| **Zapytanie „zniknęło" z listy.** | Ktoś (przypadkowo lub celowo) je usunął — patrz rozdział 7.7 i 17 („Przypadkowo coś usunąłem/am"). Może być też odfiltrowane przez aktywny filtr statusu/priorytetu. | Sprawdź, czy nie masz aktywnego filtra (przycisk „Clear" widoczny nad tabelą, jeśli filtr jest włączony). Jeśli filtrów nie ma, sprawdź w Arkuszu Google, w kolumnie „Deleted At" — jeśli jest tam wypełniona data, zapytanie zostało usunięte (patrz niżej, jak to cofnąć). |
| **Otrzymuję komunikat błędu przy wypełnianiu formularza na stronie.** | Patrz pełna tabela komunikatów w rozdziale 3.4 — każdy komunikat ma tam dokładnie opisaną przyczynę i rozwiązanie. | — |
| **Strona/CRM wygląda „staro" albo brakuje nowo dodanej usługi mimo dodania jej w zakładce Services.** | Przeglądarka mogła zapisać starszą wersję strony w tzw. pamięci podręcznej (**cache** — to mechanizm przeglądarki, który zapamiętuje stronę, żeby ładowała się szybciej przy kolejnych wizytach). | Odśwież stronę „na twardo": na Windows/Linux `Ctrl + Shift + R`, na Mac `Cmd + Shift + R`. Jeśli to nie pomoże, spróbuj otworzyć stronę w oknie prywatnym/incognito przeglądarki. |
| **Przypadkowo usunąłem/am zapytanie.** | — | Usunięcie zapytania w CRM jest **odwracalne**. Poproś osobę techniczną o przywrócenie — polega to na wyczyszczeniu wartości w kolumnie **„Deleted At"** dla właściwego wiersza w zakładce Leads w Arkuszu Google. Sam wiersz nigdy nie jest fizycznie kasowany, więc dane nie giną. |
| **Nie pamiętam hasła do CRM.** | — | Patrz rozdział 4 — poproś administratora/osobę techniczną o zresetowanie hasła. Nie da się tego zrobić samodzielnie. |
| **Widzę błąd „Authentication required" albo zostałem/am wylogowany/a bez powodu.** | Sesja logowania wygasła (dla bezpieczeństwa, sesja w CRM jest ważna przez 24 godziny od ostatniej aktywności). | Zaloguj się ponownie — Twoje dane nie zostały nigdzie utracone. |
| **W CRM widzę komunikat, że backend/Apps Script jest niedostępny.** | Chwilowa przerwa w połączeniu między CRM a Arkuszem Google. | Odczekaj chwilę i odśwież stronę. Jeśli problem trwa dłużej niż kilka minut, zgłoś to osobie technicznej. |

---

## 18. Dobre praktyki na co dzień

### Rób tak:

- **Aktualizuj status zapytania od razu po każdym kontakcie z klientem** — dzięki temu Pulpit i inne osoby w zespole zawsze widzą aktualny stan sprawy.
- **Ustawiaj „Next action" i jego datę** dla każdego aktywnego zapytania — to najprostszy sposób, żeby nic nie „wypadło" z pamięci.
- **Korzystaj z notatek (Notes)** zamiast zapamiętywać ważne ustalenia „w głowie" — inne osoby w zespole też muszą mieć do nich dostęp.
- **Dodawaj zadania bezpośrednio z poziomu projektu** (przycisk „Add task" na stronie projektu), zamiast wpisywać identyfikatory ręcznie w ogólnym formularzu zadań.
- **Traktuj status „Inactive"/„Cancelled" jako odpowiednik archiwizacji** dla Firm, Kontaktów i Projektów, które nie są już aktualne, skoro nie ma dla nich przycisku usuwania w CRM.
- **Regularnie zaglądaj na Pulpit** — to najszybszy sposób, żeby zauważyć np. rosnącą liczbę przeterminowanych zadań.

### Nie rób tak:

- **Nie edytuj ręcznie w Arkuszu Google kolumn oznaczonych jako „Nie"** w tabelach z rozdziału 15 — mogą one zaburzyć poprawne działanie CRM oraz Pulpitu.
- **Nie usuwaj ręcznie wierszy z Arkusza Google.** Jeśli coś trzeba usunąć, rób to przez przycisk w CRM (obecnie dostępny dla Zapytań) — to jedyna metoda, która jest bezpieczna i odwracalna.
- **Nie zmieniaj kolejności kolumn ani nazw zakładek w Arkuszu Google.** CRM „wie", gdzie szukać danych, na podstawie ich dokładnego położenia — zmiana układu może zepsuć całą synchronizację.
- **Nie udostępniaj hasła do CRM innym osobom.** Jeśli ktoś nowy dołącza do zespołu, dodaj dla niego osobne konto (rozdział 13.1) zamiast dzielić się swoim.
- **Nie próbuj samodzielnie poprawiać formuł w zakładce Dashboard w Arkuszu.** W razie błędu zgłoś to od razu osobie technicznej.

---

## 19. Słowniczek pojęć

| Termin | Wyjaśnienie |
|---|---|
| **CRM** | *Customer Relationship Management* — system do zarządzania relacjami z klientami. W tym dokumencie: wewnętrzna aplikacja internetowa, w której zespół Valeris pracuje na co dzień z zapytaniami, projektami i zadaniami. |
| **Arkusz Google / Google Sheets** | Internetowy odpowiednik arkusza kalkulacyjnego (jak Excel), w którym fizycznie zapisane są wszystkie dane systemu. |
| **Wiersz / kolumna** | Podstawowe pojęcia arkusza kalkulacyjnego — wiersz to jeden rekord (np. jedno zapytanie), kolumna to jedna cecha tego rekordu (np. „E-mail"). |
| **Zakładka (arkusza)** | Jedna „strona" w pliku Arkusza Google — widoczna jako karta na dole ekranu, np. „Leads", „Companies". |
| **Status** | Etykieta pokazująca, na jakim etapie znajduje się dany rekord (np. zapytanie w statusie „Contacted"). |
| **Priorytet** | Oznaczenie ważności/pilności danego rekordu: Wysoki, Średni, Niski. |
| **Filtr** | Narzędzie zawężające widoczną listę do rekordów spełniających określony warunek (np. tylko status „New"). |
| **Sortowanie** | Ustawianie kolejności wierszy w tabeli według wybranej kolumny (np. od najnowszych do najstarszych). |
| **Identyfikator (ID)** | Unikalny „numer seryjny" nadawany automatycznie każdemu rekordowi w systemie (np. `VAL-20260723...` dla zapytania) — nigdy nie trzeba go samodzielnie wymyślać ani wpisywać. |
| **Metadane** | Dodatkowe informacje zbierane automatycznie „przy okazji" głównych danych — np. z jakiego kraju, urządzenia czy przeglądarki przyszło zapytanie. |
| **Adres IP** | Unikalny numer identyfikujący urządzenie/połączenie internetowe odwiedzającego stronę — pozwala w przybliżeniu ustalić kraj i miasto, z którego ktoś korzysta ze strony. |
| **UTM (parametry UTM)** | Specjalne oznaczenia dodawane do linku w kampaniach reklamowych (np. w reklamie na Facebooku), które pozwalają rozpoznać, z jakiego źródła przyszedł dany klient. |
| **Synchronizacja** | Proces, w którym zmiana wprowadzona w jednym miejscu (np. w CRM) automatycznie pojawia się w drugim (Arkusz Google) — w tym systemie odbywa się to natychmiastowo i automatycznie, bez potrzeby klikania czegokolwiek dodatkowego. |
| **Cache (pamięć podręczna)** | Mechanizm przeglądarki internetowej, który zapamiętuje odwiedzoną stronę, żeby ładowała się szybciej przy kolejnej wizycie. Czasem powoduje to, że widzimy „starszą" wersję strony — rozwiązanie opisano w rozdziale 17. |
| **Sesja (logowania)** | Okres, przez jaki pozostajesz zalogowany/a w CRM bez potrzeby ponownego wpisywania hasła — w tym systemie trwa do 24 godzin od ostatniej aktywności. |
| **Formularz** | Zestaw pól do wypełnienia (np. formularz kontaktowy na stronie albo formularz dodawania nowej firmy w CRM). |
| **Backend / Apps Script** | Techniczne „zaplecze" systemu, które faktycznie zapisuje dane do Arkusza Google i obsługuje logowanie — działa w tle, niewidoczne dla użytkownika, wspominane w tym dokumencie tylko tam, gdzie może być potrzebny kontakt z osobą techniczną. |

---

> **Ta instrukcja opisuje system dokładnie w takim kształcie, w jakim został on wdrożony.** Jeśli w przyszłości pojawią się nowe funkcje (np. możliwość usuwania Firm bezpośrednio w CRM), instrukcję należy wtedy zaktualizować, aby nadal odpowiadała rzeczywistemu działaniu systemu.
