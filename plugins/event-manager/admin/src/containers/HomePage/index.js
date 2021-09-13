import { Button, Select, Picker, Text, Padded } from "@buffetjs/core";
import { Header } from "@buffetjs/custom";
import { GlobalPagination } from "strapi-helper-plugin";
import { faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { memo, useEffect, useState, useMemo, useCallback } from "react";
import { useHistory, useParams } from "react-router-dom";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { useQueryParams } from "strapi-helper-plugin";
import pluginPkg from "../../../../package.json";
import Search from "../../components/Search";
import Table from "../../components/Table";
import pluginId from "../../pluginId";
import { useManager } from "../hooks/use-manager";
import styled from "styled-components";

const HeaderSelect = () => {
  const { setId, committees, committee } = useManager();

  return (
    <Picker
      position="right"
      renderButtonContent={(isOpen) => (
        <Text>
          {committee && committee.name
            ? committee.name.slice(0, Math.min(10, committee.name.length)) +
              (committee.name.length > 10 ? "..." : "")
            : "Pick Committee"}
        </Text>
      )}
      renderSectionContent={(onToggle) => (
        <PickerContent>
          {committees.map((c) => (
            <PickerItem
              key={c.id}
              onClick={() => {
                setId(c.id);
                onToggle();
              }}
            >
              {c.name}
            </PickerItem>
          ))}
        </PickerContent>
      )}
    />
  );
};

const PickerItem = styled.button`
  display: inline-block;
  color: #18202e;
  font-size: 0.75em;
  margin: 1em;
  padding: 0.25em 1em;
  border: 1px solid #18202e;
  border-radius: 3px;
`;

const PickerContent = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 0.5em 1em;
`;

const ButtonWrapper = styled.div`
  width: 150px;
  height: 30px;
  position: absolute;
  right: 120px;
`;

const HeaderButton = (props) => {
  return (
    <ButtonWrapper>
      <Button color="primary" {...props} />
    </ButtonWrapper>
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
  const [cursor, setCursor] = useState(1);

  const toLowerCase = useCallback((str) => {
    return str ? str.toLowerCase() : str;
  }, []);
  const filteredRows = useMemo(
    () =>
      rows && rows.length > 0
        ? rows.filter((r) => toLowerCase(r.event).includes(toLowerCase(_q)))
        : rows,
    [rows]
  );

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
            Component: () => (
              <HeaderButton
                label="Add new Event"
                icon="plus"
                onClick={() =>
                  history.push(
                    "/plugins/content-manager/collectionType/application::event.event/create"
                  )
                }
              />
            ),
            name: "add-event",
            key: "ADDEVENT",
            placeholder: "",
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
        onConfirm={() => {}}
        rows={filteredRows.slice(15 * (cursor - 1), 15 * cursor)}
      />
      <Padded top>
        <GlobalPagination
          count={filteredRows.length}
          onChangeParams={({ value }) => setCursor(value)}
          params={{
            _page: cursor,
            _limit: 15,
          }}
        />
      </Padded>
    </>
  );
};

export default memo(HomePage);
