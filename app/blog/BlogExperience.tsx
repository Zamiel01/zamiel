"use client";

import Image from "next/image";
import {
  onAuthStateChanged,
  signInAnonymously,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
  type Timestamp,
} from "firebase/firestore";
import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { hasBlogFirebaseConfig, getBlogFirebase } from "@/lib/blog";
import styles from "./blog.module.css";

const BLOG_ADMIN_EMAIL = "nkuinmbeng@gmail.com";

type Post = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  coverImage: string | null;
  status: "draft" | "published";
  authorId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  publishedAt: Timestamp | null;
};

type PostDraft = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  coverImage: string;
  status: "draft" | "published";
};

type Comment = {
  id: string;
  authorId: string;
  body: string;
  createdAt: Timestamp;
};

type CommentsState = {
  postId: string;
  comments: Comment[];
  error: string;
};

const blankDraft: PostDraft = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  category: "Notes",
  coverImage: "",
  status: "draft",
};

function slugify(value: string) {
  return value
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 90);
}

function toPost(id: string, value: Record<string, unknown>): Post | null {
  const {
    title,
    slug,
    excerpt,
    content,
    category,
    coverImage,
    status,
    authorId,
    createdAt,
    updatedAt,
    publishedAt,
  } = value;

  if (
    typeof title !== "string" ||
    typeof slug !== "string" ||
    typeof excerpt !== "string" ||
    typeof content !== "string" ||
    typeof category !== "string" ||
    (coverImage !== null && typeof coverImage !== "string") ||
    (status !== "draft" && status !== "published") ||
    typeof authorId !== "string" ||
    !isTimestamp(createdAt) ||
    !isTimestamp(updatedAt) ||
    (publishedAt !== null && !isTimestamp(publishedAt))
  ) {
    return null;
  }

  return {
    id,
    title,
    slug,
    excerpt,
    content,
    category,
    coverImage,
    status,
    authorId,
    createdAt,
    updatedAt,
    publishedAt,
  };
}

function isTimestamp(value: unknown): value is Timestamp {
  return (
    typeof value === "object" &&
    value !== null &&
    "toDate" in value &&
    typeof value.toDate === "function"
  );
}

