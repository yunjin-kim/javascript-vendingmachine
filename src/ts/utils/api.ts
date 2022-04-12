const fetcher = ({ path, methodName, bodyInfo }) => {
  return fetch(path, {
    method: methodName,
    body: JSON.stringify(bodyInfo),
    headers: {
      "Content-Type": "application/json",
    }
  })
};

export { fetcher };