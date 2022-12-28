module.exports = function getSlug(text) {
  return text
    .split(" ")
    .map((part) => part.toLowerCase())
    .join("-");
};
