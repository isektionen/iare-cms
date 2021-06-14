export const getBearerToken = () => {
  if (localStorage["jwtToken"]) {
    return {
      Authorization: "Bearer " + JSON.parse(localStorage.getItem("jwtToken")),
    };
  }
  if (sessionStorage["jwtToken"]) {
    return {
      Authorization: "Bearer " + JSON.parse(sessionStorage.getItem("jwtToken")),
    };
  }
  return { Authorization: "" };
};
