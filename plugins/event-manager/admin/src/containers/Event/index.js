import { Header } from "@buffetjs/custom";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import * as echarts from "echarts";
import React, {
  memo,
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
} from "react";
import { useHistory, useParams } from "react-router-dom";
import { useRecoilValue, useSetRecoilState } from "recoil";
import { useQueryParams } from "strapi-helper-plugin";
import styled from "styled-components";
import Search from "../../components/Search";
import Table from "../../components/Table";
import {
  bearerToken,
  currentCommittee,
  currentEvent,
  forceEventUpdate,
} from "../state/user";
import { useEvent } from "../hooks/use-manager";

const StatCard = styled.div`
  position: relative;
  display: flex;
  flex-direction: row;
  padding-left: 2rem;
  padding-right: 2rem;
  padding-top: 1rem;
  padding-bottom: 1rem;
  flex-direction: column;
  border-radius: 3px;
  border: 1px dashed #e3e9f3;
  max-height: 10rem;
`;

const StatContent = styled.div`
  position: relative;
  display: grid;
  justify-items: stretch;
  height: 100%;
`;

const StatLabel = styled.h5`
  font-weight: 900;
  text-transform: uppercase;
  color: var(--secondary);
  font-size: 1.1rem;
`;

const StatNumber = styled.h3`
  position: relative;
`;

const StatHelpText = styled.p``;

const ChartWrapper = styled.div`
  position: relative;
  height: 5rem;
  width: 23rem;
`;

const Statistics = styled.div`
  display: flex;
  position: relative;
  align-items: stretch;
  justify-content: space-evenly;
  width: 100%;
  padding: 1rem;
  margin-bottom: 3rem;
  background-color: tomato;
  box-shadow: 0 2px 4px #e3e9f3;
  border-radius: 3px;
  background: white;
`;

const DietChart = () => {
  const chartRef = useRef(null);

  useEffect(() => {
    if (chartRef.current) {
      const chart = echarts.init(chartRef.current, null, { renderer: "svg" });
      chart.setOption({
        tooltip: {
          trigger: "item",
        },
        legend: {
          right: "1rem",
          top: "center",
          orient: "vertical",
          itemHeight: 5,
          itemWidth: 6,
          textStyle: {
            fontSize: 10,
          },
        },
        series: [
          {
            name: "",
            type: "pie",
            radius: ["40%", "70%"],
            avoidLabelOverlap: false,
            center: ["18%", "50%"],
            label: {
              show: false,
              position: "center",
            },
            emphasis: {
              label: {
                show: true,
                fontSize: "14",
                fontWeight: "bold",
              },
            },
            labelLine: {
              show: false,
            },
            data: [
              { value: 34, name: "vegetariskt" },
              { value: 99, name: "normalt" },
              { value: 44, name: "pescitarian" },
              { value: 99, name: "veganskt" },
            ],
          },
        ],
      });
    }
  }, []);
  return <ChartWrapper ref={chartRef} />;
};

const Event = () => {
  const [{ query }, setQuery] = useQueryParams();

  const {
    event,
    eventExists,
    loaded,
    orders,
    revenue,
    ticketsSold,
    daysTillClosing,
    entries,
  } = useEvent();

  const history = useHistory();
  const _q = query?._q ?? "";

  const changeDraftState = () => {
    axios.put(
      `${strapi.backendURL}/events/${event?.id}`,
      {
        published_at: event?.published_at ? null : new Date(),
      },
      { headers: token }
    );
    updateData((b) => !b);
  };

  const toLowerCase = useCallback((str) => {
    try {
      return str.toLowerCase();
    } catch (e) {
      return str;
    }
  }, []);
  const filteredOrders = useMemo(
    () => {
      if (orders && orders.length > 0) {
        return orders.filter(order => {
          const {firstName, lastName, allergens, diets, email, tickets} = order
          return [firstName, lastName, allergens, diets, email, tickets].some(item => {
            if (item) {
              return item.includes(_q)
            }
            return false
          })
        })
      }
      return orders
    }
    [orders]
  );

  useEffect(() => {
    if (loaded && !eventExists) {
      const { search } = history.location;
      strapi.notification.toggle({
        type: "warning",
        message: `No event found`,
        title: "Event manager",
        timeout: 5000,
      });
      history.push("/plugins/event-manager" + search, {
        previousErrors: true,
      });
    }
  }, [eventExists, loaded]);
  return (
    <>
      <Search
        changeParams={setQuery}
        path="Event"
        model={"tickets"}
        initValue={_q}
        value={_q}
      />
      <Header
        title={{
          label: event.title,
        }}
        content={`${entries} ${entries === 1 ? "entry" : "entries"} found`}
        actions={[
          {
            label: "Back",
            onClick: () => {
              const { search } = history.location;
              history.push("/plugins/event-manager" + search);
            },
            type: "button",
            color: "secondary",
            icon: <FontAwesomeIcon icon={faChevronLeft} />,
            kind: "back",
          },
          {
            label: "Edit",
            type: "button",
            color: "primary",
            icon: "pencil",
            onClick: () =>
              history.push(
                `/plugins/content-manager/collectionType/application::event.event/${event?.id}`
              ),
          },
          {
            label: event?.published_at ? "Unpublish" : "Publish",
            type: "button",
            color: event?.published_at ? "delete" : "primary",
            onClick: changeDraftState,
          },
        ]}
      />
      <Statistics>
        <StatCard>
          <StatContent>
            <StatLabel>Revenue</StatLabel>
            <StatNumber>{revenue}</StatNumber>
          </StatContent>
        </StatCard>
        <StatCard>
          <StatContent>
            <StatLabel>Tickets sold</StatLabel>
            <StatNumber>{ticketsSold}</StatNumber>
          </StatContent>
        </StatCard>
        <StatCard>
          <StatContent>
            <StatLabel>Deadline due</StatLabel>
            <StatNumber>{daysTillClosing}</StatNumber>
          </StatContent>
        </StatCard>
      </Statistics>

      <Table
        headers={[
          {
            name: "Status",
            value: "status",
            isSortEnabled: true,
          },
          {
            name: "Firstname",
            value: "firstName",
            isSortEnabled: true,
          },
          {
            name: "Lastname",
            value: "lastName",
            isSortEnabled: true,
          },
          {
            name: "Ticket",
            value: "ticket",
            isSortEnabled: true,
          },
          {
            name: "Diets",
            value: "diets",
            isSortEnabled: true,
          },
          {
            name: "Allergens",
            value: "allergens",
            isSortEnabled: true,
          },
          {
            name: "Reference",
            value: "reference",
            isSortEnabled: true,
          },
        ]}
        onClickRow={(e, d) => {}}
        onConfirm={() => {}}
        rows={filteredOrders}
      />
    </>
  );
};

export default memo(Event);
