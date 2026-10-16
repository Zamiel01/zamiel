"use client";

import Image from "next/image";
import {
  addDoc,
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import {
  ChangeEvent,
  DragEvent,
  FormEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  cloudinaryCloudName,
  cloudinaryUploadPreset,
  getMemoriesDb,
  hasCloudinaryConfig,
  hasFirebaseConfig,
  isCloudinaryImageUrl,
} from "@/lib/memories";
import styles from "./memories.module.css";

const MAX_FILE_SIZE = 10 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
]);

const CATEGORY_OPTIONS = [
  { value: "hackathons", label: "Hackathons" },
  { value: "friends", label: "Friends" },
  { value: "family", label: "Family" },
  { value: "events", label: "Events" },
] as const;

type MemoryCategory = (typeof CATEGORY_OPTIONS)[number]["value"];
type CategoryFilter = "all" | MemoryCategory;

const CATEGORY_FILTERS: { value: CategoryFilter; label: string }[] = [
  { value: "all", label: "All" },
  ...CATEGORY_OPTIONS,
];

type Photo = {
  id: string;
  url: string;
  publicId: string;
  title?: string;
  category: MemoryCategory | null;
  width: number;
  height: number;
  bytes: number;
  format: string;
  createdAt: Timestamp;
};

type UploadStatus = "queued" | "uploading" | "saved" | "invalid" | "error";

type UploadItem = {
  id: string;
  file: File;
  previewUrl: string;
  title: string;
  category: MemoryCategory | "";
  categoryError: boolean;
  status: UploadStatus;
  progress: number;
  message: string;
};

type CloudinaryResponse = {
  secure_url?: unknown;
  public_id?: unknown;
  width?: unknown;
  height?: unknown;
  bytes?: unknown;
  format?: unknown;
  error?: { message?: string };
};

function parsePhoto(id: string, value: Record<string, unknown>): Photo | null {
  const {
    url,
    publicId,
    title,
    category,
    width,
    height,
    bytes,
    format,
    createdAt,
  } = value;
  if (
    !isCloudinaryImageUrl(url) ||
    typeof publicId !== "string" ||
    (category !== undefined &&
      !CATEGORY_OPTIONS.some((option) => option.value === category)) ||
    typeof width !== "number" ||
    typeof height !== "number" ||
    typeof bytes !== "number" ||
    typeof format !== "string" ||
    (title !== undefined &&
      (typeof title !== "string" || title.length > 120)) ||
    !(createdAt instanceof Timestamp)
  ) {
    return null;
  }

  return {
    id,
    url,
    publicId,
    title: typeof title === "string" ? title : undefined,
    category:
      CATEGORY_OPTIONS.find((option) => option.value === category)?.value ??
      null,
    width,
    height,
    bytes,
    format,
    createdAt,
  };
}

function makeUploadItem(file: File, index: number): UploadItem {
  let message = "";
  let status: UploadStatus = "queued";

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    status = "invalid";
    message = "Choose a JPEG, PNG, WebP, GIF, or AVIF image.";
  } else if (file.size > MAX_FILE_SIZE) {
    status = "invalid";
    message = "This photo is over the 10 MB limit.";
  }

  return {
    id: `${file.name}-${file.lastModified}-${index}-${crypto.randomUUID()}`,
    file,
    previewUrl: URL.createObjectURL(file),
    title: "",
    category: "",
    categoryError: false,
    status,
    progress: 0,
    message,
  };
}

function uploadToCloudinary(
  file: File,
  onProgress: (progress: number) => void
): Promise<CloudinaryResponse> {
  return new Promise((resolve, reject) => {
    const request = new XMLHttpRequest();
    request.open(
      "POST",
      `https://api.cloudinary.com/v1_1/${encodeURIComponent(
        cloudinaryCloudName
      )}/image/upload`
    );
    request.responseType = "json";
    request.timeout = 120_000;
    request.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };
    request.onload = () => {
      const response = request.response as CloudinaryResponse | null;
      if (request.status >= 200 && request.status < 300 && response) {
        resolve(response);
      } else {
        reject(
          new Error(
            response?.error?.message ??
              `Cloudinary returned an upload error (${request.status}).`
          )
        );
      }
    };
    request.onerror = () =>
      reject(new Error("Network error while sending the photo to Cloudinary."));
    request.ontimeout = () =>
      reject(new Error("The photo upload timed out. Please try again."));

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", cloudinaryUploadPreset);
    request.send(formData);
  });
}

