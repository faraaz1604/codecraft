import React, { useState, useEffect } from "react";
import { Sun, Moon, Copy, Play, Settings } from "lucide-react";
import CodeEditor from "./components/CodeEditor";
import LanguageSelector from "./components/LanguageSelector";
import CodeOutput from "./components/CodeOutput";
import Suggestions from "./components/Suggestions";
import Loading from "./components/Loading";
import ConnectionStatus from "./components/ConnectionStatus";

import { API_CONFIG, getApiToken } from './config/api';



function App() {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("python");
  const [output, setOutput] = useState("");
  const [suggestions, setSuggestions] = useState("");
  const [prompt, setPrompt] = useState("");
  const [darkMode, setDarkMode] = useState(() => {
    const savedMode = localStorage.getItem("darkMode");
    return savedMode ? JSON.parse(savedMode) : true;
  });
  const [notification, setNotification] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // ... existing state variables
  const [apiMode, setApiMode] = useState(() => {
    const savedMode = localStorage.getItem("apiMode");
    return (
      savedMode ||
      (window.location.hostname === "localhost" ? "local" : "huggingface")
    );
  });

  const [apiKey, setApiKey] = useState(
    () => localStorage.getItem("hf_api_key") || ""
  );
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    localStorage.setItem("apiMode", apiMode);
    // Adding a small delay to let the API mode update settle
    setTimeout(() => {
      const checkStatus = async () => {
        try {
          if (apiMode === "local") {
            const response = await fetch(
              `${API_CONFIG.local.baseUrl}${API_CONFIG.local.statusEndpoint}`
            );
            const data = await response.json();
            if (!data.available) {
              setSuggestions(
                "Local AI service is offline. Please ensure Ollama is running."
              );
            }
          } else {
            if (!apiKey) {
              setSuggestions(
                "Please enter your Hugging Face API key in settings."
              );
              return;
            }
            const response = await fetch(
              `${API_CONFIG.huggingface.baseUrl}/${API_CONFIG.huggingface.model}`,
              {
                method: "POST",
                headers: API_CONFIG.huggingface.headers(apiKey),
                body: JSON.stringify({ inputs: "Test connection" }),
              }
            );
            if (!response.ok) {
              setSuggestions("Invalid API key or service unavailable.");
            }
          }
        } catch (error) {
          console.error("Error checking status:", error);
          setSuggestions("Unable to connect to the service.");
        }
      };
      checkStatus();
    }, 100);
  }, [apiMode, apiKey]);

  // API Settings Component
  const ApiSettings = () => (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center ${
        showSettings ? "" : "hidden"
      }`}
    >
      <div
        className={`p-6 rounded-lg ${
          darkMode ? "bg-gray-800" : "bg-white"
        } max-w-md w-full`}
      >
        <h3
          className={`text-lg font-semibold mb-4 ${
            darkMode ? "text-white" : "text-gray-900"
          }`}
        >
          API Settings
        </h3>
        <div className="space-y-4">
          <div>
            <label
              className={`block mb-2 ${
                darkMode ? "text-gray-300" : "text-gray-700"
              }`}
            >
              API Mode
            </label>
            <select
              value={apiMode}
              onChange={(e) => setApiMode(e.target.value)}
              className={`w-full px-3 py-2 rounded ${
                darkMode
                  ? "bg-gray-700 text-white"
                  : "bg-gray-100 text-gray-900"
              }`}
            >
              <option value="local">Local (Ollama)</option>
              <option value="huggingface">Hugging Face API</option>
            </select>
          </div>

          {apiMode === "huggingface" && (
            <div>
              <label
                className={`block mb-2 ${
                  darkMode ? "text-gray-300" : "text-gray-700"
                }`}
              >
                API Key
              </label>
              <input
                type="password"
                value={apiKey}
                onChange={(e) => {
                  setApiKey(e.target.value);
                  localStorage.setItem("hf_api_key", e.target.value);
                }}
                placeholder="Enter Hugging Face API Key"
                className={`w-full px-3 py-2 rounded ${
                  darkMode
                    ? "bg-gray-700 text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
              />
            </div>
          )}

          <button
            onClick={() => setShowSettings(false)}
            className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save Settings
          </button>
        </div>
      </div>
    </div>
  );

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  const handleReviewOrGenerate = async () => {
    setIsLoading(true);
    try {
      if (apiMode === "huggingface") {
        if (!apiKey) {
          setSuggestions("Please enter your Hugging Face API key in settings");
          setIsLoading(false);
          return;
        }

        const promptText = code.trim()
          ? `Review this ${language} code and provide suggestions for improvement, followed by the improved code with "IMPROVED_CODE:" prefix:\n\n${code}`
          : `Generate ${language} code for the following request:\n\n${prompt}`;

        const response = await fetch(
          `${API_CONFIG.huggingface.baseUrl}/${API_CONFIG.huggingface.model}`,
          {
            method: "POST",
            headers: API_CONFIG.huggingface.headers(apiKey),
            body: JSON.stringify({ inputs: promptText }),
          }
        );

        if (!response.ok) {
          throw new Error("API request failed");
        }

        const data = await response.json();
        const result = data[0]?.generated_text || "";

        if (code.trim()) {
          // For code review
          const [suggestions, improvedCode] = result.split("IMPROVED_CODE:");
          setSuggestions(suggestions.trim());
          setOutput(improvedCode ? improvedCode.trim() : "");
        } else {
          // For code generation
          setOutput(result.trim());
          setSuggestions("");
        }
      } else {
        // Local API logic
        if (code.trim()) {
          const response = await fetch(
            `${API_CONFIG.local.baseUrl}${API_CONFIG.local.reviewEndpoint}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ code, language }),
            }
          );
          const data = await response.json();
          setSuggestions(data.suggestions);
          setOutput(data.improvedCode || "");
        } else if (prompt.trim()) {
          const response = await fetch(
            `${API_CONFIG.local.baseUrl}${API_CONFIG.local.generateEndpoint}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ prompt, language }),
            }
          );
          const data = await response.json();
          setOutput(data.code || "");
          setSuggestions("");
        }
      }
    } catch (error) {
      console.error("Error:", error);
      setSuggestions("Error processing request: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setNotification("Copied to clipboard!");
      setTimeout(() => setNotification(""), 2000);
    } catch (err) {
      setNotification("Failed to copy");
      setTimeout(() => setNotification(""), 2000);
    }
  };

  return (
    <div
      className={`min-h-screen ${
        darkMode ? "dark bg-gray-900" : "bg-gray-50"
      } transition-colors duration-200`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-4">
            <h1
              className={`text-4xl font-bold ${
                darkMode ? "text-white" : "text-gray-900"
              } hover:scale-105 transition-transform duration-200`}
            >
              CodeCraft AI
            </h1>
            <span
              className={`px-3 py-1 rounded-full text-sm ${
                darkMode
                  ? "bg-blue-900 text-blue-200"
                  : "bg-blue-100 text-blue-800"
              } animate-pulse`}
            >
              Beta
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <ConnectionStatus
              darkMode={darkMode}
              apiMode={apiMode}
              
            />
            <button
              onClick={() => setShowSettings(true)}
              className={`p-2 rounded-lg transform hover:scale-110 transition-all duration-200 ${
                darkMode
                  ? "bg-gray-800 text-gray-200"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`p-2 rounded-lg transform hover:scale-110 transition-all duration-200 ${
                darkMode
                  ? "bg-gray-800 text-gray-200"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              {darkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </button>
            <LanguageSelector
              selectedLanguage={language}
              onLanguageChange={setLanguage}
              darkMode={darkMode}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Describe what you want to code..."
              className={`w-full px-4 py-3 rounded-lg border transform hover:scale-101 transition-all duration-200 ${
                darkMode
                  ? "bg-gray-800 border-gray-700 text-white placeholder-gray-400"
                  : "bg-white border-gray-300 text-gray-900 placeholder-gray-500"
              } focus:outline-none focus:ring-2 focus:ring-blue-500 focus:scale-101`}
            />

            <div className="transform hover:scale-101 transition-all duration-200">
              <CodeEditor
                code={code}
                language={language}
                onChange={setCode}
                darkMode={darkMode}
              />
            </div>

            <button
              onClick={handleReviewOrGenerate}
              disabled={isLoading}
              className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-all duration-200 transform hover:scale-102 hover:shadow-lg ${
                isLoading
                  ? "bg-gray-500 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              } text-white`}
            >
              <Play className="w-5 h-5" />
              {isLoading
                ? "Processing..."
                : code.trim()
                ? "Review Code"
                : "Generate Code"}
            </button>
          </div>

          <div className="space-y-6">
            <h2
              className={`text-2xl font-semibold ${
                darkMode ? "text-white" : "text-gray-900"
              }`}
            >
              Results
            </h2>

            <div className="transform hover:scale-101 transition-all duration-200">
              {isLoading ? (
                <Loading darkMode={darkMode} />
              ) : (
                <Suggestions suggestions={suggestions} darkMode={darkMode} />
              )}
            </div>

            <div className="relative transform hover:scale-101 transition-all duration-200">
              {isLoading ? (
                <Loading darkMode={darkMode} />
              ) : (
                <>
                  <CodeOutput
                    output={output}
                    language={language}
                    darkMode={darkMode}
                  />
                  {output && (
                    <button
                      onClick={() => copyToClipboard(output)}
                      className={`absolute top-4 right-4 p-2 rounded transform hover:scale-110 transition-all duration-200 ${
                        darkMode
                          ? "bg-gray-700 hover:bg-gray-600"
                          : "bg-gray-200 hover:bg-gray-300"
                      }`}
                      title="Copy to clipboard"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  )}
                  {notification && (
                    <div
                      className={`absolute top-4 right-16 px-3 py-1 rounded ${
                        darkMode
                          ? "bg-gray-700 text-gray-200"
                          : "bg-gray-200 text-gray-800"
                      } animate-fade-in`}
                    >
                      {notification}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer
          className={`mt-16 pt-8 border-t ${
            darkMode ? "border-gray-800" : "border-gray-200"
          }`}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div
              className={`p-6 rounded-lg transform hover:scale-102 transition-all duration-200 ${
                darkMode ? "bg-gray-800/50" : "bg-white"
              } shadow-lg`}
            >
              <h3
                className={`text-lg font-semibold mb-4 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                About CodeCraft AI
              </h3>
              <p
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                }`}
              >
                CodeCraft AI is an intelligent code assistant that helps
                developers write, review, and improve their code. Powered by
                advanced AI, it supports multiple programming languages and
                provides instant feedback and suggestions.
              </p>
            </div>
            <div
              className={`p-6 rounded-lg transform hover:scale-102 transition-all duration-200 ${
                darkMode ? "bg-gray-800/50" : "bg-white"
              } shadow-lg`}
            >
              <h3
                className={`text-lg font-semibold mb-4 ${
                  darkMode ? "text-white" : "text-gray-900"
                }`}
              >
                Features
              </h3>
              <ul
                className={`text-sm ${
                  darkMode ? "text-gray-400" : "text-gray-600"
                } space-y-2`}
              >
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Code Generation from Natural Language
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Intelligent Code Review
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                  Multi-Language Support
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
                  Instant Code Improvement Suggestions
                </li>
              </ul>
            </div>
          </div>
          <div
            className={`text-center mt-8 pt-4 border-t ${
              darkMode
                ? "border-gray-800 text-gray-500"
                : "border-gray-200 text-gray-400"
            }`}
          >
            <p className="text-sm">
              © {new Date().getFullYear()} CodeCraft AI by Faraaz. All rights
              reserved.
            </p>
          </div>
        </footer>
        <ApiSettings />
      </div>
    </div>
  );
}

export default App;
