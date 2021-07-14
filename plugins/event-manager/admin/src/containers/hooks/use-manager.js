import React, { useEffect, useContext, createContext } from "react";
import axios from "axios";
import { useRecoilCallback, useRecoilValue, useSetRecoilState } from "recoil";
import {
  root,
  committeeSelector,
  committeeIdAtom,
  eventsSelector,
  eventSelector,
  allCommittees,
  eventOrders,
  orderSelector,
  status,
  statusSelector,
} from "../state/state";
import { useQueryParams } from "strapi-helper-plugin";
import { useParams } from "react-router-dom";
import { formatDistanceToNowStrict } from "date-fns";

export const useManager = () => {
  const [{ query }, setQuery] = useQueryParams();

  const fetchData = useRecoilCallback(({ set }) => async () => {
    set(status, "pending");
    const unparsedToken = localStorage["jwtToken"]
      ? localStorage["jwtToken"]
      : sessionStorage["jwtToken"];
    const parsedToken = JSON.parse(unparsedToken);
    const { data } = await axios.get(strapi.backendURL + "/event-manager/me", {
      headers: { Authorization: `Bearer ${parsedToken}` },
    });
    if (data && data.length > 0) {
      set(root, data);
      const cid = query?.cid ?? data[0].id;
      set(committeeIdAtom, parseInt(cid));
      set(status, "success");
    }
  });

  useEffect(() => {
    fetchData();
  }, []);

  // values
  const committee = useRecoilValue(committeeSelector);
  const committees = useRecoilValue(allCommittees);
  const events = useRecoilValue(eventsSelector);
  const id = useRecoilValue(committeeIdAtom);

  const entries = events.length;

  // logic
  const loaded = useRecoilValue(statusSelector("success"));
  const committeeExists = Object.keys(committee).length > 0;

  // setters
  const _setId = useSetRecoilState(committeeIdAtom);

  const setId = (id) => {
    _setId(id);
    setQuery({ cid: id });
  };
  return {
    entries,
    committees,
    committee,
    committeeExists,
    loaded,
    id,
    events,
    setId,
  };
};

export const useEvent = () => {
  const params = useParams();
  const { id } = useManager();
  const fetchData = useRecoilCallback(({ set }) => async () => {
    set(status, "pending");
    const unparsedToken = localStorage["jwtToken"]
      ? localStorage["jwtToken"]
      : sessionStorage["jwtToken"];
    const parsedToken = JSON.parse(unparsedToken);
    if (params.slug) {
      const { data } = await axios.get(
        strapi.backendURL + `/event-manager/orders/${params.slug}`,
        {
          headers: { Authorization: `Bearer ${parsedToken}` },
        }
      );
      set(eventOrders, data);
      set(status, "success");
    }
  });

  useEffect(() => {
    fetchData();
  }, []);

  const event = useRecoilValue(
    eventSelector({ id, slug: params?.slug ?? null })
  );
  const loaded = useRecoilValue(statusSelector("success"));
  const eventExists = Object.keys(event).length > 0;
  const packedOrders = useRecoilValue(orderSelector(event?.id ?? -1));

  const orders = packedOrders
    .map((order) => ({
      amount: order.amount,
      firstName: order.consumer?.firstName ?? null,
      lastName: order.consumer?.lastName ?? null,
      diets: order.consumer?.diets.map((diet) => diet.name).join(", ") ?? "",
      allergens:
        order.consumer?.allergens.map((allergen) => allergen.name).join(", ") ??
        "",
      email: order.consumer?.email ?? null,
      phoneNumber: order.consumer?.phoneNumber ?? null,
      intentionId: order.intentionId,
      ip: order.ip,
      paymentId: order.paymentId,
      paymentMethod: order.paymentMethod,
      reference: order.reference,
      status: order.status,
      tickets: order?.ticketReference.map((ticket) => ticket.reference),
    }))
    .filter((order) => order.status !== "visited");
  const ordersExists = orders.length > 0;

  const revenue = orders.reduce(
    (total, order) => (order.amount ? total + order.amount : total),
    0
  );
  const ticketsSold = orders.reduce((total, order) => {
    if (order.status === "success") return total + 1;
    return total;
  }, 0);
  const visits = orders.length;
  const entries = orders.length;

  const daysTillClosing = event.deadline
    ? formatDistanceToNowStrict(new Date(event.deadline), {
        unit: "day",
        roundingMethod: "ceil",
        addSuffix: true,
      })
    : "-";
  return {
    event,
    eventExists,
    loaded,
    orders,
    revenue: ordersExists ? revenue + " kr" : "-",
    ticketsSold: ordersExists ? ticketsSold : "-",
    visits,
    daysTillClosing,
    entries,
  };
};
