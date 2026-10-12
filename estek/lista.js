// Vacsoraestek listája – a sorrend = a megjelenés sorrendje.
// Minden esthez tartozik egy estek/<id>.js adatfájl; kep: opcionális borítókép az estek/ mappában (640×800).
// tervezes: true → a kártya „Tervezés alatt” jelzéssel látszik, de nem nyitható meg (nincs hozzá adatfájl).
window.ESTEK = [
  { id: "az-egyszeru-tokeletesseg", cim: "Az egyszerű tökéletesség", jelleg: "Vendégvárás", meta: "4 fő · vacsora 19:00", leiras: "Paradicsom carpaccio burratával, pirozskí, rántott csirke újburgonyával és baszk sajttorta.", allapot: "" },
  { id: "burgundi-melyseg", cim: "Burgundi mélység", jelleg: "Vacsoraest", meta: "4 fő", leiras: "A csúcs este — bœuf bourguignon, mély és elegáns.", allapot: "" },
  { id: "selyem-es-buborek", cim: "Selyem és buborék", jelleg: "Vacsoraest", meta: "4 fő", leiras: "Könnyedebb elegancia — paccheri carbonara, baszk sajttorta.", allapot: "" },
  { id: "parizsi-bisztro", cim: "Párizsi bisztró", jelleg: "Vacsoraest", meta: "4 fő · vacsora 19:00", leiras: "Hagymaleves, steak chimichurrivel, selymes burgonyapüré.", allapot: "" },
  { id: "szulinapi-borkostolo", cim: "Bubbles & Bites", jelleg: "Szülinapi borkóstoló", meta: "~9 fő · 4 bor", leiras: "Kreinbacher, Cloudy Bay, Pauillac és Deutz – falatok minden pohárhoz.", allapot: "Tervezés alatt" },
  { id: "halaadas", cim: "Hálaadás", jelleg: "Vacsoraest", meta: "", leiras: "", tervezes: true }
];
