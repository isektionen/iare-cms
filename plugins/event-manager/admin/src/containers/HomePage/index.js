import { Button, Select } from "@buffetjs/core";
import { Header } from "@buffetjs/custom";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { memo, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { useQueryParams } from "strapi-helper-plugin";
import pluginPkg from "../../../../package.json";
import Search from "../../components/Search";
import Table from "../../components/Table";
import pluginId from "../../pluginId";
import {
  committeesState,
  currentCommittee,
  currentCommitteeIDState,
} from "../state/user";

const HeaderButton = () => {
  const history = useHistory();
  return (
    <Button
      color={"primary"}
      icon={<FontAwesomeIcon icon={faPlus} />}
      label={"Add New Events"}
      onClick={() =>
        history.push(
          "/plugins/content-manager/collectionType/application::event.event/create?plugins[i18n][locale]=sv-SE"
        )
      }
    />
  );
};

const HeaderSelect = () => {
  const committee = useRecoilValue(currentCommittee);
  const committees = useRecoilValue(committeesState);
  const setNextCommitteeID = useSetRecoilState(currentCommitteeIDState);

  const handleChange = ({ target: { value } }) => {
    const [nextCommittee] = committees.filter((c) => c.name === value);
    if (nextCommittee) {
      setNextCommitteeID(nextCommittee.id);
    }
  };

  return (
    <Select
      name="select"
      options={committees?.map((c) => c.name) ?? []}
      onChange={handleChange}
      value={committee?.name ?? ""}
    />
  );
};

const HomePage = () => {
  const committee = useRecoilValue(currentCommittee);
  const [{ query }, setQuery] = useQueryParams();
  const [events, setEvents] = useState(committee?.events ?? []);

  const headers = [
    {
      name: "Id",
      value: "id",
      isSortEnabled: true,
    },
    {
      name: "Attendees",
      value: "attendees",
      isSortEnabled: true,
    },
    {
      name: "Event",
      value: "event",
      isSortEnabled: true,
    },
    {
      name: "Category",
      value: "category",
      isSortEnabled: true,
    },
    {
      name: "State",
      value: "state",
      isSortEnabled: true,
    },
  ];

  const rows =
    events.map((e) => {
      const { title, event_category, ...rest } = e;

      return {
        ...rest,
        event: title,
        category: event_category,
        state: e.published_at ? true : false,
        attendees: e.orders.length > 0 ? e.orders.length : 0,
      };
    }) ?? [];

  const history = useHistory();
  const numEntries = committee?.events.length;
  const _q = query?._q || "";

  useEffect(() => {
    if (!committee || !committee.events) return;

    // Global filtration on all attributes for a row. Even hidden ones.
    const filteredEvents = committee.events.filter((event) =>
      Object.values(event).some((e) => String(e).includes(_q))
    );
    setEvents(filteredEvents);
  }, [_q, committee]);

  return (
    <>
      <Search
        changeParams={setQuery}
        path="HomePage"
        model="events"
        initValue={_q}
        value={_q}
      />
      <Header
        title={{
          label: pluginPkg.strapi.name,
        }}
        content={`${numEntries} ${
          numEntries === 1 ? "entry" : "entries"
        } found for ${committee?.name}`}
        actions={[
          {
            label: "Add New Event",
            icon: "plus",
            onClick: () =>
              history.push(
                "/plugins/content-manager/collectionType/application::event.event/create?plugins[i18n][locale]=sv-SE"
              ),
            color: "primary",
          },
          {
            Component: HeaderSelect,
            name: "committee-select",
            key: "COMMITTEE/SELECTOR",
            placeholder: "",
          },
        ]}
      />
      <Table
        headers={headers}
        onClickRow={(e, { slug }) =>
          history.push(`/plugins/${pluginId}/${slug}`)
        }
        onConfirm={() => console.log("DELETED")}
        rows={rows}
      />
    </>
  );
};

export default memo(HomePage);
