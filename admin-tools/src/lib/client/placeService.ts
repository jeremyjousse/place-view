export const placeIdFromName = (name: string) => {
  return name.replaceAll(" ", "-").toLowerCase();
};