function formatDate(value: Timestamp | null) {
  if (!value) return "Unpublished";
  return new Intl.DateTimeFormat("en", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(value.toDate());
}

function getInitialPost() {
  if (typeof window === "undefined") return null;
  return new URLSearchParams(window.location.search).get("post");
}

const dialogFocusableSelector =
  'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';

export default function BlogExperience() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [authReady, setAuthReady] = useState(!hasBlogFirebaseConfig);
  const [loading, setLoading] = useState(hasBlogFirebaseConfig);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [authOpen, setAuthOpen] = useState(false);
  const [editorOpen, setEditorOpen] = useState(false);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState<PostDraft>(blankDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [commentsState, setCommentsState] = useState<CommentsState | null>(null);
  const [commentsLoadedFor, setCommentsLoadedFor] = useState<string | null>(null);
  const [likesState, setLikesState] = useState<{ postId: string; count: number } | null>(null);
  const [likedState, setLikedState] = useState<{ postId: string; userId: string; liked: boolean } | null>(null);
  const [engagementError, setEngagementError] = useState("");
  const [commentDraft, setCommentDraft] = useState("");
  const [commentBusy, setCommentBusy] = useState(false);
  const [likeBusy, setLikeBusy] = useState(false);
  const authTriggerRef = useRef<HTMLButtonElement>(null);
  const authDialogRef = useRef<HTMLElement>(null);
  const editorDialogRef = useRef<HTMLElement>(null);
  const readerDialogRef = useRef<HTMLElement>(null);
  const selectedPost =
    posts.find((post) => post.slug === selectedSlug) ?? null;
  const activeDialog =
    authOpen
      ? authDialogRef
      : editorOpen
        ? editorDialogRef
        : selectedPost
          ? readerDialogRef
          : null;

  const refreshAdminAccess = useCallback((user: User | null) => {
    setAuthUser(user);
    if (!user) {
      setIsAdmin(false);
      setPosts((current) =>
        current.filter((post) => post.status === "published")
      );
      setSelectedSlug(null);
      return;
    }
    const canEdit = user.email?.toLowerCase() === BLOG_ADMIN_EMAIL;
    setIsAdmin(canEdit);
    if (!canEdit) {
      setPosts((current) =>
        current.filter((post) => post.status === "published")
      );
      setSelectedSlug(null);
    }
  }, []);

  useEffect(() => {
    const syncSelectedPost = () => setSelectedSlug(getInitialPost());
    const initialSync = window.setTimeout(syncSelectedPost, 0);
    window.addEventListener("popstate", syncSelectedPost);
    return () => {
      window.clearTimeout(initialSync);
      window.removeEventListener("popstate", syncSelectedPost);
    };
  }, []);

  useEffect(() => {
    if (!hasBlogFirebaseConfig) return;

    const { auth } = getBlogFirebase();
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      refreshAdminAccess(user);
      setAuthReady(true);
    });

    return unsubscribe;
  }, [refreshAdminAccess]);

  useEffect(() => {
    if (!hasBlogFirebaseConfig) return;

    const { db } = getBlogFirebase();
    const postsCollection = collection(db, "blogPosts");
    const postsQuery =
      isAdmin
        ? postsCollection
        : query(postsCollection, where("status", "==", "published"));

    const unsubscribe = onSnapshot(
      postsQuery,
      (snapshot) => {
        const nextPosts = snapshot.docs
          .map((entry) => toPost(entry.id, entry.data()))
          .filter((post): post is Post => post !== null)
          .sort((a, b) => {
            const aDate = (a.publishedAt ?? a.updatedAt).toMillis();
            const bDate = (b.publishedAt ?? b.updatedAt).toMillis();
            return bDate - aDate;
          });
        setPosts(nextPosts);
        setError("");
        setLoading(false);
      },
      (snapshotError) => {
        setError(
          snapshotError.code === "permission-denied"
            ? "Firestore denied access. Confirm the deployed blog rules and that you are signed in with the blog editor account."
            : "We couldn't load the journal just now. Check your connection and try again."
        );
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [isAdmin]);

  useEffect(() => {
    if (!selectedPost || selectedPost.status !== "published") return;

    const { db } = getBlogFirebase();
    const postRef = doc(db, "blogPosts", selectedPost.id);
    const commentsRef = collection(postRef, "comments");
    const likesRef = collection(postRef, "likes");
    const unsubscribeComments = onSnapshot(
      commentsRef,
      (snapshot) => {
        const comments = snapshot.docs
          .flatMap((entry) => {
            const value = entry.data();
            if (
              typeof value.authorId !== "string" ||
              typeof value.body !== "string" ||
              !isTimestamp(value.createdAt)
            ) {
              return [];
            }
            return [{
              id: entry.id,
              authorId: value.authorId,
              body: value.body,
              createdAt: value.createdAt,
            }];
          })
          .sort((a, b) => a.createdAt.toMillis() - b.createdAt.toMillis());
        setCommentsState({ postId: selectedPost.id, comments, error: "" });
        setCommentsLoadedFor(selectedPost.id);
      },
      () => {
        setCommentsState({
          postId: selectedPost.id,
          comments: [],
          error: "Comments could not be loaded. Check your connection and try again.",
        });
        setCommentsLoadedFor(selectedPost.id);
      }
    );
    const unsubscribeLikes = onSnapshot(
      likesRef,
      (snapshot) => {
        setLikesState({ postId: selectedPost.id, count: snapshot.size });
      },
      () => {
        setEngagementError("Like totals could not be loaded. Please try again.");
      }
    );

    return () => {
      unsubscribeComments();
      unsubscribeLikes();
    };
  }, [selectedPost]);

  useEffect(() => {
    if (!selectedPost || selectedPost.status !== "published" || !authUser) {
      return;
    }

    const likeRef = doc(
      getBlogFirebase().db,
      "blogPosts",
      selectedPost.id,
      "likes",
      authUser.uid
    );
    return onSnapshot(
      likeRef,
      (snapshot) => {
        setLikedState({
          postId: selectedPost.id,
          userId: authUser.uid,
          liked: snapshot.exists(),
        });
      },
      () => setEngagementError("Your like status could not be loaded.")
    );
  }, [authUser, selectedPost]);

  const categories = useMemo(
    () => ["All", ...new Set(posts.map((post) => post.category))],
    [posts]
  );
  const visiblePosts = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return posts.filter((post) => {
      const matchesCategory =
        activeCategory === "All" || post.category === activeCategory;
      const matchesSearch =
        !normalizedSearch ||
        `${post.title} ${post.excerpt} ${post.category}`
          .toLowerCase()
          .includes(normalizedSearch);
      return post.status === "published" && matchesCategory && matchesSearch;
    });
  }, [activeCategory, posts, search]);
  const draftPosts = posts.filter((post) => post.status === "draft");
  const visibleError =
    error ||
    (!hasBlogFirebaseConfig
      ? "The blog is waiting for Firebase configuration. Add the public Firebase app variables to enable publishing."
      : "");
  const featuredPost = visiblePosts[0] ?? null;
  const remainingPosts = featuredPost
    ? visiblePosts.filter((post) => post.id !== featuredPost.id)
    : [];

  const openPost = (post: Post) => {
    setEngagementError("");
    window.history.pushState(
      { post: post.slug },
      "",
      `/blog/?post=${encodeURIComponent(post.slug)}`
    );
    setSelectedSlug(post.slug);
  };

  const closePost = useCallback(() => {
    setEngagementError("");
    window.history.replaceState({}, "", "/blog/");
    setSelectedSlug(null);
  }, []);

  const ensureGuestUser = async () => {
    const { auth } = getBlogFirebase();
    if (auth.currentUser) return auth.currentUser;
    const credential = await signInAnonymously(auth);
    return credential.user;
  };

  const submitComment = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selectedPost || selectedPost.status !== "published") return;
    const body = commentDraft.trim();
    if (!body) return;

    setCommentBusy(true);
    setEngagementError("");
    try {
      const user = await ensureGuestUser();
      await addDoc(
        collection(getBlogFirebase().db, "blogPosts", selectedPost.id, "comments"),
        { authorId: user.uid, body, createdAt: serverTimestamp() }
      );
      setCommentDraft("");
    } catch (commentError) {
      setEngagementError(
        commentError instanceof Error &&
          "code" in commentError &&
          commentError.code === "auth/operation-not-allowed"
          ? "Guest comments need Anonymous sign-in enabled in Firebase Authentication."
          : "Your comment couldn't be posted. Please try again."
      );
    } finally {
      setCommentBusy(false);
    }
  };

  const toggleLike = async () => {
    if (!selectedPost || selectedPost.status !== "published") return;
    setLikeBusy(true);
    setEngagementError("");
    try {
      const user = await ensureGuestUser();
      const likeRef = doc(
        getBlogFirebase().db,
        "blogPosts",
        selectedPost.id,
        "likes",
        user.uid
      );
      await runTransaction(getBlogFirebase().db, async (transaction) => {
        const existing = await transaction.get(likeRef);
        if (existing.exists()) {
          transaction.delete(likeRef);
        } else {
          transaction.set(likeRef, {
            uid: user.uid,
            createdAt: serverTimestamp(),
          });
        }
      });
    } catch (likeError) {
      setEngagementError(
        likeError instanceof Error &&
          "code" in likeError &&
          likeError.code === "auth/operation-not-allowed"
          ? "Guest likes need Anonymous sign-in enabled in Firebase Authentication."
          : "Your like couldn't be saved. Please try again."
      );
    } finally {
      setLikeBusy(false);
    }
  };

  const removeComment = async (comment: Comment) => {
    if (!selectedPost || !authUser || comment.authorId !== authUser.uid) return;
    setEngagementError("");
    try {
      await deleteDoc(
        doc(
          getBlogFirebase().db,
          "blogPosts",
          selectedPost.id,
          "comments",
          comment.id
        )
      );
    } catch {
      setEngagementError("Your comment couldn't be deleted. Please try again.");
    }
  };

  useEffect(() => {
    if (!activeDialog?.current) return;
    const dialog = activeDialog.current;
    const authTrigger = authTriggerRef.current;
    const focusable = Array.from(
      dialog.querySelectorAll<HTMLElement>(dialogFocusableSelector)
    );
    (focusable[0] ?? dialog).focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        if (activeDialog === authDialogRef) {
          setAuthOpen(false);
        } else if (activeDialog === editorDialogRef) {
          setEditorOpen(false);
        } else if (activeDialog === readerDialogRef) {
          closePost();
        }
        return;
      }

      if (event.key !== "Tab") return;
      const currentFocusable = Array.from(
        dialog.querySelectorAll<HTMLElement>(dialogFocusableSelector)
      );
      if (currentFocusable.length === 0) {
        event.preventDefault();
        dialog.focus();
        return;
      }

      const first = currentFocusable[0];
      const last = currentFocusable[currentFocusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      } else if (!dialog.contains(document.activeElement)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      if (activeDialog === authDialogRef) authTrigger?.focus();
    };
  }, [activeDialog, closePost]);

  const handleAuth = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!hasBlogFirebaseConfig) return;
    setBusy(true);
    setAuthError("");
    try {
      const { auth } = getBlogFirebase();
      const result = await signInWithEmailAndPassword(
        auth,
        authEmail.trim(),
        authPassword
      );
      refreshAdminAccess(result.user);
      setAuthPassword("");
      setAuthOpen(false);
      setNotice(
        result.user.email?.toLowerCase() === BLOG_ADMIN_EMAIL
          ? "Editor access ready."
          : "Signed in, but this account doesn't have blog editor access."
      );
    } catch {
      setAuthError("Sign-in failed. Check your email and password.");
    } finally {
      setBusy(false);
    }
  };

  const beginNewPost = () => {
    setEditingId(null);
    setDraft(blankDraft);
    setEditorOpen(true);
  };

  const beginEdit = (post: Post) => {
    setEditingId(post.id);
    setDraft({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt,
      content: post.content,
      category: post.category,
      coverImage: post.coverImage ?? "",
      status: post.status,
    });
    setEditorOpen(true);
    setSelectedSlug(null);
    window.history.replaceState({}, "", "/blog/");
  };

  const savePost = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!authUser || !isAdmin) return;
    const slug = editingId ? draft.slug : slugify(draft.slug || draft.title);
    if (!slug) {
      setError("Add a title so the article can have a URL.");
      return;
    }
    if (draft.coverImage && !/^https:\/\/\S+$/i.test(draft.coverImage)) {
      setError("The cover image must be an https URL.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const { db } = getBlogFirebase();
      const originalPost = editingId
        ? posts.find((post) => post.id === editingId)
        : undefined;
      const postData = {
        title: draft.title.trim(),
        slug,
        excerpt: draft.excerpt.trim(),
        content: draft.content.trim(),
        category: draft.category.trim() || "Notes",
        coverImage: draft.coverImage.trim() || null,
        status: draft.status,
        authorId: originalPost?.authorId ?? authUser.uid,
        updatedAt: serverTimestamp(),
        publishedAt:
          draft.status === "draft"
            ? null
            : originalPost?.status === "published"
              ? originalPost.publishedAt
              : serverTimestamp(),
      };

      if (editingId) {
        await updateDoc(doc(db, "blogPosts", editingId), postData);
      } else {
        const target = doc(db, "blogPosts", slug);
        await runTransaction(db, async (transaction) => {
          const existing = await transaction.get(target);
          if (existing.exists()) {
            throw new Error("A post already uses this URL. Choose another.");
          }
          transaction.set(target, {
            ...postData,
            createdAt: serverTimestamp(),
          });
        });
      }

      setEditorOpen(false);
      setNotice(draft.status === "published" ? "Article published." : "Draft saved.");
    } catch (saveError) {
      setError(
        saveError instanceof Error &&
          saveError.message.startsWith("A post already")
          ? saveError.message
          : "The article couldn't be saved. Confirm your editor claim and Firestore rules."
      );
    } finally {
      setBusy(false);
    }
  };

  const removePost = async (post: Post) => {
    if (!isAdmin || !window.confirm(`Delete “${post.title}” permanently?`)) {
      return;
    }
    try {
      await deleteDoc(doc(getBlogFirebase().db, "blogPosts", post.id));
      if (selectedSlug === post.slug) closePost();
      setNotice("Article deleted.");
      setError("");
    } catch {
      setError("The article couldn't be deleted. Check editor permissions.");
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.masthead}>
        <div className={styles.mastheadTop}>
          <span className={styles.kicker}>
            <span aria-hidden="true" /> Personal journal · Since 2026
          </span>
          <div className={styles.headerActions}>
            {isAdmin ? (
              <>
                <button
                  ref={authTriggerRef}
                  className={styles.textButton}
                  type="button"
                  onClick={beginNewPost}
                >
                  + Write
                </button>
                <button
                  className={styles.textButton}
                  type="button"
                  onClick={() => void signOut(getBlogFirebase().auth)}
                >
                  Sign out
                </button>
              </>
            ) : (
              <button
                className={styles.textButton}
                type="button"
                onClick={() => setAuthOpen(true)}
              >
                Editor sign in <span aria-hidden="true">↗</span>
              </button>
            )}
          </div>
        </div>

        <div className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.overline}>Thoughts in progress</p>
            <h1>
              The <span>long</span>
              <br />
              way around.
            </h1>
            <p className={styles.intro}>
              Notes from the workbench: ideas, lessons, and the small details
              behind making things that matter.
            </p>
          </div>
          <div className={styles.heroStamp} aria-hidden="true">
            <span>FIELD</span>
            <span>NOTES</span>
            <span className={styles.stampIndex}>NE / 01</span>
          </div>
        </div>

        <div className={styles.issueLine}>
          <span>Ideas worth keeping</span>
          <span>Read slowly · Think deeply</span>
          <span>{String(posts.filter((post) => post.status === "published").length).padStart(2, "0")} entries</span>
        </div>
      </header>

      {notice && (
        <div className={styles.notice} role="status">
          <span>{notice}</span>
          <button type="button" onClick={() => setNotice("")} aria-label="Dismiss">
            ×
          </button>
        </div>
      )}
      {visibleError && (
        <div className={styles.error} role="alert">
          <span>{visibleError}</span>
          <button type="button" onClick={() => setError("")} aria-label="Dismiss">
            ×
          </button>
        </div>
      )}

      <section className={styles.archive} aria-label="Blog archive">
        <div className={styles.archiveHead}>
          <div>
            <p className={styles.overline}>The archive</p>
            <h2>Recent writing<span>.</span></h2>
          </div>
          <label className={styles.search}>
            <span className={styles.srOnly}>Search articles</span>
            <span aria-hidden="true">⌕</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search the notes"
            />
          </label>
        </div>

        {categories.length > 1 && (
          <div className={styles.filters} aria-label="Filter by category">
            {categories.map((category) => (
              <button
                type="button"
                key={category}
                className={activeCategory === category ? styles.filterActive : ""}
                aria-pressed={activeCategory === category}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className={styles.state} aria-live="polite">
            <span className={styles.loader} aria-hidden="true" />
            <p>Opening the notebook…</p>
          </div>
        ) : visiblePosts.length ? (
          <>
            {featuredPost && (
              <article className={styles.featured}>
                <button
                  type="button"
                  className={styles.featuredLink}
                  onClick={() => openPost(featuredPost)}
                  aria-label={`Read ${featuredPost.title}`}
                >
                  <div className={styles.featuredArt}>
                    {featuredPost.coverImage ? (
                      <Image
                        src={featuredPost.coverImage}
                        alt=""
                        fill
                        sizes="(max-width: 800px) 100vw, 48vw"
                        unoptimized
                      />
                    ) : (
                      <div className={styles.artwork} aria-hidden="true">
                        <span className={styles.artworkRule} />
                        <span className={styles.artworkWord}>notes</span>
                        <span className={styles.artworkNumber}>№ 01</span>
                      </div>
                    )}
                    <span className={styles.readMark} aria-hidden="true">↗</span>
                  </div>
                  <div className={styles.featuredCopy}>
                    <div className={styles.meta}>
                      <span>{featuredPost.category}</span>
                      <span>{formatDate(featuredPost.publishedAt)}</span>
                    </div>
                    <h3>{featuredPost.title}</h3>
                    <p>{featuredPost.excerpt}</p>
                    <span className={styles.readMore}>Read the story <span aria-hidden="true">→</span></span>
                  </div>
                </button>
                {isAdmin && (
                  <div className={styles.postTools}>
                    <button type="button" onClick={() => beginEdit(featuredPost)}>Edit</button>
                    <button type="button" onClick={() => void removePost(featuredPost)}>Delete</button>
                  </div>
                )}
              </article>
            )}

            {remainingPosts.length > 0 && (
              <div className={styles.list}>
                {remainingPosts.map((post, index) => (
                  <article key={post.id} className={styles.listItem}>
                    <span className={styles.listIndex}>{String(index + 2).padStart(2, "0")}</span>
                    <button
                      type="button"
                      className={styles.listLink}
                      onClick={() => openPost(post)}
                    >
                      <span className={styles.meta}>
                        <span>{post.category}</span>
                        <span>{formatDate(post.publishedAt)}</span>
                      </span>
                      <span className={styles.listTitle}>{post.title}</span>
                      <span className={styles.listExcerpt}>{post.excerpt}</span>
                    </button>
                    <span className={styles.listArrow} aria-hidden="true">↗</span>
                    {isAdmin && (
                      <div className={styles.postTools}>
                        <button type="button" onClick={() => beginEdit(post)}>Edit</button>
                        <button type="button" onClick={() => void removePost(post)}>Delete</button>
                      </div>
                    )}
                  </article>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className={styles.state}>
            <span className={styles.emptyIndex} aria-hidden="true">∅</span>
            <p className={styles.stateTitle}>
              {loading ? "Loading the archive" : search || activeCategory !== "All" ? "No notes match this search." : "The notebook is open."}
            </p>
            <p>
              {loading
                ? "Just a moment."
                : search || activeCategory !== "All"
                  ? "Try another phrase or choose a different category."
                  : isAdmin
                    ? "Start with a first draft, then publish it when it’s ready."
                    : "New writing will appear here as soon as it’s published."}
            </p>
            {isAdmin && !search && activeCategory === "All" && (
              <button className={styles.primaryButton} type="button" onClick={beginNewPost}>
                Write the first note
              </button>
            )}
          </div>
        )}

        {isAdmin && draftPosts.length > 0 && (
          <section className={styles.drafts} aria-labelledby="drafts-title">
            <div className={styles.draftsHeading}>
              <div>
                <p className={styles.overline}>Private workspace</p>
                <h3 id="drafts-title">Drafts <span>({draftPosts.length})</span></h3>
              </div>
              <span className={styles.draftLabel}>EDITOR ONLY</span>
            </div>
            {draftPosts.map((post) => (
              <article className={styles.draftRow} key={post.id}>
                <button type="button" onClick={() => openPost(post)}>
                  <span>{post.title}</span>
                  <small>{post.excerpt}</small>
                </button>
                <div className={styles.postTools}>
                  <button type="button" onClick={() => beginEdit(post)}>Edit</button>
                  <button type="button" onClick={() => void removePost(post)}>Delete</button>
                </div>
              </article>
            ))}
          </section>
        )}
      </section>

      <footer className={styles.footer}>
        <span>Notes from Nkuin Eugene</span>
        <span>Made with curiosity <b aria-hidden="true">✳</b></span>
      </footer>

      {selectedPost && (
        <div className={styles.readerBackdrop} role="presentation" onMouseDown={closePost}>
          <article
            ref={readerDialogRef}
            className={styles.reader}
            role="dialog"
            tabIndex={-1}
            aria-modal="true"
            aria-labelledby="reader-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className={styles.readerBar}>
              <span className={styles.readerBrand}>FIELD NOTES / {selectedPost.category.toUpperCase()}</span>
              <button type="button" className={styles.closeButton} onClick={closePost}>
                Close <span aria-hidden="true">×</span>
              </button>
            </div>
            {selectedPost.coverImage && (
              <div className={styles.readerImage}>
                <Image
                  src={selectedPost.coverImage}
                  alt=""
                  fill
                  sizes="(max-width: 800px) 100vw, 800px"
                  unoptimized
                />
              </div>
            )}
            <div className={styles.readerBody}>
              <p className={styles.overline}>
                {selectedPost.category} <span aria-hidden="true">/</span> {formatDate(selectedPost.publishedAt)}
              </p>
              <h2 id="reader-title">{selectedPost.title}</h2>
              <p className={styles.readerExcerpt}>{selectedPost.excerpt}</p>
              <div className={styles.articleText}>
                {selectedPost.content.split(/\n{2,}/).map((paragraph, index) => (
                  <p key={`${selectedPost.id}-${index}`}>{paragraph}</p>
                ))}
              </div>
              {selectedPost.status === "published" && (
                <section className={styles.engagement} aria-label="Article engagement">
                  <div className={styles.engagementTop}>
                    <div>
                      <p className={styles.overline}>Join the conversation</p>
                      <h3>Leave a note<span>.</span></h3>
                    </div>
                    <button
                      className={`${styles.likeButton} ${
                        likedState?.postId === selectedPost.id &&
                        likedState.userId === authUser?.uid &&
                        likedState.liked
                          ? styles.liked
                          : ""
                      }`}
                      type="button"
                      onClick={() => void toggleLike()}
                      disabled={
                        likeBusy ||
                        (Boolean(authUser) &&
                          !(
                            likedState?.postId === selectedPost.id &&
                            likedState.userId === authUser?.uid
                          ))
                      }
                      aria-pressed={
                        likedState?.postId === selectedPost.id &&
                        likedState.userId === authUser?.uid &&
                        likedState.liked
                      }
                    >
                      <span aria-hidden="true">♥</span>
                      {likedState?.postId === selectedPost.id &&
                      likedState.userId === authUser?.uid &&
                      likedState.liked
                        ? "Liked"
                        : "Like"}
                      <span className={styles.likeCount}>
                        {likesState?.postId === selectedPost.id
                          ? likesState.count
                          : "Loading"}
                      </span>
                    </button>
                  </div>
                  {engagementError && (
                    <p className={styles.engagementError} role="alert">
                      {engagementError}
                    </p>
                  )}

                  <form className={styles.commentForm} onSubmit={(event) => void submitComment(event)}>
                    <label htmlFor="blog-comment">
                      Your comment <span>· posted as a guest</span>
                    </label>
                    <textarea
                      id="blog-comment"
                      value={commentDraft}
                      onChange={(event) => setCommentDraft(event.target.value)}
                      placeholder="Add something thoughtful…"
                      maxLength={1000}
                      rows={4}
                      required
                    />
                    <div className={styles.commentFormFoot}>
                      <span>{commentDraft.trim().length}/1000</span>
                      <button
                        className={styles.primaryButton}
                        type="submit"
                        disabled={commentBusy || !commentDraft.trim()}
                      >
                        {commentBusy ? "Posting…" : "Post comment"}
                      </button>
                    </div>
                  </form>

                  <div className={styles.commentThread}>
                    <h4>
                      Responses{" "}
                      <span>
                        {commentsState?.postId === selectedPost.id
                          ? commentsState.comments.length
                          : "—"}
                      </span>
                    </h4>
                    {commentsLoadedFor !== selectedPost.id ? (
                      <p className={styles.engagementState} aria-live="polite">
                        <span className={styles.loader} aria-hidden="true" />
                        Loading comments…
                      </p>
                    ) : commentsState?.postId === selectedPost.id &&
                      commentsState.error ? (
                      <p className={styles.engagementState} role="alert">
                        {commentsState.error}
                      </p>
                    ) : commentsState?.postId === selectedPost.id &&
                      commentsState.comments.length ? (
                      <ol className={styles.comments}>
                        {commentsState.comments.map((comment) => (
                          <li className={styles.comment} key={comment.id}>
                            <div className={styles.commentMeta}>
                              <span>Guest reader</span>
                              <time dateTime={comment.createdAt.toDate().toISOString()}>
                                {formatDate(comment.createdAt)}
                              </time>
                              {authUser?.uid === comment.authorId && (
                                <button
                                  type="button"
                                  onClick={() => void removeComment(comment)}
                                  aria-label="Delete your comment"
                                >
                                  Delete
                                </button>
                              )}
                            </div>
                            <p>{comment.body}</p>
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <p className={styles.engagementState}>
                        No responses yet. Be the first to leave a note.
                      </p>
                    )}
                  </div>
                  <p className={styles.guestPrivacy}>
                    No public account needed. Firebase keeps a private anonymous
                    session on this device so you can manage your own likes and comments.
                  </p>
                </section>
              )}
              {isAdmin && (
                <div className={styles.readerTools}>
                  <button className={styles.primaryButton} type="button" onClick={() => beginEdit(selectedPost)}>Edit article</button>
                  <button className={styles.textButton} type="button" onClick={() => void removePost(selectedPost)}>Delete article</button>
                </div>
              )}
            </div>
          </article>
        </div>
      )}

      {authOpen && (
        <div className={styles.modalBackdrop} role="presentation" onMouseDown={() => setAuthOpen(false)}>
          <section
            ref={authDialogRef}
            className={styles.modal}
            role="dialog"
            tabIndex={-1}
            aria-modal="true"
            aria-labelledby="auth-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button type="button" className={styles.modalClose} aria-label="Close" onClick={() => setAuthOpen(false)}>×</button>
            <p className={styles.overline}>Private access</p>
            <h2 id="auth-title">Editor sign in<span>.</span></h2>
            <p className={styles.modalIntro}>Sign in with the editor account configured for this journal.</p>
            <form className={styles.authForm} onSubmit={(event) => void handleAuth(event)}>
              <label>
                Email
                <input type="email" autoComplete="username" value={authEmail} onChange={(event) => setAuthEmail(event.target.value)} required />
              </label>
              <label>
                Password
                <input type="password" autoComplete="current-password" value={authPassword} onChange={(event) => setAuthPassword(event.target.value)} required />
              </label>
              {authError && <p className={styles.formError} role="alert">{authError}</p>}
              <button className={styles.primaryButton} type="submit" disabled={busy || !authReady}>
                {busy ? "Signing in…" : "Sign in"}
              </button>
            </form>
            <p className={styles.privateNote}>Editor accounts are created by the site owner; registration is not open.</p>
          </section>
        </div>
      )}

      {editorOpen && (
        <div className={styles.modalBackdrop} role="presentation" onMouseDown={() => setEditorOpen(false)}>
          <section
            ref={editorDialogRef}
            className={`${styles.modal} ${styles.editorModal}`}
            role="dialog"
            tabIndex={-1}
            aria-modal="true"
            aria-labelledby="editor-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button type="button" className={styles.modalClose} aria-label="Close" onClick={() => setEditorOpen(false)}>×</button>
            <p className={styles.overline}>{editingId ? "Revise a note" : "New dispatch"}</p>
            <h2 id="editor-title">{editingId ? "Edit article" : "Write a note"}<span>.</span></h2>
            <form className={styles.editorForm} onSubmit={(event) => void savePost(event)}>
              <label>
                Title
                <input
                  value={draft.title}
                  onChange={(event) => setDraft({ ...draft, title: event.target.value, slug: editingId ? draft.slug : slugify(event.target.value) })}
                  maxLength={160}
                  required
                />
              </label>
              <label>
                URL slug
                <input value={draft.slug} onChange={(event) => setDraft({ ...draft, slug: event.target.value })} disabled={Boolean(editingId)} required />
                <small>{editingId ? "The URL stays fixed after publishing." : "Generated from the title; you can refine it."}</small>
              </label>
              <label>
                Short introduction
                <textarea value={draft.excerpt} onChange={(event) => setDraft({ ...draft, excerpt: event.target.value })} maxLength={300} rows={2} required />
              </label>
              <label>
                Article
                <textarea value={draft.content} onChange={(event) => setDraft({ ...draft, content: event.target.value })} maxLength={50000} rows={9} required />
                <small>Separate paragraphs with a blank line.</small>
              </label>
              <div className={styles.formRow}>
                <label>
                  Section
                  <input value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })} maxLength={40} required />
                </label>
                <label>
                  Cover image URL <span>(optional)</span>
                  <input type="url" value={draft.coverImage} onChange={(event) => setDraft({ ...draft, coverImage: event.target.value })} placeholder="https://" />
                </label>
              </div>
              <label className={styles.selectLabel}>
                Visibility
                <select value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as PostDraft["status"] })}>
                  <option value="draft">Draft — only editors</option>
                  <option value="published">Published — visible to everyone</option>
                </select>
              </label>
              <div className={styles.formActions}>
                <button className={styles.textButton} type="button" onClick={() => setEditorOpen(false)}>Cancel</button>
                <button className={styles.primaryButton} type="submit" disabled={busy}>
                  {busy ? "Saving…" : draft.status === "published" ? "Publish article" : "Save draft"}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  );
}
