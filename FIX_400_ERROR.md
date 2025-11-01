# 🔧 Sửa Lỗi 400 Bad Request - Chi Tiết

## ❌ Lỗi Gặp Phải

```
POST /api/chatbot/chat 400 (Bad Request)
AxiosError - Request failed with status code 400
```

---

## 🔍 Nguyên Nhân

### Lý Do 1: Exception trong ChatbotService
- **GenerativeModel** hoặc **QdrantClient** không được khởi tạo
- **API key** không hợp lệ
- **Network** không kết nối đến Qdrant/Gemini

### Lý Do 2: Request Body không hợp lệ
- Message field là null/empty
- Content-Type header thiếu

### Lý Do 3: Backend exception
- Dependency import error
- Service autowiring failed

---

## ✅ Các Sửa Chữa Đã Thực Hiện

### 1️⃣ **Frontend (ChatbotWidget.jsx)**
```javascript
✅ Thêm Content-Type header
✅ Thêm timeout (10 seconds)
✅ Cải thiện error logging
✅ Hiển thị chi tiết error status
```

### 2️⃣ **Backend Controller**
```java
✅ Better input validation
✅ Always return ChatResponseDTO (even for errors)
✅ Add detailed error logging
✅ Return 200 OK with error message (better UX)
```

### 3️⃣ **Backend Service (ChatbotService)**
```java
✅ Thêm Fallback response khi AI fail
✅ Catch exception riêng biệt
✅ Return meaningful response thay vì exception
```

---

## 🚀 Cách Khắc Phục Bước 1: Backend

### A. Clean & Rebuild
```bash
cd c:\EXE101\Group02_MentorLink\backend

# Clean cache
mvn clean

# Full rebuild
mvn install -DskipTests
```

**Nếu lỗi:**
```bash
# Try clearing local repository
rmdir /s %USERPROFILE%\.m2\repository

mvn install -DskipTests
```

### B. Kiểm Tra Dependencies
```bash
# Liệt kê dependencies đã download
mvn dependency:tree | findstr chatbot

# Nếu thiếu, download lại
mvn dependency:resolve
```

### C. Set Environment Variables (PowerShell)
```powershell
# BƯỚC QUAN TRỌNG: Thiết lập API keys
$env:GEMINI_API_KEY="AIzaSyA79tAvF3XlXwVHsxp0oyTtATaWinMWiVI"
$env:QDRANT_HOST="4df83e44-84fa-4101-b143-22c8743255cd.europe-west3-0.gcp.cloud.qdrant.io"
$env:QDRANT_PORT="6334"
$env:QDRANT_API_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhY2Nlc3MiOiJtIn0.D_jAvVkeUiItiRmRq4fnJwh403JwXgZnXv1gY3V_ock"
$env:QDRANT_TLS="true"

# Verify
echo "GEMINI: $env:GEMINI_API_KEY"
echo "QDRANT: $env:QDRANT_HOST"
```

### D. Start Backend
```bash
# Với DEBUG logging
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev --logging.level.root=DEBUG"
```

**Expected logs:**
```
INFO QdrantConfig - Initializing Qdrant client
INFO QdrantConfig - Qdrant client initialized successfully
INFO GeminiConfig - Initializing Gemini model
INFO GeminiConfig - Gemini model initialized successfully
INFO ChatbotController - Started ChatbotController
```

### E. Test Health Check
```bash
curl http://localhost:8080/api/chatbot/health

# Expected response:
# "Chatbot service is running"
```

---

## 🚀 Cách Khắc Phục Bước 2: Frontend

### A. Reload Browser
```
Press Ctrl+Shift+R (Force Refresh)
```

### B. Clear Cache
```
DevTools → Application → Clear Storage → Clear All
```

### C. Restart Vite Dev Server
```bash
# Kill existing process
taskkill /F /IM node.exe

# Restart
cd frontend
npm run dev
```

---

## 🧪 Test Chatbot

### Test 1: Simple Message
1. Click chat button 💬
2. Type: "Xin chào"
3. Should see response (không lỗi)

### Test 2: Mentor Query
1. Type: "Tôi cần mentor Python"
2. Should see:
   - AI response
   - Mentor recommendations
   - No 400 error

### Test 3: Direct API Test
```bash
curl -X POST http://localhost:8080/api/chatbot/chat \
  -H "Content-Type: application/json" \
  -d "{\"message\":\"test\",\"userId\":null}"

# Expected response (200 OK):
# {
#   "message": "Xin cảm ơn câu hỏi của bạn!...",
#   "recommendedMentors": [],
#   "confidence": 0.5
# }
```

---

## 📊 Nếu Vẫn Lỗi 400

### Debug Step 1: Check Browser Console
```
DevTools → Console → Look for:
- Request details
- Response status
- Error message
```

### Debug Step 2: Check Backend Logs
```
Look for lines:
- "Processing chat message: ..."
- "Error processing chat message" 
- Stack trace
```

### Debug Step 3: Check Network Tab
```
DevTools → Network → Find POST /api/chatbot/chat
- Check Request Headers
- Check Request Body
- Check Response Body
- Check Response Status
```

### Debug Step 4: Test with cURL
```bash
# If cURL works but browser doesn't → CORS issue
# If cURL fails → Backend issue

curl -X POST http://localhost:8080/api/chatbot/chat \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:5173" \
  -d "{\"message\":\"test\"}"
```

---

## 🔐 Verify Configuration Files

### ✓ Verify application-dev.yml
```yaml
# Check these lines exist:
qdrant:
  host: 4df83e44-84fa-4101-b143-22c8743255cd.europe-west3-0.gcp.cloud.qdrant.io
  port: 6334
  api-key: ${QDRANT_API_KEY}
  tls: true

gemini:
  api-key: ${GEMINI_API_KEY}
  model: gemini-1.5-flash

server:
  port: 8080
```

### ✓ Verify .env (Frontend)
```
VITE_API_URL=http://localhost:8080/api
```

---

## ✅ Verification Checklist

- [ ] Maven build: SUCCESS
- [ ] Backend health check: returns "Chatbot service is running"
- [ ] Console logs show Qdrant initialized
- [ ] Console logs show Gemini model initialized
- [ ] Frontend refreshed (Ctrl+Shift+R)
- [ ] Environment variables set
- [ ] Chat message sends (POST 200 or response OK)
- [ ] No 400 errors in console

---

## 🎯 Nếu mọi thứ OK

### Kết Quả Dự Kiến:
✅ Chat message sends successfully  
✅ AI response appears  
✅ Mentor recommendations show  
✅ No errors in console  

---

## 💡 Fallback Mode (Nếu Gemini/Qdrant Fail)

Nếu Gemini API hoặc Qdrant không khả dụng:

```
✅ Chatbot vẫn hoạt động!
✅ Trả về fallback response
✅ Gợi ý dựa trên keyword đơn giản
✅ Không throw exception
```

Ví dụ:
- User: "Tôi cần mentor Python"
- Bot: "Bạn có thể tìm mentor phù hợp bằng cách click vào nút 'Tìm Cố vấn' trên trang chủ."

---

## 📞 Nếu Vẫn Gặp Vấn Đề

1. **Lỗi dependency**: Xóa `pom.xml.bak` nếu có, rebuild
2. **Lỗi port**: Đảm bảo port 8080 không bị chiếm
3. **Lỗi API key**: Kiểm tra environment variable được set
4. **Lỗi timeout**: Backend có thể slow, tăng timeout lên 30 seconds
5. **Lỗi CORS**: Thêm header `Origin` trong cURL test

---

**Last Updated**: October 30, 2025  
**Status**: Fallback Mode Enabled
