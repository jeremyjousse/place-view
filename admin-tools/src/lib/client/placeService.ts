export const placeIdFromName = (name: string) => {
  return name.replace(" ", "-").toLowerCase();
};
