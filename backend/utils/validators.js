const { ObjectId } = require("mongodb");

function isValidObjectId(id) {
  return ObjectId.isValid(id);
}

function toObjectId(id) {
  return new ObjectId(id);
}

function isAllowedValue(value, allowedValues) {
  return allowedValues.includes(value);
}

function normalizeRequiredText(value) {
  if (value === undefined) return undefined;
  if (!value || !value.trim()) return null;

  return value.trim();
}

function normalizeEmail(value) {
  if (value === undefined) return undefined;

  const trimmedEmail = value.trim().toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
    return null;
  }

  return trimmedEmail;
}

module.exports = {
  isAllowedValue,
  isValidObjectId,
  normalizeEmail,
  normalizeRequiredText,
  toObjectId,
};
