import { useMemo, useState } from "react";
import { IoMdClose } from "react-icons/io";

const LIMITS = {
  title: 120,
  category: 60,
  description: 1000,
  location: 160,
  organizer: 120,
  scheduleTitle: 120,
  scheduleDescription: 500,
};

const emptyForm = {
  title: "",
  category: "",
  description: "",
  startDate: "",
  endDate: "",
  startTime: "",
  endTime: "",
  location: "",
  organizer: "",
  image: "",
  schedule: [],
};

function createScheduleRows(count, existingRows = []) {
  return Array.from({ length: count }, (_, index) => ({
    day: `Day ${index + 1}`,
    date: existingRows[index]?.date || "",
    startTime: existingRows[index]?.startTime || "",
    endTime: existingRows[index]?.endTime || "",
    title: existingRows[index]?.title || "",
    description: existingRows[index]?.description || "",
    image: existingRows[index]?.image || "",
  }));
}

function eventToForm(event) {
  const schedule = Array.isArray(event.schedule)
    ? event.schedule.map((item, index) => ({
        day: item.day || `Day ${index + 1}`,
        date: toDateInput(item.date),
        startTime: item.startTime || "",
        endTime: item.endTime || "",
        title: item.title || "",
        description: item.description || "",
        image: item.image || "",
      }))
    : [];

  return {
    title: event.title || "",
    category: event.category || "",
    description: event.description || "",
    startDate: toDateInput(event.startDate || event.date),
    endDate: toDateInput(event.endDate || event.startDate || event.date),
    startTime: event.startTime || "",
    endTime: event.endTime || "",
    location: event.location || event.venue || "",
    organizer: event.organizer || "",
    image: event.image || "",
    schedule,
  };
}

function toDateInput(value) {
  if (!value) return "";
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.valueOf())) return "";

  const offsetDate = new Date(
    parsed.getTime() - parsed.getTimezoneOffset() * 60 * 1000
  );

  return offsetDate.toISOString().slice(0, 10);
}

