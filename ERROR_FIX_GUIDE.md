# 🔧 Fix Lỗi Backend - Hướng Dẫn Chi Tiết

## ❌ Lỗi Phát Hiện

```
Failed to load resource: the server responded with a status of 400
AxiosError when calling POST /api/chatbot/chat
```

## 🔍 Nguyên Nhân

1. **Dependencies bị xóa** từ `pom.xml`:
   - `io.qdrant:qdrant-client`
   - `com.google.ai.client.generativeai:google-generativeai`

2. **Backend chưa compile** với dependencies mới

3. **GenerativeModel bean** không được tạo do GeminiConfig lỗi

## ✅ Giải Pháp

### Step 1: Rebuild Maven

```bash
cd c:\EXE101\Group02_MentorLink\backend
mvn clean install -DskipTests
```

**Expected output:**
```
[INFO] --- maven-compiler-plugin:3.10.1:compile (default-compile) ---
[INFO] Changes detected - recompiling module: MentorLinking-BackEnd
[INFO] BUILD SUCCESS
```

### Step 2: Kill Old Process

```bash
# Nếu backend vẫn chạy, kill process
taskkill /F /IM java.exe

# Hoặc tìm port 8080
netstat -ano | findstr :8080
```

### Step 3: Run Backend với Spring Profile

```bash
# Set environment variables trước
$env:QDRANT_HOST="4df83e44-84fa-4101-b143-22c8743255cd.europe-west3-0.gcp.cloud.qdrant.io"
$env:QDRANT_PORT="6334"
$env:QDRANT_API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIn0.D_jAvVkeUiItiRmRq4fnJwh403JwXgZnXv1gY3V_ock"
$env:QDRANT_TLS="true"
$env:GEMINI_API_KEY="AIzaSyA79tAvF3XlXwVHsxp0oyTtATaWinMWiVI"

# Chạy backend
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"
```

**Success logs:**
```
2025-10-30 ... INFO  ... QdrantConfig: Initializing Qdrant client
2025-10-30 ... INFO  ... QdrantConfig: Qdrant client initialized successfully
2025-10-30 ... INFO  ... GeminiConfig: Initializing Gemini model
2025-10-30 ... INFO  ... GeminiConfig: Gemini model initialized successfully
2025-10-30 ... INFO  ... ChatbotController: Chatbot service is running
```

### Step 4: Verify Backend Running

```bash
# Test health check
curl http://localhost:8080/api/chatbot/health

# Expected response:
# "Chatbot service is running"
```

### Step 5: Refresh Frontend

```bash
# In browser, press Ctrl+Shift+R (hard refresh)
# Hoặc xóa cache:
# DevTools → Application → Clear Storage
```

### Step 6: Test Chatbot

1. Click chat button (💬)
2. Type message: "Xin chào"
3. Should see AI response (not error)

---

## 🐛 Troubleshooting

### Issue 1: Maven Build Fails
```bash
# Clean cache
mvn clean
rm -r ~/.m2/repository

# Try again
mvn install
```

### Issue 2: Port 8080 Already in Use
```bash
# Find process on port 8080
netstat -ano | findstr :8080

# Kill process (example: PID 12345)
taskkill /PID 12345 /F
```

### Issue 3: Gemini API Key Error
```
Error: Gemini API key not configured
```

**Solution:**
```bash
# Verify environment variable is set
echo $env:GEMINI_API_KEY

# If empty, set it:
$env:GEMINI_API_KEY="AIzaSyA79tAvF3XlXwVHsxp0oyTtATaWinMWiVI"
```

### Issue 4: Qdrant Connection Error
```
Failed to connect to Qdrant server
```

**Solution:**
```bash
# Check if environment variables are set
echo $env:QDRANT_HOST
echo $env:QDRANT_API_KEY

# Test connection
curl -X GET https://4df83e44-84fa-4101-b143-22c8743255cd.europe-west3-0.gcp.cloud.qdrant.io:6334/collections \
  -H "api-key: your-api-key" \
  -H "Content-Type: application/json"
```

### Issue 5: 400 Bad Request
```
POST /api/chatbot/chat returns 400
```

**Solution:**
1. Check request body is valid JSON
2. Message field should not be empty
3. Check console logs:
```bash
# Show DEBUG logs
mvn spring-boot:run -Dspring-boot.run.arguments="--logging.level.root=DEBUG"
```

---

## 📝 Files Modified

✅ `backend/pom.xml` - Restored dependencies  
✅ `backend/src/main/resources/application-dev.yml` - Added server.port

---

## ✅ Verification Checklist

- [ ] Maven build successful
- [ ] Backend running on port 8080
- [ ] Health check returns "Chatbot service is running"
- [ ] Frontend can reach backend API
- [ ] Chat message sends without 400 error
- [ ] AI response appears in chat
- [ ] No errors in browser console

---

## 🎯 Next Steps

1. ✅ Run above steps
2. ✅ Test with various chat messages
3. ✅ Run TESTING_GUIDE.md test cases
4. ✅ Then deploy to production

---

**If still having issues, check:**
1. Backend logs for errors
2. Browser Network tab (check API request/response)
3. Environment variables set correctly
4. Internet connection (for Gemini API & Qdrant cloud)

---

**Last Updated**: October 30, 2025
