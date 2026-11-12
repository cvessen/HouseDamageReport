var MoonenLocations = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/lib/locations.ts
  var locations_exports = {};
  __export(locations_exports, {
    BVZ_LOCATIES: () => BVZ_LOCATIES,
    CATEGORIEEN: () => CATEGORIEEN,
    COUNTRIES: () => COUNTRIES,
    KANTOORLOCATIES: () => KANTOORLOCATIES,
    WOONLOCATIES: () => WOONLOCATIES
  });
  var COUNTRIES = ["Belgi\xEB", "Nederland", "Duitsland"];
  var WOONLOCATIES = {
    "Duitsland": ["Nordhorn | Denekamperstrasse 219", "Nordhorn | Denekamperstrasse 221"],
    "Belgi\xEB": [
      "Aalst | Esplanadastraat 32",
      "Antwerpen | Venneborglaan 95",
      "Antwerpen | Rector Vermeylenlaan 30 bus 1",
      "Antwerpen | St Bernardsesteenweg 534",
      "Bocholt | Kreyelerstraat 7a",
      "Bree | Toekomststraat 10",
      "Bree | Kloosterstraat 12",
      "Elverdinge | d'Ennetieresplein 11",
      "Elverdinge | d'Ennetieresplein 9",
      "Kinrooi | Breeersteenweg 262",
      "Kinrooi | Breeersteenweg 323",
      "Kinrooi | Dorpsplein 6A",
      "Kinrooi | Hunselerstraat 2",
      "Kinrooi | Vlasbrei 21",
      "Kinrooi | Smeetsstraat 81",
      "Maaseik | Diestersteenweg 122",
      "Maasmechelen | Mie Merkenstraat 4",
      "Maasmechelen | Talderstraat 41 a bus 7",
      "Morkhoven | Molenstraat 26-001",
      "Morkhoven | Molenstraat 26-002",
      "Morkhoven | Molenstraat 26-101",
      "Morkhoven | Molenstraat 26-102",
      "Morkhoven | Molenstraat 26-201",
      "Poperinge | Casselstraat 78B",
      "Poperinge | Casselstraat 16 bus 101",
      "Poperinge | Keer van de Ommegang 1",
      "Proven | Obterrestraat 59",
      "Westvleteren | Westvleterendorp 54",
      "Westerlo | Mechelsestraat 1 bus A",
      "Westerlo | Mechelsestraat 1 bus C",
      "Westerlo | Mechelsestraat 1 bus D",
      "Westerlo | Strateneinde 12",
      "Wijtschate | Ieperstraat 180"
    ],
    "Nederland": [
      "Almelo | Goossenmaatseweg 10A",
      "Boskoop | Burg Colijnstraat 41",
      "Boskoop | Burg Colijnstraat 41a",
      "Beringe | Haambergweg 11",
      "Denekamp | Nordhornsestraat 232A",
      "Denekamp | Nordhornsestraat 232B",
      "Denekamp | Nordhornsestraat 234",
      "Enschede | Tolstraat 4",
      "Erm | Steenbakkersweg 3",
      "Geesbrug | Verlengde Hoogeveensevaart 130",
      "Goor | Breukersweg 3",
      "Gouda | Graaf van Bloisstr 101",
      "Gouda | Johannes Poststraat 84",
      "Hengelo | Castorweg 350",
      "Haler | Isidoorstraat 25",
      "Heythuysen | Aan t Broek 6",
      "Heythuysen | Aan t Broek 6a Achterhuis",
      "Heythuysen | Aan t Broek 8",
      "Liessel | Kanaalstraat 13",
      "Lochem | Achterstraat 7",
      "Lochem | Achterstraat 9",
      "Lochem | Achterstraat 11",
      "Leveroy | Houtsberg 23",
      "Neerkant | R. Heitraksedijk 7",
      "Ospel | Onze Lieve Vrouwenstraat 48",
      "Ospel | Onze Lieve Vrouwenstraat 50",
      "Ospel | Onze Lieve Vrouwenstraat 52",
      "Papendrecht | Veerweg 173",
      "Rheden | Arnhemseweg 12",
      "Schiedam | Stationsstraat 11",
      "Someren | Bennenbroekstraat 48",
      "Someren | Kerkweg 35",
      "Stramproy | Julianastraat 26",
      "Stramproy | Pastoor Greymansstraat 1",
      "Venlo | Vliegenkampstraat 50",
      "Weert | Maaspoort 8",
      "Weert | Maaspoort 10",
      "Weert | Maaspoort 12 - 12A",
      "Zoeterwoude | Hoge Rijndijk 103A"
    ]
  };
  var KANTOORLOCATIES = [
    "Amentstraat 17",
    "Amentstraat 15",
    "Savelveld 5 (PrismaWorx & IPS)",
    "Savelveld 5 (GreenStay)",
    "Cambrai",
    "Saint-Remy-sur-Bussy"
  ];
  var BVZ_LOCATIES = ["Terrein aan Molenweg", "Terrein aan Isidoorstraat", "Andere"];
  var CATEGORIEEN = [
    "Verlichting & Elektra",
    "Sanitair & Water",
    "Verwarming, koeling & ventilatie",
    "Meubilair & inrichting",
    "Schoonmaak & afval",
    "Koffie, keuken & pantry",
    "Kantoorbenodigdheden",
    "Toegang & beveiliging",
    "Gebouw & onderhoud",
    "Parkeren & buitenterrein",
    "Veiligheid",
    "Werkplekvoorzieningen (niet IT-gerelateerd)",
    "Andere"
  ];
  return __toCommonJS(locations_exports);
})();
