package com.onlineexam.controller;

import com.onlineexam.model.User;
import com.onlineexam.model.Admin;
import com.onlineexam.repository.UserRepository;
import com.onlineexam.repository.AdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AdminRepository adminRepository;

    private BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // User Registration
   // Add these methods to your existing AuthController
@PostMapping("/user/register")
public ResponseEntity<?> registerUser(@RequestBody User user) {
    try {
        if(userRepository.findByEmail(user.getEmail()).isPresent()) {
            Map<String, String> response = new HashMap<>();
            response.put("message", "Email already exists!");
            response.put("status", "error");
            return ResponseEntity.badRequest().body(response);
        }
        
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        User savedUser = userRepository.save(user);
        
        // Remove password from response
        savedUser.setPassword(null);
        
        Map<String, Object> response = new HashMap<>();
        response.put("message", "User registered successfully!");
        response.put("status", "success");
        response.put("user", savedUser);
        
        return ResponseEntity.ok(response);
    } catch (Exception e) {
        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("message", "Error registering user: " + e.getMessage());
        errorResponse.put("status", "error");
        return ResponseEntity.badRequest().body(errorResponse);
    }
}

@PostMapping("/user/login")
public ResponseEntity<?> loginUser(@RequestBody User loginRequest) {
    try {
        User user = userRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found with email: " + loginRequest.getEmail()));

        if (passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())) {
            // Remove password from response
            user.setPassword(null);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Login successful!");
            response.put("status", "success");
            response.put("user", user);
            
            return ResponseEntity.ok(response);
        } else {
            throw new RuntimeException("Invalid password");
        }
    } catch (RuntimeException e) {
        Map<String, String> errorResponse = new HashMap<>();
        errorResponse.put("message", e.getMessage());
        errorResponse.put("status", "error");
        return ResponseEntity.badRequest().body(errorResponse);
    }
}
    // Admin Login - UPDATED to handle plain text passwords
    @PostMapping("/admin/login")
    public ResponseEntity<?> loginAdmin(@RequestBody Admin admin) {
        Map<String, Object> response = new HashMap<>();
        
        return adminRepository.findByEmail(admin.getEmail())
                .map(a -> {
                    boolean passwordMatches;
                    
                    // Check if password is stored as BCrypt
                    if (a.getPassword().startsWith("$2a$")) {
                        // Password is BCrypt encoded
                        passwordMatches = passwordEncoder.matches(admin.getPassword(), a.getPassword());
                    } else {
                        // Password is plain text - compare directly
                        passwordMatches = admin.getPassword().equals(a.getPassword());
                        
                        // Optional: Auto-upgrade to BCrypt for security
                        if (passwordMatches) {
                            a.setPassword(passwordEncoder.encode(admin.getPassword()));
                            adminRepository.save(a);
                            System.out.println("Admin password upgraded to BCrypt");
                        }
                    }
                    
                    if (passwordMatches) {
                        response.put("message", "Admin login successful!");
                        response.put("status", "success");
                        response.put("admin", a);
                        return ResponseEntity.ok(response);
                    } else {
                        response.put("message", "Invalid password!");
                        response.put("status", "error");
                        return ResponseEntity.badRequest().body(response);
                    }
                })
                .orElse(ResponseEntity.badRequest().body(Map.of(
                    "message", "Admin not found!", 
                    "status", "error"
                )));
    }

    // Optional: Endpoint to encode all existing plain text passwords
    @PostMapping("/encode-passwords")
    public ResponseEntity<?> encodeAllPasswords() {
        try {
            // Encode admin passwords
            adminRepository.findAll().forEach(admin -> {
                if (!admin.getPassword().startsWith("$2a$")) {
                    admin.setPassword(passwordEncoder.encode(admin.getPassword()));
                    adminRepository.save(admin);
                }
            });
            
            // Encode user passwords
            userRepository.findAll().forEach(user -> {
                if (!user.getPassword().startsWith("$2a$")) {
                    user.setPassword(passwordEncoder.encode(user.getPassword()));
                    userRepository.save(user);
                }
            });
            
            return ResponseEntity.ok(Map.of("message", "All passwords encoded successfully", "status", "success"));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("message", "Error encoding passwords: " + e.getMessage(), "status", "error"));
        }
    }
    // Add this method to your AuthController.java
@PutMapping("/admin/update")
public ResponseEntity<?> updateAdmin(@RequestBody Map<String, String> updateRequest) {
    Map<String, Object> response = new HashMap<>();
    
    try {
        String email = updateRequest.get("email");
        String username = updateRequest.get("username");
        String currentPassword = updateRequest.get("currentPassword");
        String newPassword = updateRequest.get("newPassword");
        
        // Find admin by current session or email
        Admin admin = adminRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        
        // Verify current password
        if (!admin.getPassword().equals(currentPassword)) {
            response.put("message", "Current password is incorrect");
            response.put("status", "error");
            return ResponseEntity.badRequest().body(response);
        }
        
        // Update fields
        admin.setUsername(username);
        admin.setEmail(email);
        
        // Update password if provided
        if (newPassword != null && !newPassword.trim().isEmpty()) {
            admin.setPassword(newPassword);
        }
        
        // Save updated admin
        Admin updatedAdmin = adminRepository.save(admin);
        
        // Remove password from response for security
        updatedAdmin.setPassword("[PROTECTED]");
        
        response.put("message", "Profile updated successfully");
        response.put("status", "success");
        response.put("admin", updatedAdmin);
        
        return ResponseEntity.ok(response);
        
    } catch (RuntimeException e) {
        response.put("message", e.getMessage());
        response.put("status", "error");
        return ResponseEntity.badRequest().body(response);
    }
}
}