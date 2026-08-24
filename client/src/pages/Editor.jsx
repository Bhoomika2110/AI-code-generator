import Editor from '@monaco-editor/react';
import React, { useEffect, useRef, useState } from 'react';
import { serverUrl } from '../App';
import axios from 'axios';
import { useNavigate, useParams } from 'react-router-dom';
import { Rocket, Code2, Monitor, Send, X, ArrowLeft, MessageSquare } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

function WebsiteEditor() {

  const { id } = useParams();
  const navigate = useNavigate();
  const [website, setWebsite] = useState(null);
  const [error, setError] = useState("");
  const [code, setCode] = useState("");
  const [messages, setMessages] = useState([]);
  const [prompt, setPrompt] = useState("");
  const iframeRef = useRef(null);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [thinkingIndex, setThinkingIndex] = useState(0);
  const [showCode, setShowCode] = useState(false);
  const [showFullPreview, setShowFullPreview] = useState(false);
  const [showChat, setShowChat] = useState(false);

  const thinkingSteps = [
    "Understanding your request...",
    "Planning layout changes...",
    "Improving responsiveness...",
    "Applying animations...",
    "Finalizing update..."
  ];

  // UPDATE WEBSITE
  const handleUpdate = async () => {

    if (!prompt) return;

    setUpdateLoading(true);

    const text = prompt;

    setPrompt("");

    setMessages((m) => [...m, { role: "user", content: text }]);

    try {

      const result = await axios.post(
        `${serverUrl}/api/website/update/${id}`,
        { prompt: text },
        { withCredentials: true }
      );

      setUpdateLoading(false);

      setMessages((m) => [...m, { role: "ai", content: result.data.message }]);

      setCode(result.data.code);

    } catch (err) {

      setUpdateLoading(false);

      console.log(err);

    }

  };

  // DEPLOY WEBSITE
  const handleDeploy = async () => {

    try {

      const result = await axios.get(
        `${serverUrl}/api/website/deploy/${website._id}`,
        { withCredentials: true }
      );

      window.open(result.data.url, "_blank");

    } catch (error) {

      console.log(error.response?.data || error.message);

    }

  };

   
  // THINKING ANIMATION
  useEffect(() => {

    if (!updateLoading) return;

    const i = setInterval(() => {
      setThinkingIndex((i) => (i + 1) % thinkingSteps.length);
    }, 1200);

    return () => clearInterval(i);

  }, [updateLoading]);

  // GET WEBSITE
  useEffect(() => {

    const getWebsite = async () => {

      try {

        const res = await axios.get(
          `${serverUrl}/api/website/get-by-id/${id}`,
          { withCredentials: true }
        );

        setWebsite(res.data);

        setCode(res.data.latestCode);

        setMessages(res.data.conversation);

      } catch (err) {

        setError(err.response?.data?.message || "Error");

      }

    };

    getWebsite();

  }, [id]);

  // UPDATE PREVIEW
  useEffect(() => {

    if (!iframeRef.current || !code) return;

    const blob = new Blob([code], { type: "text/html" });

    const url = URL.createObjectURL(blob);

    iframeRef.current.src = url;

    return () => URL.revokeObjectURL(url);

  }, [code]);

  if (error) {

    return (
      <div className="h-screen flex items-center justify-center bg-black text-red-400">
        {error}
      </div>
    );

  }

  if (!website) {

    return (
      <div className="h-screen flex items-center justify-center bg-black text-zinc-400">
        Loading...
      </div>
    );

  }

  return (

    <div className="h-screen w-screen flex bg-black text-white overflow-hidden">

      {/* CHAT PANEL */}

      <aside className="hidden lg:flex w-[380px] flex-col border-r border-white/10 bg-black/80">

        <Header title={website.title} />

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">

          {messages.map((m, i) => (

            <div key={i} className={`max-w-[85%] ${m.role === "user" ? "ml-auto" : "mr-auto"}`}>

              <div className={`px-4 py-2.5 rounded-2xl text-sm ${m.role === "user" ? "bg-white text-black" : "bg-white/5 border border-white/10 text-zinc-200"}`}>

                {m.content}

              </div>

            </div>

          ))}

          {updateLoading && (

            <div className="max-w-[85%] mr-auto">

              <div className="px-4 py-2.5 rounded-2xl text-xs bg-white/5 border border-white/10 text-zinc-400 italic">

                {thinkingSteps[thinkingIndex]}

              </div>

            </div>

          )}

        </div>

        <div className="p-3 border-t border-white/10">

          <div className="flex gap-2">

            <input
              placeholder="Describe Change..."
              className="flex-1 rounded-2xl px-4 py-3 bg-white/5 border border-white/10"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />

            <button
              className="px-4 py-3 rounded-2xl bg-white text-black"
              disabled={updateLoading}
              onClick={handleUpdate}
            >
              <Send size={14} />
            </button>

          </div>

        </div>

      </aside>

      {/* PREVIEW AREA */}

      <div className="flex-1 flex flex-col">

        <div className="h-14 px-4 flex justify-between items-center border-b border-white/10 bg-black/80">

          <span className="text-xs text-zinc-400">Live Preview</span>

          <div className="flex gap-2">
           {website.deployed ?"":<button
              onClick={handleDeploy}
              className="flex items-center gap-2 px-4 py-1.5 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 text-sm font-semibold"
            >
              <Rocket size={14} /> Deploy
            </button>}

            <button className="p-2 lg:hidden" onClick={() => setShowChat(true)}>
              <MessageSquare size={18} />
            </button>

            <button className="p-2" onClick={() => setShowCode(true)}>
              <Code2 size={18} />
            </button>

            <button className="p-2" onClick={() => setShowFullPreview(true)}>
              <Monitor size={18} />
            </button>

          </div>

        </div>

        <iframe
          ref={iframeRef}
          sandbox="allow-scripts allow-same-origin allow-forms"
          className="flex-1 w-full bg-white"
        />
<AnimatePresence>
  {showCode && (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: 0 }}
      exit={{ x: "100%" }}
      transition={{ duration: 0.35 }}
      className="fixed top-0 right-0 z-50 h-screen
                 w-full md:w-[60%] lg:w-1/2
                 bg-[#0d1117] border-l border-white/10
                 shadow-2xl"
    >
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-white/10">
        <h2 className="font-semibold text-white">
          HTML Editor
        </h2>

        <button
          onClick={() => setShowCode(false)}
          className="p-2 rounded-lg hover:bg-white/10"
        >
          <X size={20} />
        </button>
      </div>

      {/* Monaco */}
      <Editor
        height="calc(100vh - 56px)"
        defaultLanguage="html"
        theme="vs-dark"
        value={code}
        onChange={(value) => setCode(value || "")}
        options={{
          fontSize: 14,
          minimap: { enabled: false },
          wordWrap: "on",
          automaticLayout: true,
        }}
      />
    </motion.div>
  )}
</AnimatePresence>
<AnimatePresence>
  {showFullPreview && (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 bg-black"
    >
      {/* Header */}
      <div className="h-14 flex items-center justify-between px-4 border-b border-white/10 bg-[#0d1117]">
        

    
  <div className="flex gap-2">
  </div>
        <button
          onClick={() => setShowFullPreview(false)}
          className="p-2 rounded-lg hover:bg-white/10"
        >
          <X size={20} />
        </button>
      </div>

      {/* Preview */}
      <iframe
        src={iframeRef.current?.src}
        className="w-full h-[calc(100vh-56px)] bg-white"
        sandbox="allow-scripts allow-same-origin allow-forms"
      />
    </motion.div>
  )}
</AnimatePresence>
      </div>

    </div>

  );

}

function Header({ onclose, title }) {

  return (

    <div className="h-14 px-4 flex items-center border-b border-white/10">

      <span className="font-semibold truncate">{title}</span>

      {onclose && (
        <button className="ml-auto" onClick={onclose}>
          <X size={18} color="white" />
        </button>
      )}

    </div>

  );

}

export default WebsiteEditor;


