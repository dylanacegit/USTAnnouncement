function cleanText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function formatName(firstName, lastName) {
  return [firstName, lastName].map(cleanText).filter(Boolean).join(" ").trim();
}

function getUserAttribution(req, fallback = "System") {
  const user = req?.user || {};
  const record = req?.userRecord || {};
  const body = req?.body || {};
  const firstName = user.firstName || record.first_name;
  const lastName = user.lastName || record.last_name;
  const email = cleanText(user.email || record.email || body.updatedByEmail || body.createdByEmail);
  const name =
    formatName(firstName, lastName) ||
    cleanText(body.updatedBy || body.createdBy) ||
    email ||
    fallback;

  return {
    name,
    email,
  };
}

module.exports = {
  getUserAttribution,
};
