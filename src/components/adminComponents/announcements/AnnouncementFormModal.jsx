import { useMemo, useState } from "react";
import { IoMdClose } from "react-icons/io";

const LIMITS = {
  title: 140,
  content: 1200,
  category: 80,
  eventTitle: 140,
};

const emptyForm = {
  title: "",
  content: "",
  type: "general",
  eventTitle: "",
  category: "",
  priority: "medium",
  image: "",
};

function announcementToForm(announcement) {
  return {
    title: announcement.title || "",
    content: announcement.content || announcement.caption || "",
    type: announcement.type || "general",
    eventTitle: announcement.eventTitle || "",
    category: announcement.category || "",
    priority: announcement.priority || "medium",
    image:
      announcement.image ||
      announcement.imageUrl ||
      announcement.bannerImage ||
      "",
  };
}

export default function AnnouncementFormModal({
  isOpen,
  onClose,
  onCreate,
  onUpdate,
  announcement,
  mode = "create",
}) {
  const isEditMode = mode === "edit";
  const initialForm =
    isEditMode && announcement ? announcementToForm(announcement) : emptyForm;
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitAttempted, setSubmitAttempted] = useState(false);
  const [error, setError] = useState("");

  const errors = useMemo(() => validateForm(form), [form]);
  const canSubmit = Object.keys(errors).length === 0;

  if (!isOpen) return null;

  const updateField = (field, value) => {
    setForm((current) => {
      const next = { ...current, [field]: value };

      if (field === "type" && value === "general") {
        next.eventTitle = "";
      }

      return next;
    });
  };

  const resetAndClose = () => {
    setForm(emptyForm);
    setSubmitAttempted(false);
    setError("");
    setSubmitting(false);
    onClose();
  };

  const handleImageChange = async (file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please choose an image file.");
      return;
    }

    try {
      const image = await compressImage(file, {
        maxBytes: 2 * 1024 * 1024,
        maxWidth: 1280,
      });
      updateField("image", image);
      setError("");
    } catch (imageError) {
      setError(imageError.message || "Image could not be processed.");
    }
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
    } catch (submitError) {
      setError(
        submitError.message ||
          `Failed to ${isEditMode ? "update" : "create"} announcement.`
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
              {isEditMode ? "Edit Announcement" : "New Announcement"}
            </p>
            <h2 className="mt-1 font-playfair text-2xl font-bold sm:text-3xl">
              {isEditMode ? "Update Announcement" : "Create Announcement"}
            </h2>
          </div>
          <button
            type="button"
            onClick={resetAndClose}
            className="grid h-10 w-10 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-yellow-400 hover:text-black sm:h-11 sm:w-11"
            aria-label={`Close ${isEditMode ? "edit" : "create"} announcement form`}
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
                  placeholder="University-Wide Fire Drill Notice"
                />
                <SelectField
                  label="Type"
                  required
                  value={form.type}
                  onChange={(value) => updateField("type", value)}
                  options={[
                    { value: "general", label: "General" },
                    { value: "event", label: "Event" },
                  ]}
                />
              </div>

              <TextArea
                label="Content"
                required
                maxLength={LIMITS.content}
                value={form.content}
                error={fieldError(errors, submitAttempted, "content")}
                onChange={(value) => updateField("content", value)}
                placeholder="Write the announcement details students and staff should know."
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <TextField
                  label="Event Title"
                  required={form.type === "event"}
                  disabled={form.type !== "event"}
                  maxLength={LIMITS.eventTitle}
                  value={form.eventTitle}
                  error={fieldError(errors, submitAttempted, "eventTitle")}
                  onChange={(value) => updateField("eventTitle", value)}
                  placeholder="Related event title"
                />
                <TextField
                  label="Category"
                  maxLength={LIMITS.category}
                  value={form.category}
                  error={fieldError(errors, submitAttempted, "category")}
                  onChange={(value) => updateField("category", value)}
                  placeholder="Safety"
                />
              </div>

              <div className="max-w-sm">
                <SelectField
                  label="Priority"
                  value={form.priority}
                  onChange={(value) => updateField("priority", value)}
                  options={[
                    { value: "low", label: "Low" },
                    { value: "medium", label: "Medium" },
                    { value: "high", label: "High" },
                  ]}
                />
              </div>
            </section>

            <aside className="space-y-4">
              <div className="rounded-xl border border-gray-100 bg-gray-50 p-4 sm:rounded-2xl sm:p-5">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">
                  Announcement Photo
                </p>
                <ImagePreview image={form.image} />
                <label className="mt-3 block h-11 cursor-pointer rounded-xl bg-black px-4 py-3 text-center text-xs font-black uppercase tracking-[0.14em] text-white transition-colors hover:bg-yellow-400 hover:text-black">
                  Choose Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(event) => handleImageChange(event.target.files?.[0])}
                    className="hidden"
                  />
                </label>
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
                  <span className="text-sm font-bold text-gray-950">
                    Published
                  </span>
                  <span className="h-2.5 w-2.5 rounded-full bg-green-500" />
                </div>
                <p className="mt-3 text-xs leading-5 text-gray-600">
                  Admin attribution is added automatically.
                </p>
              </div>
            </aside>
          </div>
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
                : "Create Announcement"}
          </button>
        </footer>
      </form>
    </div>
  );
}

function validateForm(form) {
  const errors = {};

  requireText(errors, form.title, "title", "Title is required.");
  requireText(errors, form.content, "content", "Content is required.");

  if (form.type === "event") {
    requireText(
      errors,
      form.eventTitle,
      "eventTitle",
      "Event title is required."
    );
  }

  maxText(errors, form.title, "title", LIMITS.title);
  maxText(errors, form.content, "content", LIMITS.content);
  maxText(errors, form.eventTitle, "eventTitle", LIMITS.eventTitle);
  maxText(errors, form.category, "category", LIMITS.category);

  return errors;
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
  required = false,
  maxLength,
  error,
  disabled = false,
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
        type="text"
        value={value}
        maxLength={maxLength}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className={`mt-1 h-12 w-full rounded-xl border bg-white px-4 text-sm text-gray-900 outline-none transition-colors placeholder:text-gray-300 focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100 disabled:cursor-not-allowed disabled:bg-gray-100 ${
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
  rows = 7,
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

function SelectField({ label, value, onChange, options, required = false }) {
  return (
    <FieldShell label={label} required={required}>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-1 h-12 w-full rounded-xl border border-gray-200 bg-white px-4 text-sm font-semibold text-gray-900 outline-none transition-colors focus:border-yellow-500 focus:ring-2 focus:ring-yellow-100"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

function ImagePreview({ image }) {
  return (
    <div className="mt-3 aspect-video overflow-hidden rounded-xl border border-gray-200 bg-white">
      {image ? (
        <img src={image} alt="" className="h-full w-full object-cover" />
      ) : (
        <div className="grid h-full place-items-center text-center text-xs font-semibold text-gray-400">
          Optional image
        </div>
      )}
    </div>
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
              "Image is still too large after compression. Please choose a smaller image."
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
