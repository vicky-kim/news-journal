
import { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import Auth from "./Auth";
import SignUp from "./SignUp";

// Firebase 설정
const firebaseConfig = {
  apiKey: "AIzaSyAsCOlQjlJ_g9QRPOYrkp1tvoh6SDWlAwA",
  authDomain: "helloworld-17af4.firebaseapp.com",
  projectId: "helloworld-17af4",
  storageBucket: "helloworld-17af4.firebasestorage.app",
  messagingSenderId: "278174024658",
  appId: "1:278174024658:web:e63c7100b2fbb50a5ffe0b",
  measurementId: "G-0SM5DWPKE6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function NewsThoughtLog() {
  const [entries, setEntries] = useState([]);
  const [newsTitle, setNewsTitle] = useState("");
  const [newsLink, setNewsLink] = useState("");
  const [thoughts, setThoughts] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [user, setUser] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const fetchEntries = async () => {
      const q = query(collection(db, "entries"), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const loaded = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setEntries(loaded);
    };

    fetchEntries();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const now = new Date();
    const newEntry = {
      newsTitle,
      newsLink,
      thoughts,
      createdAt: now,
      date: now.toLocaleDateString(),
      time: now.toLocaleTimeString(),
    };

    const docRef = await addDoc(collection(db, "entries"), newEntry);
    setEntries([{ id: docRef.id, ...newEntry }, ...entries]);

    setNewsTitle("");
    setNewsLink("");
    setThoughts("");
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "entries", id));
    setEntries(entries.filter((entry) => entry.id !== id));
  };

  return (
    <div className="max-w-xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">📰 나의 투자 뉴스 일지</h1>

      {user && (
        <div className="flex justify-between items-center mb-4">
          <span>👋 {user.email}</span>
          <button
            onClick={() => signOut(getAuth())}
            className="text-sm text-red-500 hover:underline"
          >
            로그아웃
          </button>
        </div>
      )}

      {!user && (
        <>
          <SignUp />
          <Auth onUserChanged={setUser} />
        </>
      )}

      <input
        type="text"
        placeholder="검색어 입력 (제목 또는 생각)"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full border p-2 rounded mb-4"
      />

      {user ? (
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <input
            type="text"
            placeholder="뉴스 제목"
            value={newsTitle}
            onChange={(e) => setNewsTitle(e.target.value)}
            className="w-full border p-2 rounded"
            required
          />
          <input
            type="url"
            placeholder="뉴스 링크 (선택)"
            value={newsLink}
            onChange={(e) => setNewsLink(e.target.value)}
            className="w-full border p-2 rounded"
          />
          <textarea
            placeholder="나의 생각을 입력하세요"
            value={thoughts}
            onChange={(e) => setThoughts(e.target.value)}
            className="w-full border p-2 rounded"
            rows={4}
            required
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            기록하기
          </button>
        </form>
      ) : (
        <p className="text-gray-600 mb-6">✋ 로그인 후 뉴스 일지를 작성할 수 있습니다.</p>
      )}

      <div className="space-y-4">
        {entries
          .filter((entry) =>
            entry.newsTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
            entry.thoughts.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map((entry) => (
            <div key={entry.id} className="border rounded p-4 shadow">
              <div className="text-sm text-gray-500 mb-1">
                📅 {entry.date} 🕒 {entry.time || ""}
              </div>
              <div className="font-semibold text-lg">{entry.newsTitle}</div>
              {entry.newsLink && (
                <a
                  href={entry.newsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 text-sm"
                >
                  원문 보기
                </a>
              )}
              <p className="mt-2 whitespace-pre-line">{entry.thoughts}</p>
              {user && (
                <button
                  onClick={() => handleDelete(entry.id)}
                  className="mt-2 text-xs text-red-500 hover:underline"
                >
                  삭제하기
                </button>
              )}
            </div>
        ))}
      </div>
    </div>
  );
}
