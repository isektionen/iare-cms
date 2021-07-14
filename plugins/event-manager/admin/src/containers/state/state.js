"use strict";
import axios from "axios";
import { atom, selector, selectorFamily, atomFamily } from "recoil";
import pluginId from "../../pluginId";

export const root = atom({
  key: "ATOM/ROOT",
  default: [],
});

export const status = atom({
  key: "ATOM/STATUS",
  default: "offline",
});

export const statusSelector = selectorFamily({
  key: "SELECTOR/STATUS",
  get:
    (state) =>
    ({ get }) => {
      return get(status) === state;
    },
});

export const committeeIdAtom = atom({
  key: "ATOM/CID",
  default: -1,
});

export const allCommittees = selector({
  key: "SELECTOR/ALL",
  get: ({ get }) => {
    const committees = get(root);
    return committees.map((c) => ({ id: c.id, name: c.name }));
  },
});

export const committeeSelector = selector({
  key: "SELECTOR/COMMITTEE",
  get: ({ get }) => {
    const committees = get(root);
    const id = get(committeeIdAtom);
    return committees.find((c) => c.id === id) || {};
  },
});

export const eventsSelector = selector({
  key: "SELECTOR/EVENTS",
  get: ({ get }) => {
    const committee = get(committeeSelector);
    return committee?.events ?? [];
  },
});

export const eventSelector = selectorFamily({
  key: "SF/EVENT",
  get:
    ({ id, slug }) =>
    ({ get }) => {
      if (slug === null || id === null) return null;
      const events = get(eventsSelector);
      return events.find((e) => e.slug === slug && e.committee === id) || {};
    },
});

export const eventOrders = atom({
  key: "ATOM/ORDERS",
  default: [],
});

export const orderSelector = selectorFamily({
  key: "SELECTOR/ORDERS",
  get:
    (id) =>
    ({ get }) => {
      const orders = get(eventOrders);
      if (orders.length > 0) {
        return orders.filter((order) => order.event.id === id);
      }
      return [];
    },
});
