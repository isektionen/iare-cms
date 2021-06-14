import { Header } from "@buffetjs/custom";
import { faChevronLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import * as echarts from "echarts";
import React, { memo, useEffect, useRef, useState } from "react";
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
  const { slug } = useParams();
  const [{ query }, setQuery] = useQueryParams();

  const committee = useRecoilValue(currentCommittee);
  const token = useRecoilValue(bearerToken);
  const event = useRecoilValue(currentEvent(slug));

  const updateData = useSetRecoilState(forceEventUpdate);

  const eventName = event?.title;
  const history = useHistory();
  const numEntries = event?.orders.length;
  const _q = query?._q || "";

  const [orders, setOrders] = useState(event?.orders ?? []);

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

  useEffect(() => {
    if (!event || !event.orders) return;

    // Global filtration on all attributes for a row. Even hidden ones.
    const filteredOrders = event.orders.filter((order) =>
      Object.values(order).some((e) => String(e).includes(_q))
    );
    setOrders(filteredOrders);
  }, [_q, event]);

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
          label: eventName,
        }}
        content={`${numEntries} ${
          numEntries === 1 ? "entry" : "entries"
        } found`}
        actions={[
          {
            label: "Back",
            onClick: () => history.push("/plugins/event-manager"),
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
                `/plugins/content-manager/collectionType/application::event.event/${event?.id}?plugins[i18n][locale]=sv-SE`
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
            <StatNumber>150 kr</StatNumber>
          </StatContent>
        </StatCard>
        <StatCard>
          <StatContent>
            <StatLabel>Tickets sold</StatLabel>
            <StatNumber>36 / 149</StatNumber>
          </StatContent>
        </StatCard>
        <StatCard>
          <StatContent>
            <StatLabel>Days left</StatLabel>
            <StatNumber>6</StatNumber>
          </StatContent>
        </StatCard>
        <StatCard>
          <StatContent>
            <StatLabel>Diet Analysis</StatLabel>
            <DietChart />
          </StatContent>
        </StatCard>
      </Statistics>

      <Table
        headers={[
          {
            name: "Id",
            value: "id",
            isSortEnabled: true,
          },
          {
            name: "Token",
            value: "token",
            isSortEnabled: true,
          },
        ]}
        onClickRow={(e, d) => console.debug(e, d)}
        onConfirm={() => console.log("DELETED")}
        rows={orders}
      />
    </>
  );
};

export default memo(Event);
