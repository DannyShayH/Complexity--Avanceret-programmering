# PriorityQueue og ArrayDeque

## Facit

| Struktur | Sætte ind | Tage ud |
|---|---|---|
| PriorityQueue | O(log n) | O(log n) |
| ArrayDeque som kø | Amortiseret O(1) | Amortiseret O(1) |
| ArrayDeque som stak | Amortiseret O(1) | Amortiseret O(1) |

Her betyder **tage ud** den normale operation, som tager det næste element:

- `poll()` fra en `PriorityQueue` eller en kø.
- `pop()` fra en stak.

Det er ikke det samme som `remove(Object)`, der leder efter et bestemt objekt.

## Hvilket element tager vi ud?

### PriorityQueue

En `PriorityQueue` tager elementet med den højeste prioritet ud.

Som standard betyder det det mindste element. Hvis køen for eksempel indeholder
talværdierne 8, 2 og 5, bliver 2 taget ud først. Rækkefølgen bestemmes af
elementernes naturlige sortering eller af en `Comparator`.

### ArrayDeque som kø

En kø bruger **FIFO**: *First In, First Out*.

Det element, der blev sat ind først, bliver også taget ud først. Det svarer til
en almindelig kø i et supermarked.

### ArrayDeque som stak

En stak bruger **LIFO**: *Last In, First Out*.

Det element, der blev sat ind sidst, bliver taget ud først. Det svarer til en
stak tallerkener, hvor man tager den øverste tallerken først.

## Hvorfor er PriorityQueue O(log n)?

En `PriorityQueue` er bygget som en **heap**.

Når et element sættes ind, kan det være nødvendigt at flytte elementet op gennem
heapen, indtil det står det rigtige sted.

Når det vigtigste element tages ud, skal et andet element flyttes til toppen.
Derefter kan det være nødvendigt at flytte dette element ned gennem heapen.

Heapens højde er cirka log n. Derfor tager både indsættelse og udtagning
O(log n) tid.

## Hvorfor er ArrayDeque amortiseret O(1)?

En `ArrayDeque` gemmer elementerne i et array. Den holder styr på starten og
slutningen af samlingen.

Ved normal indsættelse eller udtagning skal den kun:

- Læse eller skrive ét sted i arrayet.
- Flytte et indeks til den næste plads.

Det tager O(1) tid.

Nogle gange bliver arrayet fyldt. Så skal `ArrayDeque` oprette et større array
og kopiere elementerne. Denne ene operation tager længere tid.

Det sker dog kun en gang imellem. Fordelt over mange operationer er tiden stadig
O(1) pr. operation. Det er betydningen af **amortiseret O(1)**.

## Hvorfor er de forskellige, når begge er køer?

En `ArrayDeque` som kø skal kun huske, hvem der kom først. Den behøver ikke
sortere elementerne.

En `PriorityQueue` er ikke en almindelig FIFO-kø. Den skal hele tiden sørge for,
at elementet med den rigtige prioritet står klar til at blive taget ud. Det
kræver ekstra arbejde i heapen, og derfor er kompleksiteten O(log n) i stedet
for amortiseret O(1).

## Kort huskeregel

- **PriorityQueue:** Prioritet bestemmer rækkefølgen → O(log n).
- **Kø:** Først ind, først ud → amortiseret O(1).
- **Stak:** Sidst ind, først ud → amortiseret O(1).

## Officiel Java-dokumentation

- [PriorityQueue – Java SE 25](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/PriorityQueue.html)
- [ArrayDeque – Java SE 25](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/ArrayDeque.html)
