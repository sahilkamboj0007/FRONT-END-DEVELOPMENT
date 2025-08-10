

import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate } from "react-router-dom";
import { Search, Play, User, List, BarChart2 } from "lucide-react";

const COURSES = [
  {
    id: "react-basics",
    title: "React for Beginners",
    author: "Aisha Khan",
    duration: "3h 20m",
    level: "Beginner",
    thumbnail: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=3d6f9d4f8b8c3d6b7a3f9ed1c2b0f8a1",
    video: "https://www.youtube.com/embed/dGcsHMXbSOA",
    lessons: [
      { id: "r1", title: "Intro & Setup", length: "6:12" },
      { id: "r2", title: "JSX & Components", length: "18:40" },
      { id: "r3", title: "Props & State", length: "22:05" },
      { id: "r4", title: "Hooks Overview", length: "30:12" },
    ],
  },
  {
    id: "python-data",
    title: "Python for Data Analysis",
    author: "sahil kamboj",
    duration: "4h 10m",
    level: "Intermediate",
    thumbnail: "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=c6c0b2d4f7d8c3f2b7a1a8f1c2b0e5d3",
    video: "https://www.youtube.com/embed/rfscVS0vtbw",
    lessons: [
      { id: "p1", title: "Numpy Primer", length: "12:22" },
      { id: "p2", title: "Pandas DataFrames", length: "25:05" },
      { id: "p3", title: "Cleaning Data", length: "18:10" },
    ],
  },
  {
    id: "ui-ux",
    title: "Intro to UI/UX Design",
    author: "Sneha Patel",
    duration: "2h 35m",
    level: "Beginner",
    thumbnail: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=1200&auto=format&fit=crop&ixlib=rb-4.0.3&s=1f7d7da8f4b6c2e9a8d7b3e2c9f6a4b5",
    video: "https://www.youtube.com/embed/Ke90Tje7VS0",
    lessons: [
      { id: "u1", title: "Design Thinking", length: "11:40" },
      { id: "u2", title: "Wireframes & Prototypes", length: "19:30" },
    ],
  },
];

const STORAGE_KEY = "elearn_progress_v1";

function readProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
}

function saveProgress(obj) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
}

function useProgress() {
  const [progress, setProgress] = useState(() => readProgress());

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  function toggleLesson(courseId, lessonId) {
    setProgress((p) => {
      const course = p[courseId] ? new Set(p[courseId]) : new Set();
      if (course.has(lessonId)) course.delete(lessonId);
      else course.add(lessonId);
      // convert Set to array for storage
      return { ...p, [courseId]: Array.from(course) };
    });
  }

  function getCompletedCount(courseId) {
    return (progress[courseId] || []).length;
  }

  return { progress, toggleLesson, getCompletedCount, setProgress };
}

// -------------------------- UI Components --------------------------
function Nav({ searchQuery, setSearchQuery }) {
  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">E</div>
          <div>
            <div className="font-semibold">EduFlow</div>
            <div className="text-xs text-slate-500">Learn. Track. Grow.</div>
          </div>
        </Link>

        <div className="flex-1 max-w-xl">
          <div className="relative">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search courses, authors, or topics..."
              className="w-full border rounded-lg px-10 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
            />
            <Search className="absolute left-3 top-2.5 text-slate-400" size={18} />
          </div>
        </div>

        <nav className="flex items-center gap-4">
          <Link to="/dashboard" className="px-3 py-2 rounded-md hover:bg-slate-50 flex items-center gap-2 text-sm">
            <BarChart2 size={16} /> Dashboard
          </Link>
          <Link to="/" className="px-3 py-2 rounded-md hover:bg-slate-50 text-sm">Courses</Link>
          <Link to="/profile" className="px-3 py-2 rounded-md hover:bg-slate-50 flex items-center gap-2">
            <User size={16} /> Profile
          </Link>
        </nav>
      </div>
    </header>
  );
}

