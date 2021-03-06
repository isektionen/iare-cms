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
                H??r kommer det finnas guides i framtiden till hur man navigera
                sig genom CMSen
              </P>
            </Block>
            <Block>
              <h1 id="collection-type">Collection type</h1>
              <h2 id="vad-r-en-collection-type-">Vad ??r en collection type?</h2>
              <P>
                I enkla termer ??r det en samling av entiteter som delar samma
                attribut. Collections ??r en grundpelare i INTRA. Utan dem skulle
                inte kopplingen mellan databas och hemsida (frontend) existera.
              </P>
              <P>
                Medlemmar i <strong>Webgruppen</strong> har access att redigera,
                skapa och ta bort collection types, vilket g??rs med verktyget{" "}
                <Code>Content-Types Builder</Code>, som ??r synligt i v??nstra
                sidebaren. <strong>DETTA SKALL EJ G??RAS I LIVE MILJ??</strong>,
                utan endast p?? lokal testmilj??, som ni har tillg??ng till genom{" "}
                <Code>github</Code>
              </P>
              <P>
                Genom att skapa en ny collection type, s?? skapar man ??ven en{" "}
                <Code>REST-Endpoint</Code>, som g??r att accessa p??{" "}
                <Code>https://cms.iare.se/[MY - COLLECTION]</Code>, d??r
                &quot;MY-COLLECTION&quot; ??r namnet p?? den collection som ni
                skapat.
              </P>
              <P>
                Default permission ??r att den inte ??r publik (vem som helst kan
                anv??nda Endpointen), utan detta m??ste man manuellt justera i
                efterhand genom att kontakta Webmaster.
              </P>
              <h2 id="olika-f-rklaringar">Olika f??rklaringar</h2>
              <h3 id="vad-r-slug-beh-ver-jag-slug-">
                Vad ??r slug? Beh??ver jag slug?
              </h3>
              <P>
                En slug ??r vad man kallar en mening utan mellanrum. Oftast har
                dem bytts bort mot bindestr??ck <Code>-</Code> f??r att g??ra en
                l??nk l??sbar och &quot;URL-safe&quot;. Denna genereras
                automatiskt utifr??n titeln som ni ger ert inl??gg, men om ni
                verkligen vill ha en speciell <strong>slug</strong>, s?? kan ni
                ocks?? redigera den.
              </P>
              <h3 id="vad-r-internationalization-beh-ver-jag-det-">
                Vad ??r internationalization? Beh??ver jag det?
              </h3>
              <P>
                Internationaliseing inneb??r att informationen finns p?? flera
                spr??k. INTRA ??r som default satt till Svenska, men till??ter ??ven
                Engelska som andra spr??k. Denna ??vers??ttningen sker inte
                automatiskt, utan ??r n??got man m??ste manuellt g??ra!
              </P>
              <P>
                Om du f??r n??gon anledning v??ljer att inte skriva en engelsk
                version s?? kommer det att synas p?? hemsidan (frontenden) genom
                en varningskylt h??gst upp p?? sidan.
              </P>
              <P>
                <img
                  src="/documentation/media/i18n/warning.png"
                  width="550px"
                  alt='"Bild som visar vad som sker n??r man inte har alla internationaliseringar"'
                />
              </P>
              <P>
                D??r ni kan se att viss information fortfarande ??r p?? Svenska.
              </P>
              <P>
                Du populerar en ny <Code>internationalization</Code> genom att
                klicka p?? valmenyn som heter <Code>locales</Code> och v??ljer den
                som saknas.
              </P>
              <P>
                <img
                  src="/documentation/media/i18n/create.png"
                  width="550px"
                  alt='"Bild som visar hur man l??gger till spr??k"'
                />
              </P>
              <P>
                D??refter kan du sedan l??gga till informationen p?? det nya
                spr??ket, alternativt populera ifr??n tidigare spr??k genom att
                klicka p?? knappen <Code>Fill in from another locale</Code>.
              </P>
              <P>
                Gl??m inte att <strong>publicera</strong> den nya ??vers??ttningen,
                annars kommer den inte att reflekteras p?? hemsidan!
              </P>
              <h2 id="hur-skapar-jag-ett-nytt-inl-gg-">
                Hur skapar jag ett nytt inl??gg?
              </h2>
              <P>
                Beroende p?? dina permissions, s?? kommer du endast se{" "}
                <strong>collection-types</strong> som ber??r din funktionspost.
                Vill du f?? access till mer? Kontakta webgruppen alternativt
                Webmaster.
              </P>
              <P>
                <strong>Viktigt att t??nka p??!</strong>
              </P>
              <P>
                Du beh??ver klicka p?? den bl??a <Code>publish</Code> knappen f??r
                att ditt inl??gg skall synas p?? webben. F??r du inte publicera?
                Kontakta din ordf??rande och be hen publicera ert inl??gg.
              </P>
              <P>
                Dessa <strong>collection-types</strong> g??r det att g??ra inl??gg
                p?? som sedan publiceras p?? hemsidan:
              </P>
              <h3 id="posts-allm-na-blogginl-gg">
                Posts - allm??na blogginl??gg
              </h3>
              <P>Dessa attribut beh??ver fyllas in:</P>
              <ul>
                <li>title</li>
                <li>description</li>
                <li>body</li>
                <li>committee (vilken n??mnd som publicerar)</li>
                <li>
                  categories - kategorier som du anser att inl??gget kretsar
                  runt.
                </li>
              </ul>
              <h4 id="saknas-din-bloggkategori-">Saknas din bloggkategori?</h4>
              <P>
                Du kan enkelt skapa en ny kategori genom att g??ra det inuti{" "}
                <Code>Post Category</Code> <strong>collection-typen</strong>
              </P>
              <h3 id="jobs-jobbannonser">Jobs - jobbannonser</h3>
              <P>Dessa attribut beh??ver fyllas in:</P>
              <ul>
                <li>title</li>
                <li>deadlinedate - St??ngningstiden f??r annonsen</li>
                <li>startdate - datumet d?? arbetet b??rjar</li>
                <li>year - vilka ??rsg??ngar som ber??rs</li>
                <li>
                  contact - de olika kontaktkanaler som f??retagen vill anv??nda.
                </li>
                <li>position - vilken position det ber??r om</li>
                <li>
                  location - i vilken stad det ber??r om. ??ven digitalt fungerar
                </li>
                <li>description</li>
                <li>body</li>
                <li>jobcategory - vilken typ av anst??llning det ??r</li>
                <li>company - vilket f??retag det handlar om</li>
              </ul>
              <h4 id="saknas-din-jobbkategori-eller-ditt-f-retag-">
                Saknas din jobbkategori eller ditt f??retag?
              </h4>
              <P>
                Du kan enkelt skapa en ny kategori genom att g??ra det inuti{" "}
                <Code>Job Category</Code> <strong>collection-typen</strong>
              </P>
              <P>
                N??r det kommer till f??retag, s?? skapas dem genom att g??ra det
                inuti <Code>Companies</Code> - Kan du inte se den? Kontakta NLN,
                din ordf??rande eller webgruppen.
              </P>
              <h3 id="events-sektions-och-f-retagsevent">
                Events - sektions- och f??retagsevent
              </h3>
              <P>Dessa attribut beh??ver fyllas in:</P>
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
                <li>starttime - datumet f??r d?? eventet start</li>
                <li>endtime - datumet f??r d?? eventet slutar</li>
                <li>deadline - datumet f??r d?? OSAN st??nger</li>
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
                  alt='"Bild som visar hur man kategoriserar event till f??retagsevent"'
                />
              </P>
              <P>
                P?? bilden ovan syns det hur man kategoriserar event till att
                vara f??retagsevent, vanliga event, lunchf??rel??sningar med mera.
              </P>
              <P>
                <img
                  src="/documentation/media/event/mat.png"
                  width="550px"
                  alt='"Bild som visar hur man v??ljer att beg??ra specialkost"'
                />
              </P>
              <P>
                Ska ert event servera mat, s?? ??r det <strong>viktigt</strong>{" "}
                att ni bockar in att ni faktiskt g??r det. Eftersom det ??r{" "}
                <strong>direkt</strong> kopplat till om hemsidan kommer visa
                specialkost eller inte n??r g??sterna OSAR.
              </P>
              <P>
                Detta g??ller f??r tillf??llet inte f??r alkohol, utan detta
                reguleras genom olika biljetter. Utan denna ??r mest f??r
                dokumentation f??r sektionens v??gnar.
              </P>
              <P>
                Beh??ver ni ha ert event <strong>l??senordsskyddat?</strong> D??
                klickar ni p?? plusset och l??gger till ett l??senord.
              </P>
              <P>
                <img
                  src="/documentation/media/event/password.png"
                  width="550px"
                  alt='"Bild som visar hur man v??ljer att beg??ra l??senord"'
                />
              </P>
              <h4 id="saknas-din-eventkategori-">Saknas din eventkategori?</h4>
              <P>
                Du kan enkelt skapa en ny kategori genom att g??ra det inuti{" "}
                <Code>Event Category</Code> <strong>collection-typen</strong>
              </P>
              <h4 id="saknas-din-n-mnd-">Saknas din n??mnd?</h4>
              <P>
                Tr??kigt! Kontakta webgruppen eller webmaster, s?? ??tg??rdas det!
              </P>
            </Block>
            <Block>
              <h1 id="single-type">Single type</h1>
              <h2 id="vad-??r-en-single-type">Vad ??r en single type?</h2>
              <P>
                En single type ??r en mall f??r en specifik statiskt sida, som det
                inte finns flera av. D??rav namnet <strong>single</strong> type.
              </P>
              <h2 id="n??r-passar-det-bra-att-ha-single-type">
                N??r passar det bra att ha single type?
              </h2>
              <P>Det ??r en klurig fr??ga, men jag brukar oftast t??nka s?? h??r:</P>
              <ul>
                <li>kommer det finnas flera varianter av denna sida?</li>
                <li>??r inneh??llet unikt?</li>
                <li>??r inneh??llet &quot;??ndligt&quot;?</li>
              </ul>
              <P>
                Single type funkar allts?? bra om inneh??llet inte ??r o??ndligt,
                unikt och inte kommer ha flera varianter.
              </P>
              <h3 id="exempel">Exempel:</h3>
              <ul>
                <li>about us</li>
                <li>homepage / landing page</li>
                <li>FAQ</li>
              </ul>
              <h2 id="beh??ver-jag-bry-mig-p??-single-types">
                Beh??ver jag bry mig p?? single types?
              </h2>
              <P>
                Snarlikt! Det kommer fr??mst vara aktuellt f??r medlemmar i
                styrelsen, webgruppen och studien??mnden.
              </P>
              <h2 id="jag-vill-skapa-en-homepage-till-min-n??mnd">
                Jag vill skapa en homepage till min n??mnd
              </h2>
              <P>
                Coolt! Det g??r du dock inte genom single type, utan ??r n??got du
                kan g??ra inuti <Code>Committees</Code>{" "}
                <strong>collection-typen</strong> om du har access till den.
              </P>
            </Block>
            <Block>
              <h1 id="event-manager">Event-manager</h1>
              <h2 id="vad-anv??nds-managern-till">Vad anv??nds managern till?</h2>
              <P>
                Det ??r genom detta verktyg som man{" "}
                <strong>enklast och snabbast</strong> kan hantera sin n??mnds
                event.
              </P>
              <h3 id="hur-skapar-jag-ett-event">Hur skapar jag ett event?</h3>
              <P>
                Du skapar ett event genom att klicka p?? den bl??a knappen{" "}
                <Code>Add new Event</Code> - som navigerar dig till{" "}
                <Code>event-collection-typen</Code>, d??r du beh??ver fylla i
                f??ljande:
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
                <li>starttime - datumet f??r d?? eventet start</li>
                <li>endtime - datumet f??r d?? eventet slutar</li>
                <li>deadline - datumet f??r d?? OSAN st??nger</li>
                <li>
                  place
                  <ul>
                    <li>name</li>
                  </ul>
                </li>
                <li>description</li>
                <li>body</li>
                <li>
                  committee - den n??mnd du vill att eventet skall tillh??ra
                </li>
                <li>category</li>
              </ul>
              <P>
                <strong>
                  Gl??m inte att publicera efter du har fyllt i ovanst??ende
                  information!
                </strong>
              </P>
              <h3 id="hur-kontrollerar-jag-ett-event">
                Hur kontrollerar jag ett event?
              </h3>
              <P>
                N??r du v??l tillh??r en n??mnd och den n??mnden har skapat ett
                event, s?? kommer den att synas i <Code>Event-managern</Code>{" "}
                genom att du har valt r??tt n??mnd i valmenyn i h??gra h??rnet.
              </P>
              <P>Klicka d??refter p?? det event du vill hantera.</P>
              <h3 id="ser-du-inga-n??mnder-i-menyn">
                Ser du inga n??mnder i menyn?
              </h3>
              <P>Kontakta webgruppen eller webmaster, s?? ??tg??rdar dem det.</P>
            </Block>
          </div>

          <div className="col-md-12 col-lg-4"></div>
        </div>
      </Container>
    </>
  );
};

export default memo(HomePage);
