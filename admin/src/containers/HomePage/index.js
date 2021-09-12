/*
 *
 * HomePage
 *
 */
/* eslint-disable */
import React, { memo, useMemo } from "react";
import { FormattedMessage } from "react-intl";
import { get, upperFirst } from "lodash";
import { auth, LoadingIndicatorPage } from "strapi-helper-plugin";
import PageTitle from "../../components/PageTitle";
import { useModels } from "../../hooks";
import styled from "styled-components";

import useFetch from "./hooks";
import {
  ALink,
  Block,
  Container,
  LinkWrapper,
  P,
  Wave,
  Separator,
} from "./components";

const Code = styled.code`
  background-color: #007bff;
  border-radius: 3px;
  padding-top: 2px;
  padding-bottom: 2px;
  padding-right: 6px;
  padding-left: 6px;
  font-weight: bold;
  color: white;
`;

const HomePage = ({ history: { push } }) => {
  const { error, isLoading, posts } = useFetch();
  // Temporary until we develop the menu API
  const {
    collectionTypes,
    singleTypes,
    isLoading: isLoadingForModels,
  } = useModels();

  const handleClick = (e) => {
    e.preventDefault();

    push(
      "/plugins/content-type-builder/content-types/plugins::users-permissions.user?modalType=contentType&kind=collectionType&actionType=create&settingType=base&forTarget=contentType&headerId=content-type-builder.modalForm.contentType.header-create&header_icon_isCustom_1=false&header_icon_name_1=contentType&header_label_1=null"
    );
  };

  const hasAlreadyCreatedContentTypes = useMemo(() => {
    const filterContentTypes = (contentTypes) =>
      contentTypes.filter((c) => c.isDisplayed);

    return (
      filterContentTypes(collectionTypes).length > 1 ||
      filterContentTypes(singleTypes).length > 0
    );
  }, [collectionTypes, singleTypes]);

  if (isLoadingForModels) {
    return <LoadingIndicatorPage />;
  }

  const headerId = hasAlreadyCreatedContentTypes
    ? "HomePage.greetings"
    : "app.components.HomePage.welcome";
  const username = get(auth.getUserInfo(), "firstname", "");
  const linkProps = hasAlreadyCreatedContentTypes
    ? {
        id: "app.components.HomePage.button.blog",
        href: "https://strapi.io/blog/",
        onClick: () => {},
        type: "blog",
        target: "_blank",
      }
    : {
        id: "app.components.HomePage.create",
        href: "",
        onClick: handleClick,
        type: "documentation",
      };

  return (
    <>
      <FormattedMessage id="HomePage.helmet.title">
        {(title) => <PageTitle title={title} />}
      </FormattedMessage>
      <Container className="container-fluid">
        <div className="row">
          <div className="col-lg-8 col-md-12">
            <Block>
              <Wave />
              <FormattedMessage
                id={headerId}
                values={{
                  name: upperFirst(username),
                }}
              >
                {(msg) => <h2 id="mainHeader">{msg}</h2>}
              </FormattedMessage>
              <P>
                Här kommer det finnas guides i framtiden till hur man navigera
                sig genom CMSen
              </P>
            </Block>
            <Block>
              <h1 id="collection-type">Collection type</h1>
              <h2 id="vad-r-en-collection-type-">Vad är en collection type?</h2>
              <P>
                I enkla termer är det en samling av entiteter som delar samma
                attribut. Collections är en grundpelare i INTRA. Utan dem skulle
                inte kopplingen mellan databas och hemsida (frontend) existera.
              </P>
              <P>
                Medlemmar i <strong>Webgruppen</strong> har access att redigera,
                skapa och ta bort collection types, vilket görs med verktyget{" "}
                <Code>Content-Types Builder</Code>, som är synligt i vänstra
                sidebaren. <strong>DETTA SKALL EJ GÖRAS I LIVE MILJÖ</strong>,
                utan endast på lokal testmiljö, som ni har tillgång till genom{" "}
                <Code>github</Code>
              </P>
              <P>
                Genom att skapa en ny collection type, så skapar man även en{" "}
                <Code>REST-Endpoint</Code>, som går att accessa på{" "}
                <Code>https://cms.iare.se/[MY - COLLECTION]</Code>, där
                &quot;MY-COLLECTION&quot; är namnet på den collection som ni
                skapat.
              </P>
              <P>
                Default permission är att den inte är publik (vem som helst kan
                använda Endpointen), utan detta måste man manuellt justera i
                efterhand genom att kontakta Webmaster.
              </P>
              <h2 id="olika-f-rklaringar">Olika förklaringar</h2>
              <h3 id="vad-r-slug-beh-ver-jag-slug-">
                Vad är slug? Behöver jag slug?
              </h3>
              <P>
                En slug är vad man kallar en mening utan mellanrum. Oftast har
                dem bytts bort mot bindesträck <Code>-</Code> för att göra en
                länk läsbar och &quot;URL-safe&quot;. Denna genereras
                automatiskt utifrån titeln som ni ger ert inlägg, men om ni
                verkligen vill ha en speciell <strong>slug</strong>, så kan ni
                också redigera den.
              </P>
              <h3 id="vad-r-internationalization-beh-ver-jag-det-">
                Vad är internationalization? Behöver jag det?
              </h3>
              <P>
                Internationaliseing innebär att informationen finns på flera
                språk. INTRA är som default satt till Svenska, men tillåter även
                Engelska som andra språk. Denna översättningen sker inte
                automatiskt, utan är något man måste manuellt göra!
              </P>
              <P>
                Om du för någon anledning väljer att inte skriva en engelsk
                version så kommer det att synas på hemsidan (frontenden) genom
                en varningskylt högst upp på sidan.
              </P>
              <P>
                <img
                  src="/documentation/media/i18n/warning.png"
                  width="550px"
                  alt='"Bild som visar vad som sker när man inte har alla internationaliseringar"'
                />
              </P>
              <P>
                Där ni kan se att viss information fortfarande är på Svenska.
              </P>
              <P>
                Du populerar en ny <Code>internationalization</Code> genom att
                klicka på valmenyn som heter <Code>locales</Code> och väljer den
                som saknas.
              </P>
              <P>
                <img
                  src="/documentation/media/i18n/create.png"
                  width="550px"
                  alt='"Bild som visar hur man lägger till språk"'
                />
              </P>
              <P>
                Därefter kan du sedan lägga till informationen på det nya
                språket, alternativt populera ifrån tidigare språk genom att
                klicka på knappen <Code>Fill in from another locale</Code>.
              </P>
              <P>
                Glöm inte att <strong>publicera</strong> den nya översättningen,
                annars kommer den inte att reflekteras på hemsidan!
              </P>
              <h2 id="hur-skapar-jag-ett-nytt-inl-gg-">
                Hur skapar jag ett nytt inlägg?
              </h2>
              <P>
                Beroende på dina permissions, så kommer du endast se{" "}
                <strong>collection-types</strong> som berör din funktionspost.
                Vill du få access till mer? Kontakta webgruppen alternativt
                Webmaster.
              </P>
              <P>
                <strong>Viktigt att tänka på!</strong>
              </P>
              <P>
                Du behöver klicka på den blåa <Code>publish</Code> knappen för
                att ditt inlägg skall synas på webben. Får du inte publicera?
                Kontakta din ordförande och be hen publicera ert inlägg.
              </P>
              <P>
                Dessa <strong>collection-types</strong> går det att göra inlägg
                på som sedan publiceras på hemsidan:
              </P>
              <h3 id="posts-allm-na-blogginl-gg">
                Posts - allmäna blogginlägg
              </h3>
              <P>Dessa attribut behöver fyllas in:</P>
              <ul>
                <li>title</li>
                <li>description</li>
                <li>body</li>
                <li>committee (vilken nämnd som publicerar)</li>
                <li>
                  categories - kategorier som du anser att inlägget kretsar
                  runt.
                </li>
              </ul>
              <h4 id="saknas-din-bloggkategori-">Saknas din bloggkategori?</h4>
              <P>
                Du kan enkelt skapa en ny kategori genom att göra det inuti{" "}
                <Code>Post Category</Code> <strong>collection-typen</strong>
              </P>
              <h3 id="jobs-jobbannonser">Jobs - jobbannonser</h3>
              <P>Dessa attribut behöver fyllas in:</P>
              <ul>
                <li>title</li>
                <li>deadlinedate - Stängningstiden för annonsen</li>
                <li>startdate - datumet då arbetet börjar</li>
                <li>year - vilka årsgångar som berörs</li>
                <li>
                  contact - de olika kontaktkanaler som företagen vill använda.
                </li>
                <li>position - vilken position det berör om</li>
                <li>
                  location - i vilken stad det berör om. Även digitalt fungerar
                </li>
                <li>description</li>
                <li>body</li>
                <li>jobcategory - vilken typ av anställning det är</li>
                <li>company - vilket företag det handlar om</li>
              </ul>
              <h4 id="saknas-din-jobbkategori-eller-ditt-f-retag-">
                Saknas din jobbkategori eller ditt företag?
              </h4>
              <P>
                Du kan enkelt skapa en ny kategori genom att göra det inuti{" "}
                <Code>Job Category</Code> <strong>collection-typen</strong>
              </P>
              <P>
                När det kommer till företag, så skapas dem genom att göra det
                inuti <Code>Companies</Code> - Kan du inte se den? Kontakta NLN,
                din ordförande eller webgruppen.
              </P>
              <h3 id="events-sektions-och-f-retagsevent">
                Events - sektions- och företagsevent
              </h3>
              <P>Dessa attribut behöver fyllas in:</P>
              <ul>
                <li>title</li>
                <li>
                  tickets
                  <ul>
                    <li>price</li>
                    <li>swedishname</li>
                    <li>englishname</li>
                  </ul>
                </li>
                <li>
                  servingoptions
                  <ul>
                    <li>servingfood</li>
                    <li>servingalcohol</li>
                  </ul>
                </li>
                <li>starttime - datumet för då eventet start</li>
                <li>endtime - datumet för då eventet slutar</li>
                <li>deadline - datumet för då OSAN stänger</li>
                <li>
                  place
                  <ul>
                    <li>name</li>
                  </ul>
                </li>
                <li>description</li>
                <li>body</li>
                <li>committee</li>
                <li>category</li>
              </ul>
              <P>
                <img
                  src="/documentation/media/event/kategorisering.png"
                  width="550px"
                  alt='"Bild som visar hur man kategoriserar event till företagsevent"'
                />
              </P>
              <P>
                På bilden ovan syns det hur man kategoriserar event till att
                vara företagsevent, vanliga event, lunchföreläsningar med mera.
              </P>
              <P>
                <img
                  src="/documentation/media/event/mat.png"
                  width="550px"
                  alt='"Bild som visar hur man väljer att begära specialkost"'
                />
              </P>
              <P>
                Ska ert event servera mat, så är det <strong>viktigt</strong>{" "}
                att ni bockar in att ni faktiskt gör det. Eftersom det är{" "}
                <strong>direkt</strong> kopplat till om hemsidan kommer visa
                specialkost eller inte när gästerna OSAR.
              </P>
              <P>
                Detta gäller för tillfället inte för alkohol, utan detta
                reguleras genom olika biljetter. Utan denna är mest för
                dokumentation för sektionens vägnar.
              </P>
              <P>
                Behöver ni ha ert event <strong>lösenordsskyddat?</strong> Då
                klickar ni på plusset och lägger till ett lösenord.
              </P>
              <P>
                <img
                  src="/documentation/media/event/password.png"
                  width="550px"
                  alt='"Bild som visar hur man väljer att begära lösenord"'
                />
              </P>
              <h4 id="saknas-din-eventkategori-">Saknas din eventkategori?</h4>
              <P>
                Du kan enkelt skapa en ny kategori genom att göra det inuti{" "}
                <Code>Event Category</Code> <strong>collection-typen</strong>
              </P>
              <h4 id="saknas-din-n-mnd-">Saknas din nämnd?</h4>
              <P>
                Tråkigt! Kontakta webgruppen eller webmaster, så åtgärdas det!
              </P>
            </Block>
            <Block>
              <h1 id="single-type">Single type</h1>
              <h2 id="vad-är-en-single-type">Vad är en single type?</h2>
              <P>
                En single type är en mall för en specifik statiskt sida, som det
                inte finns flera av. Därav namnet <strong>single</strong> type.
              </P>
              <h2 id="när-passar-det-bra-att-ha-single-type">
                När passar det bra att ha single type?
              </h2>
              <P>Det är en klurig fråga, men jag brukar oftast tänka så här:</P>
              <ul>
                <li>kommer det finnas flera varianter av denna sida?</li>
                <li>Är innehållet unikt?</li>
                <li>Är innehållet &quot;ändligt&quot;?</li>
              </ul>
              <P>
                Single type funkar alltså bra om innehållet inte är oändligt,
                unikt och inte kommer ha flera varianter.
              </P>
              <h3 id="exempel">Exempel:</h3>
              <ul>
                <li>about us</li>
                <li>homepage / landing page</li>
                <li>FAQ</li>
              </ul>
              <h2 id="behöver-jag-bry-mig-på-single-types">
                Behöver jag bry mig på single types?
              </h2>
              <P>
                Snarlikt! Det kommer främst vara aktuellt för medlemmar i
                styrelsen, webgruppen och studienämnden.
              </P>
              <h2 id="jag-vill-skapa-en-homepage-till-min-nämnd">
                Jag vill skapa en homepage till min nämnd
              </h2>
              <P>
                Coolt! Det gör du dock inte genom single type, utan är något du
                kan göra inuti <Code>Committees</Code>{" "}
                <strong>collection-typen</strong> om du har access till den.
              </P>
            </Block>
            <Block>
              <h1 id="event-manager">Event-manager</h1>
              <h2 id="vad-används-managern-till">Vad används managern till?</h2>
              <P>
                Det är genom detta verktyg som man{" "}
                <strong>enklast och snabbast</strong> kan hantera sin nämnds
                event.
              </P>
              <h3 id="hur-skapar-jag-ett-event">Hur skapar jag ett event?</h3>
              <P>
                Du skapar ett event genom att klicka på den blåa knappen{" "}
                <Code>Add new Event</Code> - som navigerar dig till{" "}
                <Code>event-collection-typen</Code>, där du behöver fylla i
                följande:
              </P>
              <ul>
                <li>title</li>
                <li>
                  tickets
                  <ul>
                    <li>price</li>
                    <li>swedishname</li>
                    <li>englishname</li>
                  </ul>
                </li>
                <li>
                  servingoptions
                  <ul>
                    <li>servingfood</li>
                    <li>servingalcohol</li>
                  </ul>
                </li>
                <li>starttime - datumet för då eventet start</li>
                <li>endtime - datumet för då eventet slutar</li>
                <li>deadline - datumet för då OSAN stänger</li>
                <li>
                  place
                  <ul>
                    <li>name</li>
                  </ul>
                </li>
                <li>description</li>
                <li>body</li>
                <li>
                  committee - den nämnd du vill att eventet skall tillhöra
                </li>
                <li>category</li>
              </ul>
              <P>
                <strong>
                  Glöm inte att publicera efter du har fyllt i ovanstående
                  information!
                </strong>
              </P>
              <h3 id="hur-kontrollerar-jag-ett-event">
                Hur kontrollerar jag ett event?
              </h3>
              <P>
                När du väl tillhör en nämnd och den nämnden har skapat ett
                event, så kommer den att synas i <Code>Event-managern</Code>{" "}
                genom att du har valt rätt nämnd i valmenyn i högra hörnet.
              </P>
              <P>Klicka därefter på det event du vill hantera.</P>
              <h3 id="ser-du-inga-nämnder-i-menyn">
                Ser du inga nämnder i menyn?
              </h3>
              <P>Kontakta webgruppen eller webmaster, så åtgärdar dem det.</P>
            </Block>
          </div>

          <div className="col-md-12 col-lg-4"></div>
        </div>
      </Container>
    </>
  );
};

export default memo(HomePage);
