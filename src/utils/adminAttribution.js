export function getAdminAttribution(user) {
  const name = [user?.firstName, user?.lastName].filter(Boolean).join(" ").trim();

  return {
    name: name || user?.email || "Admin",
    email: user?.email || "",
  };
}

export function withCreatedAttribution(data, user) {
  const admin = getAdminAttribution(user);

  return {
    ...data,
    createdBy: admin.name,
    createdByEmail: admin.email,
    updatedBy: admin.name,
    updatedByEmail: admin.email,
  };
}

export function withUpdatedAttribution(data, user) {
  const admin = getAdminAttribution(user);

  return {
    ...data,
    updatedBy: admin.name,
    updatedByEmail: admin.email,
  };
}
