"use strict";
import axios from "axios";
import { atom, selector, selectorFamily } from "recoil";
import pluginId from "../../pluginId";

const retrieve = async (path, headers) => {
  return await axios.get(strapi.backendURL + path, {
    headers: { ...headers },
  });
};

export const tokenState = atom({
  key: "USER/TOKEN",
  default: null,
});

export const bearerToken = selector({
  key: "USER/BEARER",
  get: ({ get }) => {
    const token = get(tokenState);
    if (!token) return {};
    const bearer = {
      Authorization: "Bearer " + token,
    };
    return bearer;
  },
});

const getUserCommittees = async (bearer) => {
  try {
    return await (
      await retrieve(`/${pluginId}/me`, bearer)
    ).data;
  } catch {
    return null;
  }
};

export const forceEventUpdate = atom({
  key: "EVENT/UPDATE",
  default: true,
});

export const currentCommitteeIDState = atom({
  key: "COMMITTEE/ID",
  default: -1,
});

export const currentCommittee = selector({
  key: "COMMITTEE/CURRENT",
  get: async ({ get }) => {
    const id = get(currentCommitteeIDState);
    if (id < 0) return null;
    const committees = await get(committeesState);
    if (!committees) return null;
    const [committee] = committees.filter((c) => c.id === id);
    return committee;
  },
});

export const currentEvents = selector({
  key: "COMMITTEE/EVENTS",
  get: async ({ get }) => {
    const committee = await get(currentCommittee);
    if (!committee) return null;
    return committee.events;
  },
});

export const currentEvent = selectorFamily({
  key: "COMMITTEE/EVENT",
  get:
    (slug) =>
    async ({ get }) => {
      const events = await get(currentEvents);
      if (!events) return null;
      const [event] = events.filter((e) => e.slug == slug);
      return event;
    },
});

export const committeesState = atom({
  key: "USER/COMMITTEES",
  default: selector({
    key: "COMMITTEES/DATA",
    get: async ({ get }) => {
      // Dependency "injection"
      get(forceEventUpdate);
      const bearer = get(bearerToken);
      if (!bearer) return null;

      return await getUserCommittees(bearer);
    },
  }),
});
