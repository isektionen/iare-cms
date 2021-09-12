# Collection type

## Vad är en collection type?

I enkla termer är det en samling av entiteter som delar samma attribut. Collections är en grundpelare i INTRA. Utan dem skulle inte kopplingen mellan databas och hemsida (frontend) existera.

Medlemmar i **Webgruppen** har access att redigera, skapa och ta bort collection types, vilket görs med verktyget `Content-Types Builder`, som är synligt i vänstra sidebaren. **DETTA SKALL EJ GÖRAS I LIVE MILJÖ**, utan endast på lokal testmiljö, som ni har tillgång till genom `github`

Genom att skapa en ny collection type, så skapar man även en `REST-Endpoint`, som går att accessa på `https://cms.iare.se/{MY-COLLECTION}`, där "MY-COLLECTION" är namnet på den collection som ni skapat.

Default permission är att den inte är publik (vem som helst kan använda Endpointen), utan detta måste man manuellt justera i efterhand genom att kontakta Webmaster.

## Olika förklaringar

### Vad är slug? Behöver jag slug?

En slug är vad man kallar en mening utan mellanrum. Oftast har dem bytts bort mot bindesträck `-` för att göra en länk läsbar och "URL-safe". Denna genereras automatiskt utifrån titeln som ni ger ert inlägg, men om ni verkligen vill ha en speciell **slug**, så kan ni också redigera den.

### Vad är internationalization? Behöver jag det?

Internationaliseing innebär att informationen finns på flera språk. INTRA är som default satt till Svenska, men tillåter även Engelska som andra språk. Denna översättningen sker inte automatiskt, utan är något man måste manuellt göra!

Om du för någon anledning väljer att inte skriva en engelsk version så kommer det att synas på hemsidan (frontenden) genom en varningskylt högst upp på sidan.

!["Bild som visar vad som sker när man inte har alla internationaliseringar"](/documentation/media/i18n/warning.png)

Där ni kan se att viss information fortfarande är på Svenska.

Du populerar en ny `internationalization` genom att klicka på valmenyn som heter `locales` och väljer den som saknas.

!["Bild som visar hur man lägger till språk"](/documentation/media/i18n/create.png)

Därefter kan du sedan lägga till informationen på det nya språket, alternativt populera ifrån tidigare språk genom att klicka på knappen `Fill in from another locale`.

Glöm inte att **publicera** den nya översättningen, annars kommer den inte att reflekteras på hemsidan!

## Hur skapar jag ett nytt inlägg?

Beroende på dina permissions, så kommer du endast se **collection-types** som berör din funktionspost. Vill du få access till mer? Kontakta webgruppen alternativt Webmaster.

**Viktigt att tänka på!**

Du behöver klicka på den blåa `publish` knappen för att ditt inlägg skall synas på webben. Får du inte publicera? Kontakta din ordförande och be hen publicera ert inlägg.

Dessa **collection-types** går det att göra inlägg på som sedan publiceras på hemsidan:

### Posts - allmäna blogginlägg

Dessa attribut behöver fyllas in:

- title
- description
- body
- committee (vilken nämnd som publicerar)
- categories - kategorier som du anser att inlägget kretsar runt.

#### Saknas din bloggkategori?

Du kan enkelt skapa en ny kategori genom att göra det inuti `Post Category` **collection-typen**

### Jobs - jobbannonser

Dessa attribut behöver fyllas in:

- title
- deadlinedate - Stängningstiden för annonsen
- startdate - datumet då arbetet börjar
- year - vilka årsgångar som berörs
- contact - de olika kontaktkanaler som företagen vill använda.
- position - vilken position det berör om
- location - i vilken stad det berör om. Även digitalt fungerar
- description
- body
- jobcategory - vilken typ av anställning det är
- company - vilket företag det handlar om

#### Saknas din jobbkategori eller ditt företag?

Du kan enkelt skapa en ny kategori genom att göra det inuti `Job Category` **collection-typen**

När det kommer till företag, så skapas dem genom att göra det inuti `Companies` - Kan du inte se den? Kontakta NLN, din ordförande eller webgruppen.

### Events - sektions- och företagsevent

Dessa attribut behöver fyllas in:

- title
- tickets
  - price
  - swedishname
  - englishname
- servingoptions
  - servingfood
  - servingalcohol
- starttime - datumet för då eventet start
- endtime - datumet för då eventet slutar
- deadline - datumet för då OSAN stänger
- place
  - name
- description
- body
- committee
- category

!["Bild som visar hur man kategoriserar event till företagsevent"](/documentation/media/event/kategorisering.png)

På bilden ovan syns det hur man kategoriserar event till att vara företagsevent, vanliga event, lunchföreläsningar med mera.

!["Bild som visar hur man väljer att begära specialkost"](/documentation/media/event/mat.png)

Ska ert event servera mat, så är det **viktigt** att ni bockar in att ni faktiskt gör det. Eftersom det är **direkt** kopplat till om hemsidan kommer visa specialkost eller inte när gästerna OSAR.

Detta gäller för tillfället inte för alkohol, utan detta reguleras genom olika biljetter. Utan denna är mest för dokumentation för sektionens vägnar.

Behöver ni ha ert event **lösenordsskyddat?** Då klickar ni på plusset och lägger till ett lösenord.

!["Bild som visar hur man väljer att begära lösenord"](/documentation/media/event/password.png)

#### Saknas din eventkategori?

Du kan enkelt skapa en ny kategori genom att göra det inuti `Event Category` **collection-typen**

#### Saknas din nämnd?

Tråkigt! Kontakta webgruppen eller webmaster, så åtgärdas det!
    