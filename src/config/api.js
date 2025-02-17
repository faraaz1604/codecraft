const DEFAULT_TOKEN = "aGZfV2pyanBQeUxLd0N0Tk9mQ3NnTWdnQVZVVHRDTGtuc1hwcg=="; 

export const getApiToken = () => {
  const userToken = localStorage.getItem('hf_api_key');
  if (userToken && userToken.trim()) {
    return userToken;
  }
  return atob(DEFAULT_TOKEN);
};

export const API_CONFIG = {
  local: {
    baseUrl: "http://localhost:8080/api",
    statusEndpoint: "/status",
    reviewEndpoint: "/review",
    generateEndpoint: "/generate",
  },
  huggingface: {
    baseUrl: "https://api-inference.huggingface.co/models",
    model: "bigcode/starcoder",
    headers: (apiKey) => ({
      Authorization: `Bearer ${apiKey || getApiToken()}`,
      "Content-Type": "application/json",
    }),
  },
};