package com.onlineexam.model;

public class ApiResponse {
    private String status;
    private Object data;
    private String message;

    // Constructors
    public ApiResponse() {}

    public ApiResponse(String status, Object data) {
        this.status = status;
        this.data = data;
    }

    public ApiResponse(String status, String message) {
        this.status = status;
        this.message = message;
    }

    // Getters and setters
    public String getStatus() { 
        return status; 
    }
    
    public void setStatus(String status) { 
        this.status = status; 
    }
    
    public Object getData() { 
        return data; 
    }
    
    public void setData(Object data) { 
        this.data = data; 
    }
    
    public String getMessage() { 
        return message; 
    }
    
    public void setMessage(String message) { 
        this.message = message; 
    }
}