export default function EventCreateModal({
  isOpen,
  onClose,
  onCreate,
  onUpdate,
  event,
  mode = "create",
}) {
  const isEditMode = mode === "edit";
  const initialForm = isEditMode && event ? eventToForm(event) : emptyForm;
  const [form, setForm] = useState(initialForm);
  const [scheduleDays, setScheduleDays] = useState(initialForm.schedule.length);
  const [submitting, setSubmitting] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [error, setError] = useState("");

  const errors = useMemo(() => validateForm(form), [form]);
  const canSubmit = Object.keys(errors).length === 0;

  if (!isOpen) return null;

  const updateField = (field, value) => {
    setForm((current) => {
      const next = { ...current, [field]: value };

      if (field === "startDate" && next.endDate && next.endDate < value) {
        next.endDate = value;
      }

      if (
        (field === "startDate" || field === "endDate" || field === "startTime") &&
        next.startDate &&
        next.endDate &&
        next.startDate === next.endDate &&
        next.startTime &&
        next.endTime &&
        next.endTime < next.startTime
      ) {
        next.endTime = next.startTime;
      }

      if (field === "startDate" || field === "endDate") {
        next.schedule = next.schedule.map((item) => {
          if (!item.date) return item;
          if (next.startDate && item.date < next.startDate) {
            return { ...item, date: next.startDate };
          }
          if (next.endDate && item.date > next.endDate) {
            return { ...item, date: next.endDate };
          }
          return item;
        });
      }

      return next;
    });
  };

  const updateScheduleDayCount = (value) => {
    const nextCount = Math.max(0, Math.min(14, Number(value) || 0));
    setScheduleDays(nextCount);
    setForm((current) => ({
      ...current,
      schedule: createScheduleRows(nextCount, current.schedule),
    }));
  };

  const updateSchedule = (index, field, value) => {
    setForm((current) => ({
      ...current,
      schedule: current.schedule.map((item, itemIndex) =>
        itemIndex === index
          ? normalizeScheduleRow({ ...item, [field]: value })
          : item
      ),
    }));
  };

  const handleImageChange = async ({ file, maxSizeMb, maxWidth, onLoad }) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }

    try {
      const image = await compressImage(file, {
        maxBytes: maxSizeMb * 1024 * 1024,
        maxWidth,
      });
      onLoad(image);
      setError("");
    } catch (imageError) {
      setError(imageError.message || "Image could not be processed.");
    }
  };

  const resetAndClose = () => {
    setForm(emptyForm);
    setScheduleDays(0);
    setSubmitAttempted(false);
    setError("");
    setSubmitting(false);
    onClose();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitAttempted(true);
    setError("");

    if (!canSubmit) {
      setError("Please fix the highlighted fields.");
      return;
    }

    try {
      setSubmitting(true);
      if (isEditMode) {
        await onUpdate(form);
      } else {
        await onCreate(form);
      }
      resetAndClose();
    } catch (createError) {
      setError(
        createError.message ||
          `Failed to ${isEditMode ? "update" : "create"} event.`
      );
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-5">
      <div
        className="absolute inset-0 bg-black/55 backdrop-blur-sm"
        onClick={resetAndClose}
      />

      <form
        onSubmit={handleSubmit}
        className="relative flex max-h-[94svh] w-full max-w-5xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl sm:rounded-2xl"
      >
        <header className="flex shrink-0 items-start justify-between gap-4 bg-black px-4 py-4 text-white sm:px-7 sm:py-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-yellow-400">
              {isEditMode ? "Edit Event" : "New Event"}
            </p>
            <h2 className="mt-1 font-playfair text-2xl font-bold sm:text-3xl">
              {isEditMode ? "Update Event" : "Create Event"}
            </h2>
          </div>
          <button
            type="button"
            onClick={resetAndClose}
            className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-yellow-400 hover:text-black sm:h-11 sm:w-11"
            aria-label={`Close ${isEditMode ? "edit" : "create"} event form`}
          >
            <IoMdClose size={24} />
          </button>
        </header>

        <div className="overflow-y-auto p-4 sm:p-7">
          {error && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {error}
            </div>
          )}

          <div className="grid gap-5 lg:grid-cols-[1fr_300px]">
            <section className="space-y-5">
              <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                  label="Title"
                  required
                  maxLength={LIMITS.title}
                  value={form.title}
                  error={fieldError(errors, submitAttempted, "title")}
                  onChange={(value) => updateField("title", value)}
                  placeholder="UST Innovation Summit 2026"
                />
                <TextField
                  label="Category"
                  required
                  maxLength={LIMITS.category}
                  value={form.category}
                  error={fieldError(errors, submitAttempted, "category")}
                  onChange={(value) => updateField("category", value)}
                  placeholder="Academic"
                />
              </div>

              <TextArea
                label="Description"
                required
                maxLength={LIMITS.description}
                value={form.description}
                error={fieldError(errors, submitAttempted, "description")}
                onChange={(value) => updateField("description", value)}
                placeholder="Describe what students and staff should know about this event."
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                  type="date"
                  label="Start Date"
                  required
                  value={form.startDate}
                  error={fieldError(errors, submitAttempted, "startDate")}
                  onChange={(value) => updateField("startDate", value)}
                />
                <TextField
                  type="date"
                  label="End Date"
                  required
                  value={form.endDate}
                  min={form.startDate}
                  error={fieldError(errors, submitAttempted, "endDate")}
                  onChange={(value) => updateField("endDate", value)}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                  type="time"
                  label="Start Time"
                  value={form.startTime}
                  onChange={(value) => updateField("startTime", value)}
                />
                <TextField
                  type="time"
                  label="End Time"
                  value={form.endTime}
                  min={
                    form.startDate &&
                    form.endDate &&
                    form.startDate === form.endDate
                      ? form.startTime
                      : undefined
                  }
                  error={fieldError(errors, submitAttempted, "endTime")}
                  onChange={(value) => updateField("endTime", value)}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                  label="Location"
                  required
                  maxLength={LIMITS.location}
                  value={form.location}
                  error={fieldError(errors, submitAttempted, "location")}
                  onChange={(value) => updateField("location", value)}
                  placeholder="Thomas Aquinas Research Complex"
                />
                <TextField
                  label="Organizer"
                  required
                  maxLength={LIMITS.organizer}
                  value={form.organizer}
                  error={fieldError(errors, submitAttempted, "organizer")}
                  onChange={(value) => updateField("organizer", value)}
                  placeholder="UST Innovation Office"
                />
              </div>
            </section>

            <aside className="space-y-4">
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 sm:rounded-2xl sm:p-5">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">
                  Event Photo
                </p>
                <ImagePreview image={form.image} emptyText="One image only" />
                <ImagePicker
                  label="Choose Photo"
                  onChange={(file) =>
                    handleImageChange({
                      file,
                      maxSizeMb: 2,
                      maxWidth: 1280,
                      onLoad: (image) => updateField("image", image),
                    })
                  }
                />
                {form.image && (
                  <button
                    type="button"
                    onClick={() => updateField("image", "")}
                    className="mt-2 w-full text-xs font-bold text-gray-500 hover:text-black"
                  >
                    Remove photo
                  </button>
                )}
              </div>

              <div className="rounded-xl border border-yellow-300 bg-[#fffbe8] p-4 sm:rounded-2xl sm:p-5">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-yellow-700">
                  Status
                </p>
                <div className="mt-3 flex items-center justify-between rounded-xl bg-white px-4 py-3 shadow-sm">
                  <span className="text-sm font-bold text-gray-950">Published</span>
                  <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                </div>
              </div>
            </aside>
          </div>

          <section className="mt-6 rounded-xl border border-gray-100 bg-gray-50 p-4 sm:mt-7 sm:rounded-2xl sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">
                  Schedule
                </p>
                <h3 className="mt-1 font-playfair text-xl font-bold text-gray-950 sm:text-2xl">
                  Add day-by-day details
                </h3>
              </div>
              <label className="flex items-center gap-3 text-xs font-bold text-gray-600">
                Days
                <input
                  type="number"
                  min="0"
                  max="14"
                  value={scheduleDays}
                  onChange={(event) => updateScheduleDayCount(event.target.value)}
                  className="h-12 w-24 rounded-xl border border-yellow-400 bg-white px-4 text-sm font-black outline-none focus:border-yellow-500"
                />
              </label>
            </div>

            {form.schedule.length > 0 && (
              <div className="mt-5 space-y-5">
                {form.schedule.map((item, index) => (
                  <div
                    key={item.day}
                    className="rounded-2xl border border-gray-200 bg-white p-5"
                  >
                    <p className="mb-4 text-xs font-black uppercase tracking-[0.16em] text-yellow-700">
                      {item.day}
                    </p>
                    <div className="grid gap-4 lg:grid-cols-[1fr_220px]">
                      <div className="space-y-3">
                        <div className="grid gap-3 md:grid-cols-[1fr_150px_150px]">
                          <TextField
                            label="Date"
                            type="date"
                            value={item.date}
                            min={form.startDate}
                            max={form.endDate}
                            onChange={(value) => updateSchedule(index, "date", value)}
                          />
                          <TextField
                            label="Start"
                            type="time"
                            value={item.startTime}
                            onChange={(value) =>
                              updateSchedule(index, "startTime", value)
                            }
                          />
                          <TextField
                            label="End"
                            type="time"
                            value={item.endTime}
                            min={item.startTime || undefined}
                            onChange={(value) =>
                              updateSchedule(index, "endTime", value)
                            }
                          />
                        </div>
                        <div className="grid gap-3 md:grid-cols-[0.8fr_1.2fr]">
                          <TextField
                            label="Activity Title"
                            maxLength={LIMITS.scheduleTitle}
                            value={item.title}
                            onChange={(value) =>
                              updateSchedule(index, "title", value)
                            }
                            placeholder="Opening Ceremony"
                          />
                          <TextArea
                            label="Details"
                            maxLength={LIMITS.scheduleDescription}
                            value={item.description}
                            onChange={(value) =>
                              updateSchedule(index, "description", value)
                            }
                            placeholder="Optional schedule details"
                            rows={3}
                          />
                        </div>
                      </div>

                      <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-400">
                          Optional Image
                        </p>
                        <ImagePreview image={item.image} emptyText="No image" small />
                        <ImagePicker
                          label="Add Image"
                          onChange={(file) =>
                            handleImageChange({
                              file,
                              maxSizeMb: 1,
                              maxWidth: 900,
                              onLoad: (image) =>
                                updateSchedule(index, "image", image),
                            })
                          }
                        />
                        {item.image && (
                          <button
                            type="button"
                            onClick={() => updateSchedule(index, "image", "")}
                            className="mt-2 w-full text-xs font-bold text-gray-500 hover:text-black"
                          >
                            Remove image
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <footer className="flex shrink-0 flex-col gap-2 border-t border-gray-100 bg-white px-4 py-3 sm:flex-row sm:items-center sm:justify-end sm:gap-3 sm:px-7 sm:py-4">
          <button
            type="button"
            onClick={resetAndClose}
            className="h-11 rounded-xl border border-gray-300 px-6 text-xs font-black uppercase tracking-[0.14em] text-gray-600 transition-colors hover:bg-gray-50 sm:h-12"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="h-11 rounded-xl bg-black px-8 text-xs font-black uppercase tracking-[0.14em] text-white transition-colors hover:bg-yellow-400 hover:text-black disabled:cursor-not-allowed disabled:opacity-50 sm:h-12"
          >
            {submitting
              ? isEditMode
                ? "Saving..."
                : "Creating..."
              : isEditMode
                ? "Save Changes"
                : "Create Event"}
          </button>
        </footer>
      </form>
    </div>
  );
}

function validateForm(form) {
  const errors = {};

  requireText(errors, form.title, "title", "Title is required.");
  requireText(errors, form.category, "category", "Category is required.");
  requireText(errors, form.description, "description", "Description is required.");
  requireText(errors, form.location, "location", "Location is required.");
  requireText(errors, form.organizer, "organizer", "Organizer is required.");

  maxText(errors, form.title, "title", LIMITS.title);
  maxText(errors, form.category, "category", LIMITS.category);
  maxText(errors, form.description, "description", LIMITS.description);
  maxText(errors, form.location, "location", LIMITS.location);
  maxText(errors, form.organizer, "organizer", LIMITS.organizer);

  if (!form.startDate) errors.startDate = "Start date is required.";
  if (!form.endDate) errors.endDate = "End date is required.";
  if (form.startDate && form.endDate && new Date(form.endDate) < new Date(form.startDate)) {
    errors.endDate = "End date cannot be before start date.";
  }
  if (
    form.startDate &&
    form.endDate &&
    form.startDate === form.endDate &&
    form.startTime &&
    form.endTime &&
    form.endTime < form.startTime
  ) {
    errors.endTime = "End time cannot be before start time.";
  }

  return errors;
}

function normalizeScheduleRow(row) {
  const next = { ...row };

  if (next.startTime && next.endTime && next.endTime < next.startTime) {
    next.endTime = next.startTime;
  }

  return next;
}

function requireText(errors, value, field, message) {
  if (!value.trim()) errors[field] = message;
}

function maxText(errors, value, field, maxLength) {
  if (value.length > maxLength) {
    errors[field] = `Maximum ${maxLength} characters.`;
  }
}

function fieldError(errors, submitAttempted, field) {
  return submitAttempted ? errors[field] : "";
}

function RequiredMark() {
  return <span className="text-red-600">*</span>;
}

function FieldShell({ label, required, error, count, maxLength, children }) {
  return (
    <label className="block">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[10px] font-black uppercase tracking-[0.16em] text-gray-400">
          {label} {required && <RequiredMark />}
        </span>
        {maxLength && (
          <span className="text-[10px] font-bold text-gray-400">
            {count}/{maxLength}
          </span>
        )}
      </div>
      {children}
      {error && <p className="mt-1 text-xs font-semibold text-red-600">{error}</p>}
    </label>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  required = false,
  maxLength,
  error,
  min,
  max,
}) {
  return (
    <FieldShell
      label={label}
      required={required}
      error={error}
      count={value.length}
      maxLength={maxLength}
    >
      <input
        type={type}
        value={value}
        maxLength={maxLength}
        min={min}
        max={max}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={`mt-1 h-12 w-full rounded-xl border bg-white px-4 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-300 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100 ${
          error ? "border-red-400" : "border-gray-200"
        }`}
      />
    </FieldShell>
  );
}

function TextArea({
  label,
  value,
  onChange,
  placeholder,
  required = false,
  rows = 5,
  maxLength,
  error,
}) {
  return (
    <FieldShell
      label={label}
      required={required}
      error={error}
      count={value.length}
      maxLength={maxLength}
    >
      <textarea
        value={value}
        maxLength={maxLength}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={`mt-1 w-full resize-y rounded-xl border bg-white px-4 py-3 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-300 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100 ${
          error ? "border-red-400" : "border-gray-200"
        }`}
      />
    </FieldShell>
  );
}

function ImagePreview({ image, emptyText, small = false }) {
  return (
    <div
      className={`mt-3 overflow-hidden rounded-xl border border-gray-200 bg-white ${
        small ? "aspect-video" : "aspect-video"
      }`}
    >
      {image ? (
        <img src={image} alt="" className="h-full w-full object-cover" />
      ) : (
        <div className="grid h-full place-items-center text-center text-xs font-semibold text-gray-400">
          {emptyText}
        </div>
      )}
    </div>
  );
}

function ImagePicker({ label, onChange }) {
  return (
    <label className="mt-3 block h-11 cursor-pointer rounded-xl bg-black px-4 py-3 text-center text-xs font-black uppercase tracking-[0.14em] text-white transition-colors hover:bg-yellow-400 hover:text-black">
      {label}
      <input
        type="file"
        accept="image/*"
        onChange={(event) => onChange(event.target.files?.[0])}
        className="hidden"
      />
    </label>
  );
}

function compressImage(file, { maxBytes, maxWidth }) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("Image could not be read."));
    reader.onload = () => {
      const image = new Image();

      image.onerror = () => reject(new Error("Image could not be loaded."));
      image.onload = () => {
        const scale = Math.min(1, maxWidth / image.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(image.width * scale));
        canvas.height = Math.max(1, Math.round(image.height * scale));

        const context = canvas.getContext("2d");
        context.drawImage(image, 0, 0, canvas.width, canvas.height);

        const outputType = supportsWebP() ? "image/webp" : "image/jpeg";
        let quality = 0.82;
        let dataUrl = canvas.toDataURL(outputType, quality);

        while (dataUrl.length > maxBytes && quality > 0.45) {
          quality -= 0.08;
          dataUrl = canvas.toDataURL(outputType, quality);
        }

        if (dataUrl.length > maxBytes) {
          reject(
            new Error(
              `Image is still too large after compression. Please choose a smaller image.`
            )
          );
          return;
        }

        resolve(dataUrl);
      };

      image.src = reader.result;
    };

    reader.readAsDataURL(file);
  });
}

function supportsWebP() {
  const canvas = document.createElement("canvas");
  canvas.width = 1;
  canvas.height = 1;

  return canvas.toDataURL("image/webp").startsWith("data:image/webp");
}