function formatDate(timestamp: Timestamp): string {
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    year: "numeric",
  }).format(timestamp.toDate());
}

function getPhotoTitle(photo: Photo): string {
  return photo.title?.trim() || `Memory from ${formatDate(photo.createdAt)}`;
}

export default function MemoriesGallery() {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [galleryError, setGalleryError] = useState("");
  const [malformedCount, setMalformedCount] = useState(0);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [items, setItems] = useState<UploadItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadNotice, setUploadNotice] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<CategoryFilter>("all");
  const [activePhoto, setActivePhoto] = useState<Photo | null>(null);
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadDialogRef = useRef<HTMLElement>(null);
  const lightboxRef = useRef<HTMLDivElement>(null);
  const uploadTriggerRef = useRef<HTMLElement | null>(null);
  const lightboxTriggerRef = useRef<HTMLElement | null>(null);
  const previewUrlsRef = useRef(new Set<string>());
  const uploadingRef = useRef(uploading);
  uploadingRef.current = uploading;

  const closeUpload = useCallback(() => {
    if (uploadingRef.current) return;
    setUploadOpen(false);
    setItems([]);
    setUploadNotice("");
    previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    previewUrlsRef.current.clear();
  }, []);

  useEffect(
    () => () => {
      previewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      previewUrlsRef.current.clear();
    },
    []
  );

  useEffect(() => {
    if (!hasFirebaseConfig) {
      setGalleryError(
        "The public gallery is not connected yet. Add NEXT_PUBLIC_FIREBASE_API_KEY and NEXT_PUBLIC_FIREBASE_PROJECT_ID to the deployment environment."
      );
      setLoading(false);
      return;
    }

    try {
      const db = getMemoriesDb();
      const galleryQuery = query(
        collection(db, "memories"),
        orderBy("createdAt", "desc"),
        limit(120)
      );

      return onSnapshot(
        galleryQuery,
        (snapshot) => {
          const parsed = snapshot.docs
            .map((document) =>
              parsePhoto(document.id, document.data() as Record<string, unknown>)
            )
            .filter((photo): photo is Photo => photo !== null);
          setPhotos(parsed);
          setMalformedCount(snapshot.size - parsed.length);
          setGalleryError("");
          setLoading(false);
        },
        (error) => {
          const details =
            error.code === "permission-denied"
              ? "Firestore denied the gallery read. Deploy firestore.rules and confirm the database is enabled."
              : error.message || "The gallery could not be loaded.";
          setGalleryError(details);
          setLoading(false);
        }
      );
    } catch (error) {
      setGalleryError(
        error instanceof Error
          ? error.message
          : "Firebase could not connect to the public gallery."
      );
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!uploadOpen) return;

    uploadTriggerRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    uploadDialogRef.current
      ?.querySelector<HTMLElement>("button:not([disabled])")
      ?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (!uploadDialogRef.current) return;
      if (event.key === "Escape" && !uploadingRef.current) {
        event.preventDefault();
        closeUpload();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = Array.from(
        uploadDialogRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )
      );
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      uploadTriggerRef.current?.focus();
      uploadTriggerRef.current = null;
    };
  }, [closeUpload, uploadOpen]);

  useEffect(() => {
    if (!activePhoto) return;

    lightboxTriggerRef.current =
      document.activeElement instanceof HTMLElement
        ? document.activeElement
        : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    lightboxRef.current
      ?.querySelector<HTMLElement>("button:not([disabled])")
      ?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setActivePhoto(null);
        return;
      }
      if (event.key !== "Tab" || !lightboxRef.current) return;
      event.preventDefault();
      lightboxRef.current
        .querySelector<HTMLElement>("button:not([disabled])")
        ?.focus();
    };

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      lightboxTriggerRef.current?.focus();
      lightboxTriggerRef.current = null;
    };
  }, [activePhoto]);

  const addFiles = useCallback((files: FileList | File[]) => {
    const selected = Array.from(files);
    if (!selected.length) return;
    const newItems = selected.map((file, index) =>
      makeUploadItem(file, items.length + index)
    );
    newItems.forEach((item) => previewUrlsRef.current.add(item.previewUrl));
    setItems((current) => [
      ...current,
      ...newItems,
    ]);
    setUploadNotice("");
  }, [items.length]);

  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) addFiles(event.target.files);
    event.target.value = "";
  };

  const onDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (event.dataTransfer.files) addFiles(event.dataTransfer.files);
  };

  const onUpload = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!hasFirebaseConfig || !hasCloudinaryConfig || uploading) return;

    const queue = items.filter((item) => item.status === "queued");
    if (!queue.length) {
      setUploadNotice("Choose at least one valid photo before uploading.");
      return;
    }

    if (queue.some((item) => !item.category)) {
      setItems((current) =>
        current.map((item) =>
          item.status === "queued" && !item.category
            ? { ...item, categoryError: true }
            : item
        )
      );
      setUploadNotice("Choose a category for every photo before uploading.");
      return;
    }

    setUploading(true);
    setUploadNotice("");
    let savedCount = 0;
    let errorCount = 0;

    for (const item of queue) {
      setItems((current) =>
        current.map((entry) =>
          entry.id === item.id
            ? { ...entry, status: "uploading", progress: 0, message: "" }
            : entry
        )
      );

      try {
        const response = await uploadToCloudinary(item.file, (progress) => {
          setItems((current) =>
            current.map((entry) =>
              entry.id === item.id ? { ...entry, progress } : entry
            )
          );
        });

        if (
          !isCloudinaryImageUrl(response.secure_url) ||
          typeof response.public_id !== "string" ||
          typeof response.width !== "number" ||
          typeof response.height !== "number" ||
          typeof response.bytes !== "number" ||
          typeof response.format !== "string" ||
          response.bytes > MAX_FILE_SIZE
        ) {
          throw new Error(
            "Cloudinary returned an incomplete or unexpected image response."
          );
        }

        try {
          await addDoc(collection(getMemoriesDb(), "memories"), {
            url: response.secure_url,
            publicId: response.public_id,
            ...(item.title.trim() ? { title: item.title.trim() } : {}),
            category: item.category,
            width: response.width,
            height: response.height,
            bytes: response.bytes,
            format: response.format.toLowerCase(),
            createdAt: serverTimestamp(),
          });
          savedCount += 1;
          setItems((current) =>
            current.map((entry) =>
              entry.id === item.id
                ? { ...entry, status: "saved", progress: 100, message: "Added to the gallery." }
                : entry
            )
          );
        } catch (error) {
          throw new Error(
            `The photo reached Cloudinary but could not be added to the gallery: ${
              error instanceof Error ? error.message : "Firestore write failed."
            }`
          );
        }
      } catch (error) {
        errorCount += 1;
        setItems((current) =>
          current.map((entry) =>
            entry.id === item.id
              ? {
                  ...entry,
                  status: "error",
                  message:
                    error instanceof Error
                      ? error.message
                      : "The photo could not be uploaded. Please try again.",
                }
              : entry
          )
        );
      }
    }

    setUploading(false);
    if (savedCount && !errorCount) {
      setUploadNotice(
        `${savedCount} ${savedCount === 1 ? "photo" : "photos"} added to the gallery.`
      );
    } else if (savedCount) {
      setUploadNotice(
        `${savedCount} photo${savedCount === 1 ? "" : "s"} added. Check the file messages for anything that needs another try.`
      );
    } else {
      setUploadNotice(
        "No photos were added. Review the error beside each file and try again."
      );
    }
  };

  const removeItem = (id: string) => {
    setItems((current) => {
      const removed = current.find((item) => item.id === id);
      if (removed && previewUrlsRef.current.delete(removed.previewUrl)) {
        URL.revokeObjectURL(removed.previewUrl);
      }
      return current.filter((item) => item.id !== id);
    });
  };

  const markImageFailed = (id: string) => {
    setFailedImages((current) => new Set(current).add(id));
  };

  const filteredPhotos =
    selectedCategory === "all"
      ? photos
      : photos.filter((photo) => photo.category === selectedCategory);
  const selectedCategoryLabel =
    CATEGORY_FILTERS.find((filter) => filter.value === selectedCategory)
      ?.label ?? "All";

  return (
    <section className={styles.gallerySection} aria-label="Photo gallery">
      <div className={styles.galleryToolbar}>
        <div className={styles.galleryLabel}>
          <span className={styles.sectionIndex}>THE COLLECTION</span>
          <p>
            {loading
              ? "Finding the moments…"
              : galleryError
                ? "Gallery connection needed"
                : `${photos.length} ${photos.length === 1 ? "moment" : "moments"}`}
          </p>
        </div>
        <button
          className={styles.uploadButton}
          type="button"
          onClick={() => {
            setUploadOpen(true);
            setUploadNotice("");
          }}
          disabled={!hasFirebaseConfig || !hasCloudinaryConfig || Boolean(galleryError)}
        >
          <span aria-hidden="true">+</span>
          Add a memory
        </button>
      </div>

      {!hasCloudinaryConfig && (
        <p className={styles.configNotice} role="status">
          Photo uploads are unavailable until NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and
          NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET are configured.
        </p>
      )}

      {galleryError ? (
        <div className={styles.statePanel} role="alert">
          <span className={styles.stateMark} aria-hidden="true">
            !
          </span>
          <h2>Not connected just yet</h2>
          <p>{galleryError}</p>
          <p className={styles.stateHint}>
            Set the Firebase client configuration, enable Cloud Firestore, and
            deploy the included gallery rules to make the public collection
            available.
          </p>
        </div>
      ) : loading ? (
        <div className={styles.loadingGrid} aria-label="Loading photos">
          {[0, 1, 2, 3].map((item) => (
            <div className={styles.loadingTile} key={item} />
          ))}
        </div>
      ) : photos.length ? (
        <>
          <nav className={styles.categoryFilters} aria-label="Filter memories">
            {CATEGORY_FILTERS.map((filter) => {
              const count =
                filter.value === "all"
                  ? photos.length
                  : photos.filter((photo) => photo.category === filter.value)
                      .length;
              return (
                <button
                  className={styles.categoryTab}
                  type="button"
                  key={filter.value}
                  aria-pressed={selectedCategory === filter.value}
                  onClick={() => setSelectedCategory(filter.value)}
                >
                  {filter.label}
                  <span className={styles.categoryCount}>{count}</span>
                </button>
              );
            })}
          </nav>
          {malformedCount > 0 && (
            <p className={styles.configNotice} role="status">
              {malformedCount} gallery entr{malformedCount === 1 ? "y was" : "ies were"}{" "}
              skipped because its image details are invalid.
            </p>
          )}
          {filteredPhotos.length ? (
            <div className={styles.photoGrid}>
              {filteredPhotos.map((photo) => {
                const photoTitle = getPhotoTitle(photo);
                return (
                  <article className={styles.photoItem} key={photo.id}>
                    <button
                      className={styles.photoButton}
                      type="button"
                      onClick={() => setActivePhoto(photo)}
                      aria-label={`View ${photoTitle}`}
                    >
                      {failedImages.has(photo.id) ? (
                        <span className={styles.brokenImage}>
                          This image is no longer available.
                        </span>
                      ) : (
                        <Image
                          src={photo.url.replace(
                            "/image/upload/",
                            "/image/upload/f_auto,q_auto,w_1400,c_limit/"
                          )}
                          alt={photoTitle}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 980px) 50vw, 33vw"
                          unoptimized
                          onError={() => markImageFailed(photo.id)}
                        />
                      )}
                      <span className={styles.photoOverlay} aria-hidden="true">
                        <span>{formatDate(photo.createdAt)}</span>
                        <span className={styles.viewMark}>↗</span>
                      </span>
                    </button>
                    <div className={styles.photoMeta}>
                      <div className={styles.photoCaption}>
                        <p className={styles.photoTitle}>{photoTitle}</p>
                        <p className={styles.photoDate}>
                          {formatDate(photo.createdAt)}
                        </p>
                        <p className={styles.photoCategory}>
                          {CATEGORY_OPTIONS.find(
                            (option) => option.value === photo.category
                          )?.label ?? "Uncategorized"}
                        </p>
                      </div>
                      <div
                        className={styles.photoActions}
                        aria-label={`Manage ${photoTitle}`}
                      >
                        <button
                          type="button"
                          className={styles.photoAction}
                          disabled
                          title="Photo editing is unavailable on this static gallery."
                          aria-label={`Edit title for ${photoTitle}`}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className={`${styles.photoAction} ${styles.deleteAction}`}
                          disabled
                          title="Photo deletion is unavailable on this static gallery."
                          aria-label={`Delete ${photoTitle}`}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className={styles.filteredEmptyState}>
              <p className={styles.emptyEyebrow}>
                NO {selectedCategoryLabel.toUpperCase()} MEMORIES YET
              </p>
              <h2>This part of the story is still unwritten.</h2>
              <p>
                Add a photo and choose {selectedCategoryLabel.toLowerCase()} for
                its category to see it here.
              </p>
              <button
                type="button"
                className={styles.emptyButton}
                onClick={() => {
                  setUploadOpen(true);
                  setUploadNotice("");
                }}
                disabled={!hasFirebaseConfig || !hasCloudinaryConfig}
              >
                Add a memory <span aria-hidden="true">↗</span>
              </button>
            </div>
          )}
        </>
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyArtwork} aria-hidden="true">
            <span className={styles.artFrame} />
            <span className={styles.artSun} />
            <span className={styles.artHorizon} />
            <span className={styles.artDot}>✳</span>
          </div>
          <p className={styles.emptyEyebrow}>A FRESH ROLL</p>
          <h2>The first moment is yours.</h2>
          <p>
            A favorite memory, a day out, a little win — add a photo and start
            this collection.
          </p>
          <button
            type="button"
            className={styles.emptyButton}
            onClick={() => setUploadOpen(true)}
            disabled={!hasFirebaseConfig || !hasCloudinaryConfig}
          >
            Add the first photo <span aria-hidden="true">↗</span>
          </button>
        </div>
      )}

      {uploadOpen && (
        <div
          className={styles.dialogBackdrop}
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !uploading) {
              closeUpload();
            }
          }}
        >
          <section
            ref={uploadDialogRef}
            className={styles.uploadDialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="upload-title"
          >
            <div className={styles.dialogHeader}>
              <div>
                <p className={styles.sectionIndex}>ADD TO THE COLLECTION</p>
                <h2 id="upload-title">Share a moment.</h2>
              </div>
              <button
                type="button"
                className={styles.closeButton}
                onClick={closeUpload}
                disabled={uploading}
                aria-label="Close upload dialog"
              >
                ×
              </button>
            </div>
            <form onSubmit={onUpload}>
              <div
                className={styles.dropZone}
                onDragOver={(event) => event.preventDefault()}
                onDrop={onDrop}
              >
                <span className={styles.dropIcon} aria-hidden="true">
                  ↥
                </span>
                <p>Drop your photos here</p>
                <span>JPEG, PNG, WebP, GIF, or AVIF · up to 10 MB each</span>
                <button
                  type="button"
                  className={styles.browseButton}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                >
                  Browse photos
                </button>
                <input
                  ref={fileInputRef}
                  className={styles.fileInput}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                  multiple
                  onChange={onFileChange}
                  aria-label="Choose photos to upload"
                />
              </div>

              {items.length > 0 && (
                <ul className={styles.uploadList} aria-label="Selected photos">
                  {items.map((item) => (
                    <li className={styles.uploadItem} key={item.id}>
                      <span className={styles.previewThumb}>
                        <Image
                          src={item.previewUrl}
                          alt={`Preview of ${item.title.trim() || item.file.name}`}
                          fill
                          sizes="64px"
                          unoptimized
                        />
                      </span>
                      <span className={styles.fileDetails}>
                        <span className={styles.fileName}>{item.file.name}</span>
                        <input
                          className={styles.titleInput}
                          type="text"
                          value={item.title}
                          maxLength={120}
                          placeholder="Add a title (optional)"
                          aria-label={`Title for ${item.file.name}`}
                          disabled={uploading || item.status === "saved"}
                          onChange={(event) =>
                            setItems((current) =>
                              current.map((entry) =>
                                entry.id === item.id
                                  ? { ...entry, title: event.target.value }
                                  : entry
                              )
                            )
                          }
                        />
                        <label
                          className={styles.categoryFieldLabel}
                          htmlFor={`category-${item.id}`}
                        >
                          Category <span>required</span>
                        </label>
                        <select
                          id={`category-${item.id}`}
                          className={styles.categorySelect}
                          value={item.category}
                          disabled={uploading || item.status === "saved"}
                          aria-label={`Category for ${item.file.name}, required`}
                          aria-required="true"
                          aria-invalid={item.categoryError || undefined}
                          aria-describedby={
                            item.categoryError
                              ? `category-error-${item.id}`
                              : undefined
                          }
                          onChange={(event) =>
                            setItems((current) =>
                              current.map((entry) =>
                                entry.id === item.id
                                  ? {
                                      ...entry,
                                      category: event.target.value as
                                        | MemoryCategory
                                        | "",
                                      categoryError: false,
                                    }
                                  : entry
                              )
                            )
                          }
                        >
                          <option value="">Choose a category</option>
                          {CATEGORY_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                        {item.categoryError && (
                          <span
                            className={styles.fileError}
                            id={`category-error-${item.id}`}
                          >
                            Choose a category before uploading this photo.
                          </span>
                        )}
                        <span
                          className={
                            item.status === "error" || item.status === "invalid"
                              ? styles.fileError
                              : styles.fileMessage
                          }
                        >
                          {item.status === "uploading"
                            ? `Uploading · ${item.progress}%`
                            : item.message ||
                              `${(item.file.size / (1024 * 1024)).toFixed(1)} MB · ${
                                item.status === "saved" ? "Added" : "Ready"
                              }`}
                        </span>
                        {item.status === "uploading" && (
                          <span className={styles.progressTrack}>
                            <span style={{ width: `${item.progress}%` }} />
                          </span>
                        )}
                      </span>
                      <span className={styles.fileStatus} aria-hidden="true">
                        {item.status === "saved"
                          ? "✓"
                          : item.status === "error" || item.status === "invalid"
                            ? "!"
                            : ""}
                      </span>
                      {!uploading && item.status !== "saved" && (
                        <button
                          type="button"
                          className={styles.removeButton}
                          onClick={() => removeItem(item.id)}
                          aria-label={`Remove ${item.file.name}`}
                        >
                          ×
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              )}

              {uploadNotice && (
                <p className={styles.uploadNotice} role="status" aria-live="polite">
                  {uploadNotice}
                </p>
              )}
              <div className={styles.dialogFooter}>
                <span>Photos will be visible to everyone.</span>
                <button
                  className={styles.submitButton}
                  type="submit"
                  disabled={
                    uploading ||
                    !hasFirebaseConfig ||
                    !hasCloudinaryConfig ||
                    !items.some((item) => item.status === "queued")
                  }
                >
                  {uploading ? "Uploading…" : "Upload photos"}
                  {!uploading && <span aria-hidden="true">↗</span>}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      {activePhoto && (
        <div
          ref={lightboxRef}
          className={styles.lightbox}
          role="dialog"
          aria-modal="true"
          aria-label={getPhotoTitle(activePhoto)}
          tabIndex={-1}
          onClick={(event) => {
            if (event.target === event.currentTarget) setActivePhoto(null);
          }}
        >
          <button
            className={styles.lightboxClose}
            type="button"
            onClick={() => setActivePhoto(null)}
            aria-label="Close photo"
          >
            ×
          </button>
          <div className={styles.lightboxImage}>
            <Image
              src={activePhoto.url}
              alt={getPhotoTitle(activePhoto)}
              fill
              sizes="100vw"
              unoptimized
            />
          </div>
          <p>
            {getPhotoTitle(activePhoto)} · {formatDate(activePhoto.createdAt)}
          </p>
        </div>
      )}
    </section>
  );
}
