# 🔧 Sửa Lỗi CORS - IllegalArgumentException

## ❌ Lỗi Gặp Phải

```
java.lang.IllegalArgumentException: 
When allowCredentials is true, allowedOrigins cannot contain the special value "*" 
since that cannot be set on the "Access-Control-Allow-Origin" response header. 
To allow credentials to a set of origins, list them explicitly 
or consider using "allowedOriginPatterns" instead.
```

---

## 🔍 Nguyên Nhân

**Browser security policy (CORS - Cross-Origin Resource Sharing)**:

1. **allowCredentials = true**: Cho phép gửi cookies/credentials
2. **allowedOrigins = "*"**: Cho phép tất cả origins
3. **Mâu thuẫn**: Không thể kết hợp cả hai!

### Vì sao?
- Khi credentials = true, browser cần biết chính xác origin nào được phép
- Wildcard "*" là quá rộng, không an toàn
- Browser sẽ reject nếu cả hai được set

---

## ✅ Cách Sửa (Đã Implement)

### Bước 1: Thay Đổi CorsConfig.java

**OLD CODE:**
```java
configuration.setAllowedOriginPatterns(Arrays.asList("*"));
configuration.setAllowCredentials(true);  // ❌ Mâu thuẫn!
```

**NEW CODE:**
```java
configuration.setAllowedOriginPatterns(
    "http://localhost:*",           // ✅ All localhost ports
    "http://127.0.0.1:*",          // ✅ Loopback IP
    "https://localhost:*",         // ✅ HTTPS version
    "https://127.0.0.1:*",         // ✅ HTTPS loopback
    "http://localhost:3000",       // ✅ React typical port
    "http://localhost:5173",       // ✅ Vite dev port
    "http://localhost:5174"        // ✅ Alternative Vite port
);
configuration.setAllowCredentials(true); // ✅ Và credentials
```

---

## 📝 Chi Tiết Thay Đổi

### File: `backend/src/main/java/vn/fpt/se18/MentorLinking_BackEnd/config/CorsConfig.java`

**Method 1: corsConfigurationSource()**
```java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    // ✅ Use allowedOriginPatterns instead of wildcard when credentials enabled
    configuration.setAllowedOriginPatterns(
        "http://localhost:*",
        "http://127.0.0.1:*",
        "https://localhost:*",
        "https://127.0.0.1:*",
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174"
    );
    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH"));
    configuration.setAllowedHeaders(Arrays.asList("*"));
    configuration.setAllowCredentials(true);
    configuration.setMaxAge(3600L);

    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
}
```

**Method 2: corsConfigurer()**
```java
@Bean
public WebMvcConfigurer corsConfigurer() {
    return new WebMvcConfigurer() {
        @Override
        public void addCorsMappings(CorsRegistry registry) {
            // ✅ Use allowedOriginPatterns instead of wildcard when credentials enabled
            registry.addMapping("/**")
                    .allowedOriginPatterns(
                        "http://localhost:*",
                        "http://127.0.0.1:*",
                        "https://localhost:*",
                        "https://127.0.0.1:*",
                        "http://localhost:3000",
                        "http://localhost:5173",
                        "http://localhost:5174"
                    )
                    .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS", "HEAD", "PATCH")
                    .allowedHeaders("*")
                    .allowCredentials(true)
                    .maxAge(3600);
        }
    };
}
```

---

## 🚀 Cách Áp Dụng

### Bước 1: Verify File Đã Được Sửa
```bash
cat c:\EXE101\Group02_MentorLink\backend\src\main\java\vn\fpt\se18\MentorLinking_BackEnd\config\CorsConfig.java
```

✅ Kiểm tra xem `allowedOriginPatterns(` có xuất hiện không

### Bước 2: Rebuild Backend
```bash
cd c:\EXE101\Group02_MentorLink\backend

# Clear Maven cache (nếu lỗi dependency)
rmdir /s %USERPROFILE%\.m2\repository\io\qdrant
rmdir /s %USERPROFILE%\.m2\repository\com\google\ai

# Rebuild
.\mvnw clean install -DskipTests
```

### Bước 3: Run Backend
```bash
.\mvnw spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"
```

**Expected logs:**
```
INFO CorsConfig - CORS configuration applied successfully
INFO AppConfig - Security filter chain configured
INFO Tomcat - Tomcat started on port 8080
```

### Bước 4: Test CORS
```bash
# Test từ Vite dev server (port 5173)
curl -X POST http://localhost:8080/api/chatbot/chat \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:5173" \
  -H "Cookie: JSESSIONID=test" \
  -d "{\"message\":\"test\",\"userId\":null}"

# Expected Response Headers:
# Access-Control-Allow-Origin: http://localhost:5173
# Access-Control-Allow-Credentials: true
```

---

## 📊 Bảng So Sánh

| Cấu Hình | Trước (❌) | Sau (✅) |
|---------|-----------|---------|
| **allowCredentials** | true | true |
| **allowedOrigins** | "*" | "http://localhost:*" |
| **allowedOriginPatterns** | "*" (wildcard) | localhost patterns |
| **Lỗi CORS** | ✅ Có | ❌ Không |
| **Credentials sent** | ❌ Không | ✅ Có |

---

## 🎯 Kết Quả Dự Kiến

### Trước Sửa:
```
ERROR - java.lang.IllegalArgumentException
Browser: CORS policy: ...
Console: 500 Internal Server Error
```

### Sau Sửa:
```
✅ Backend starts without CORS error
✅ Frontend can send credentials
✅ API responses have correct CORS headers
✅ Browser allows cross-origin requests
```

---

## 💡 For Production (Important!)

### Production Configuration:
```yaml
# application-prod.yml
cors:
  allowed-origins:
    - "https://mentorlink.com"
    - "https://www.mentorlink.com"
  allow-credentials: true
```

### Code for Production:
```java
// In CorsConfig.java
@Bean
@Profile("prod")
public CorsConfigurationSource corsProdConfiguration() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(
        "https://mentorlink.com",
        "https://www.mentorlink.com"
    );
    configuration.setAllowCredentials(true);
    // ... rest of configuration
}
```

---

## ✅ Verification Checklist

- [ ] CorsConfig.java file sửa xong
- [ ] Xóa Maven cache (local repo)
- [ ] Rebuild successfully
- [ ] Backend logs không có CORS error
- [ ] Frontend có thể gửi request tới backend
- [ ] Browser console không có CORS warnings
- [ ] Response headers có `Access-Control-Allow-Origin`
- [ ] Credentials (cookies) được gửi đi

---

## 🔗 Resource Links

- [Spring CORS Docs](https://spring.io/guides/gs/cors/)
- [MDN CORS Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
- [allowCredentials Explanation](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Access-Control-Allow-Credentials)

---

**Last Updated**: October 30, 2025  
**Status**: ✅ FIXED - CORS Configuration Corrected
