import { Button, Select } from "@buffetjs/core";
import { Header } from "@buffetjs/custom";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { memo, useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { useQueryParams } from "strapi-helper-plugin";
import pluginPkg from "../../../../package.json";
import Search from "../../components/Search";
import Table from "../../components/Table";
import pluginId from "../../pluginId";
import { useManager } from "../hooks/use-manager";

const HeaderSelect = () => {
  const { setId, committees, committee } = useManager();

  const handleChange = ({ target: { value } }) => {
    const { id } = committees.find((c) => c.name === value);
    setId(id);
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
  const { committee, events, id, entries, loaded, committeeExists } =
    useManager();
  const [{ query }, setQuery] = useQueryParams();

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
  const _q = query?._q ?? "";

  // TODO: reimplement this into useManager
  useEffect(() => {
    /*
    if (!committee || !committee.events) return;

    // Global filtration on all attributes for a row. Even hidden ones.
    const filteredEvents = committee.events.filter((event) =>
      Object.values(event).some((e) => String(e).includes(_q))
    );
    setEvents(filteredEvents);
    console.log(_q);
    */
  }, [_q, committee]);

  useEffect(() => {
    const { state } = history.location;
    const previousErrors = state?.previousErrors ?? false;
    if (loaded && !committeeExists && !previousErrors) {
      strapi.notification.toggle({
        type: "warning",
        message: `You have no access to committee with id of ${id}`,
        title: "Event manager",
        timeout: 5000,
      });
      history.push("/plugins/event-manager", {
        state: {},
      });
    }
  }, [committeeExists, loaded]);
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
        content={`${entries} ${entries === 1 ? "entry" : "entries"} found for ${
          committee?.name ?? "-"
        }`}
        actions={[
          {
            label: "Add New Event",
            icon: "plus",
            onClick: () =>
              history.push(
                "/plugins/content-manager/collectionType/application::event.event/create"
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
          history.push(`/plugins/${pluginId}/${slug}?cid=${id}`)
        }
        onConfirm={() => console.log("DELETED")}
        rows={rows}
      />
    </>
  );
};

export default memo(HomePage);
