
import { useState } from "react";
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";

export default function Auth({ onUserChanged }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const auth = getAuth();

  const handleLogin = async () => {
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      onUserChanged(userCred.user);
    } catch (err) {
      alert("로그인 실패: " + err.message);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    onUserChanged(null);
  };

  return (
    <div className="border p-4 mb-4 rounded">
      <h2 className="text-lg font-semibold mb-2">🔐 로그인</h2>
      <input
        type="email"
        placeholder="이메일"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="border p-2 rounded w-full mb-2"
      />
      <input
        type="password"
        placeholder="비밀번호"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="border p-2 rounded w-full mb-2"
      />
      <button onClick={handleLogin} className="bg-blue-500 text-white px-4 py-2 rounded mr-2">
        로그인
      </button>
      <button onClick={handleLogout} className="bg-gray-400 text-white px-4 py-2 rounded">
        로그아웃
      </button>
    </div>
  );
}
