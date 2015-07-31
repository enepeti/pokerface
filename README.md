## Funkciók

- Websocket kommunikáció a frontend és a backend között.

- 6 user nyit 1-1 connectiont, ezeket a backend fenntartja végig, max kiesésnél dropolhatja
- +1 user admin jogokkal indul, csak az időzítést intézi, elindítja a feladatok kiadását és tud játékost törölni (gomb vagy kiesés alapján)
- Ez két külön gomb.

- A feladatok adatbázisban vannak, leírás - válaszok - jó válasz - pontszám?

- Admin indításra backend leküldi a feladatokat minden connectionnek (beleértve az admint is), majd x másodpercen belül várja a választ.
- Ha megérkezik, perzisztálja a választ, és elküldi az adminnak az összestést, ha nem akkor perzisztálja a timeoutot.

- A kliensek connection nyitás után elküldenek egy nevet, amivel az admin tud rájuk hivatkozni később.

- A kérdéseket és a válaszokat véletlenszerű sorrendbe rendezi egy mongo script, mielőtt elkezdődne a játék

### Kérdéses funkciók

- Ha több azonos név van, akkor esetleg a backend visszautasíthatja a másodikat, és akkor újat kell küldenie

- Kijelző: A játékosok neveit, jelenlegi pontszámukat lehet megnézni, mondjuk a kör végén, szintén külön jogosultságos connection, nincs kliens-szerver forgalom, csak adatot értelmez

## API

#### Kliens - Szerver
- Saját neve `'username' - String`
- Válasz `'answer' - String`

#### Szerver - Kliens
- Kérdés `'question' - {question: String, answers: [String]}`
- Helyes válasz-e `'correct' - String`
- Hány helyese volt `'score' - Number`

#### Admin - Szerver
- Admin jelszó `'admin' - String`
- Új kérdés `'new' - Undefined`
- Játékos elvetése `'drop' - String`
- Utolsó játékos automatikus elvetése `'autodrop' - Undefined`
- Új játék `'gameover' - Undefined`

#### Szerver - Admin
- Kérdés `'question' - {question: String, answers: [String]}`
- Helyes válasz `'correct' - String`
- Játékosok nevei `players - [String]`
- Kinek mennyi pontja lett `'tables' - [{name: String, score: Number}]`