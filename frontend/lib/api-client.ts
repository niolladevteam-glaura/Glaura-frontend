export const apiClient = {
  get: async (url: string) => {
    const token = localStorage.getItem("authToken");
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    
    const response = await fetch(url, { headers });
    return response;
  },
  
  post: async (url: string, body: any) => {
    const token = localStorage.getItem("authToken");
    const headers = {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` })
    };
    
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(body)
    });
    
    return response;
  },
  
  put: async (url: string, body: any) => {
    const token = localStorage.getItem("authToken");
    const headers = {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` })
    };
    
    const response = await fetch(url, {
      method: "PUT",
      headers,
      body: JSON.stringify(body)
    });
    
    return response;
  },
  
  delete: async (url: string) => {
    const token = localStorage.getItem("authToken");
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    
    const response = await fetch(url, { 
      method: "DELETE", 
      headers 
    });
    
    return response;
  }
};