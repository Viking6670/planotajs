// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import Login from '@/components/Login.jsx';
import Tasks from '@/components/Tasks.jsx';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/" element={<Login />} />
      <Route path="/tasks" element={<Tasks />} />
    </Routes>
  );
}

export default App;