function CourseCard({ course, progressCount, onOpen }) {
  const total = course.lessons.length;
  const pct = Math.round((progressCount / total) * 100);

  return (
    <div className="bg-white rounded-2xl shadow p-4 flex gap-4 items-start hover:shadow-lg transition">
      <img src={course.thumbnail} alt="thumb" className="h-28 w-48 object-cover rounded-md flex-shrink-0" />
      <div className="flex-1">
        <h3 className="font-semibold text-lg">{course.title}</h3>
        <p className="text-sm text-slate-500">by {course.author} • {course.level} • {course.duration}</p>

        <div className="mt-3 flex items-center justify-between gap-4">
          <div className="flex-1">
            <div className="h-2 bg-slate-100 rounded overflow-hidden">
              <div className="h-full bg-indigo-500 rounded" style={{ width: `${pct}%` }} />
            </div>
            <div className="text-xs text-slate-500 mt-1">{pct}% complete • {progressCount}/{total} lessons</div>
          </div>

          <div className="flex gap-2">
            <Link to={`/course/${course.id}`} className="px-3 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2">
              <Play size={14} /> Continue
            </Link>
            <button onClick={() => onOpen(course.id)} className="px-3 py-2 border rounded-lg text-sm">Preview</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProgressBar({ value }) {
  return (
    <div className="w-full bg-slate-100 h-3 rounded overflow-hidden">
      <div className="h-full bg-indigo-500" style={{ width: `${value}%` }} />
    </div>
  );
}

// -------------------------- Pages --------------------------
function HomePage({ searchQuery, setSearchQuery, progress, toggleLesson }) {
  const [filter, setFilter] = useState("all");
  const [preview, setPreview] = useState(null);

  function handleOpenPreview(courseId) {
    const course = COURSES.find((c) => c.id === courseId);
    setPreview(course);
  }

  const filtered = COURSES.filter((c) => {
    const q = searchQuery.trim().toLowerCase();
    if (q) return c.title.toLowerCase().includes(q) || c.author.toLowerCase().includes(q) || c.level.toLowerCase().includes(q);
    if (filter === "all") return true;
    return c.level.toLowerCase() === filter;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Explore Courses</h1>
        <div className="flex items-center gap-3">
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="border px-3 py-2 rounded">
            <option value="all">All levels</option>
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {filtered.map((course) => (
          <CourseCard key={course.id} course={course} progressCount={(progress[course.id] || []).length} onOpen={handleOpenPreview} />
        ))}
      </div>

      {/* Preview modal (simple) */}
      {preview && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-bold text-xl">{preview.title}</h3>
                <p className="text-sm text-slate-500">by {preview.author}</p>
              </div>
              <button className="text-slate-500" onClick={() => setPreview(null)}>Close</button>
            </div>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <img src={preview.thumbnail} className="w-full h-40 object-cover rounded col-span-1 md:col-span-1" />
              <div className="md:col-span-2">
                <p className="text-sm">{preview.lessons.length} lessons • {preview.duration}</p>
                <p className="text-sm text-slate-600 mt-3">A concise description of the course goes here. It's designed to get learners up to speed quickly.</p>
                <div className="mt-4">
                  <Link to={`/course/${preview.id}`} onClick={() => setPreview(null)} className="px-4 py-2 bg-indigo-600 text-white rounded-lg">Open Course</Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function CoursePage({ progress, toggleLesson }) {
  const { id } = useParams();
  const course = COURSES.find((c) => c.id === id);
  const navigate = useNavigate();

  useEffect(() => {
    if (!course) {
      navigate("/");
    }
  }, [course]);

  if (!course) return null;

  const completed = new Set(progress[course.id] || []);
  const pct = Math.round((completed.size / course.lessons.length) * 100);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <div className="aspect-video bg-black rounded overflow-hidden">
            <iframe className="w-full h-full" src={course.video} title={course.title} frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
          </div>

          <div className="mt-4 bg-white rounded-lg shadow p-4">
            <h2 className="font-bold text-xl">{course.title}</h2>
            <p className="text-sm text-slate-500">by {course.author} • {course.duration} • {course.level}</p>

            <div className="mt-4">
              <div className="flex items-center gap-4">
                <div className="w-48">
                  <ProgressBar value={pct} />
                </div>
                <div className="text-sm text-slate-600">{pct}% complete</div>
              </div>

              <div className="mt-4">
                <h4 className="font-medium">Lessons</h4>
                <ul className="mt-2 space-y-2">
                  {course.lessons.map((lesson) => (
                    <li key={lesson.id} className="flex items-center justify-between gap-4 border rounded-md p-3">
                      <div className="flex items-center gap-3">
                        <input type="checkbox" checked={completed.has(lesson.id)} onChange={() => toggleLesson(course.id, lesson.id)} />
                        <div>
                          <div className="font-medium">{lesson.title}</div>
                          <div className="text-xs text-slate-500">{lesson.length}</div>
                        </div>
                      </div>
                      <button className="text-sm text-indigo-600">Play</button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="bg-white rounded-lg shadow p-4">
            <h4 className="font-semibold">Course Info</h4>
            <p className="text-sm text-slate-600 mt-2">{course.lessons.length} lessons • {course.duration}</p>
            <p className="text-sm text-slate-600 mt-2">Progress: {pct}%</p>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <h4 className="font-semibold">Related</h4>
            <ul className="mt-2 space-y-2">
              {COURSES.filter((c) => c.id !== course.id).slice(0, 3).map((c) => (
                <li key={c.id} className="flex items-center gap-3">
                  <img src={c.thumbnail} className="h-10 w-16 object-cover rounded" />
                  <Link to={`/course/${c.id}`} className="text-sm font-medium">{c.title}</Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}

function DashboardPage({ progress }) {
  const totals = COURSES.map((c) => ({
    id: c.id,
    title: c.title,
    completed: (progress[c.id] || []).length,
    total: c.lessons.length,
  }));

  const overall = Math.round((totals.reduce((s, t) => s + t.completed, 0) / totals.reduce((s, t) => s + t.total, 0)) * 100 || 0);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-slate-500">Overall Progress</div>
          <div className="mt-3 text-3xl font-bold">{overall}%</div>
          <div className="mt-3"><ProgressBar value={overall} /></div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 md:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-slate-500">Course Completion</div>
              <div className="font-semibold">Recent activity</div>
            </div>
            <div className="text-sm text-slate-500">Updated just now</div>
          </div>

          <div className="mt-4 space-y-3">
            {totals.map((t) => (
              <div key={t.id} className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="font-medium">{t.title}</div>
                  <div className="text-xs text-slate-500">{t.completed}/{t.total} lessons</div>
                </div>
                <div className="w-48"><ProgressBar value={Math.round((t.completed / t.total) * 100 || 0)} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfilePage({ progress }) {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center gap-6 mb-6">
        <div className="h-20 w-20 rounded-full bg-indigo-600 text-white flex items-center justify-center text-2xl">S</div>
        <div>
          <div className="font-bold text-xl">Sahil (Student)</div>
          <div className="text-sm text-slate-500">Member since 2024</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <h4 className="font-semibold">Your Courses</h4>
          <ul className="mt-3 space-y-2">
            {COURSES.map((c) => (
              <li key={c.id} className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{c.title}</div>
                  <div className="text-xs text-slate-500">{(progress[c.id] || []).length}/{c.lessons.length} lessons</div>
                </div>
                <Link to={`/course/${c.id}`} className="text-indigo-600 text-sm">Continue</Link>
              </li>
            ))}
          </ul>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <h4 className="font-semibold">Settings & Preferences</h4>
          <p className="text-sm text-slate-500 mt-2">Manage notifications, playback speed defaults, and more.</p>
        </div>
      </div>
    </div>
  );
}

// -------------------------- Main App --------------------------
export default function ElearningApp() {
  const [searchQuery, setSearchQuery] = useState("");
  const { progress, toggleLesson, getCompletedCount } = useProgress();

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 text-slate-800">
        <Nav searchQuery={searchQuery} setSearchQuery={setSearchQuery} />

        <Routes>
          <Route path="/" element={<HomePage searchQuery={searchQuery} setSearchQuery={setSearchQuery} progress={progress} toggleLesson={toggleLesson} />} />
          <Route path="/course/:id" element={<CoursePage progress={progress} toggleLesson={toggleLesson} />} />
          <Route path="/dashboard" element={<DashboardPage progress={progress} />} />
          <Route path="/profile" element={<ProfilePage progress={progress} />} />
          <Route path="*" element={<div className="max-w-6xl mx-auto px-4 py-20">Page not found — <Link to="/">Go home</Link></div>} />
        </Routes>

        <footer className="mt-12 py-6 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} EduFlow • Built with React + Tailwind
        </footer>
      </div>
    </Router>
  );
}
