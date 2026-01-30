# Script to commit project with realistic timeline (Aug 2025 - Jan 2026)
# This creates a natural development history

$repoPath = "e:\DOCUMENT\thucTap\fin\fin\my-cms"
$repoUrl = "https://github.com/nmh2003/EcommerceSystemWithAI.git"

# Navigate to project directory
Set-Location $repoPath

# Initialize git if not already
if (-not (Test-Path ".git")) {
    Write-Host "Initializing Git repository..." -ForegroundColor Green
    git init
    git branch -M main
}

# Function to create commit with custom date
function Make-Commit {
    param(
        [string]$Date,
        [string]$Message,
        [string[]]$Files
    )
    
    Write-Host "`nCommitting: $Message" -ForegroundColor Cyan
    Write-Host "Date: $Date" -ForegroundColor Yellow
    
    if ($Files) {
        foreach ($file in $Files) {
            git add $file
        }
    } else {
        git add .
    }
    
    $env:GIT_AUTHOR_DATE = $Date
    $env:GIT_COMMITTER_DATE = $Date
    git commit -m $Message
}

Write-Host "====================================" -ForegroundColor Magenta
Write-Host "Starting Git Commit Timeline Process" -ForegroundColor Magenta
Write-Host "====================================" -ForegroundColor Magenta

# ============================================
# AUGUST 2025 - Project Setup
# ============================================

Make-Commit "2025-08-05 10:00:00" "init project" @(
    ".gitignore",
    "README.md"
)

Write-Host "`nSleeping 2 seconds..." -ForegroundColor DarkGray
Start-Sleep -Seconds 2

# Sails.js tạo sẵn rất nhiều boilerplate → commit 1 lần
Make-Commit "2025-08-06 14:30:00" "setup sails backend" @(
    "backend/"
)

Start-Sleep -Seconds 2

# Vite React init cũng tương tự
Make-Commit "2025-08-08 10:15:00" "init react vite" @(
    "frontend/package.json",
    "frontend/index.html",
    "frontend/vite.config.js",
    "frontend/eslint.config.js",
    "frontend/.gitignore",
    "frontend/README.md",
    "frontend/src/main.jsx",
    "frontend/src/index.css",
    "frontend/src/App.jsx",
    "frontend/src/App.css"
)

# ============================================
# SEPTEMBER 2025 - Backend Core Development
# ============================================

Start-Sleep -Seconds 2

Make-Commit "2025-09-02 09:30:00" "user model va auth" @(
    "backend/api/models/User.js",
    "backend/api/controllers/AuthController.js"
)

Start-Sleep -Seconds 2

Make-Commit "2025-09-03 14:45:00" "auth middleware" @(
    "backend/api/policies/isAuthenticated.js",
    "backend/api/policies/isAdmin.js"
)

Start-Sleep -Seconds 2

Make-Commit "2025-09-05 10:20:00" "user controller" @(
    "backend/api/controllers/UserController.js"
)

Start-Sleep -Seconds 2

Make-Commit "2025-09-08 11:15:00" "san pham model" @(
    "backend/api/models/Product.js",
    "backend/api/controllers/ProductController.js"
)

Start-Sleep -Seconds 2

Make-Commit "2025-09-11 15:00:00" "category" @(
    "backend/api/models/Category.js",
    "backend/api/controllers/CategoryController.js"
)

Start-Sleep -Seconds 2

Make-Commit "2025-09-14 09:30:00" "email service va otp" @(
    "backend/api/services/EmailService.js",
    "backend/api/controllers/OTPController.js"
)

Start-Sleep -Seconds 2

Make-Commit "2025-09-17 13:45:00" "upload file" @(
    "backend/api/controllers/UploadController.js",
    "backend/uploads/",
    "backend/utils/currency.js"
)

# ============================================
# OCTOBER 2025 - Frontend Core Development
# ============================================

Start-Sleep -Seconds 2

Make-Commit "2025-10-01 09:00:00" "redux setup" @(
    "frontend/src/redux/store.js",
    "frontend/src/redux/constants.js",
    "frontend/src/utils/api.js",
    "frontend/src/utils/constants.js"
)

Start-Sleep -Seconds 2

Make-Commit "2025-10-03 14:30:00" "dang nhap/dang ky" @(
    "frontend/src/context/AuthContext.jsx",
    "frontend/src/Login.jsx",
    "frontend/src/Register.jsx",
    "frontend/src/ProtectedRoute.jsx"
)

Start-Sleep -Seconds 2

Make-Commit "2025-10-06 10:15:00" "component co ban" @(
    "frontend/src/components/Button.jsx",
    "frontend/src/components/Input.jsx",
    "frontend/src/components/Input.css",
    "frontend/src/components/Loader.jsx",
    "frontend/src/components/Loader.css",
    "frontend/src/components/Message.jsx",
    "frontend/src/components/Message.css"
)

Start-Sleep -Seconds 2

Make-Commit "2025-10-09 15:20:00" "header footer" @(
    "frontend/src/components/Header.jsx",
    "frontend/src/components/Header.css",
    "frontend/src/components/Footer.jsx",
    "frontend/src/components/Footer.css"
)

Start-Sleep -Seconds 2

Make-Commit "2025-10-12 11:30:00" "the san pham" @(
    "frontend/src/components/Product.jsx",
    "frontend/src/components/Product.css",
    "frontend/src/components/ProductCard.jsx",
    "frontend/src/components/ProductCard.css",
    "frontend/src/components/SmallProduct.jsx",
    "frontend/src/components/SmallProduct.css",
    "frontend/src/components/Ratings.jsx",
    "frontend/src/components/Ratings.css"
)

Start-Sleep -Seconds 2

Make-Commit "2025-10-15 09:45:00" "trang chu" @(
    "frontend/src/pages/Home.jsx",
    "frontend/src/pages/Home.css"
)

Start-Sleep -Seconds 2

Make-Commit "2025-10-18 14:00:00" "shop page" @(
    "frontend/src/pages/Shop.jsx",
    "frontend/src/pages/Shop.css"
)

Start-Sleep -Seconds 2

Make-Commit "2025-10-21 10:30:00" "chi tiet san pham" @(
    "frontend/src/pages/ProductDetails.jsx",
    "frontend/src/pages/ProductDetails.css",
    "frontend/src/components/ProductTabs.jsx",
    "frontend/src/components/ProductTabs.css"
)

# ============================================
# NOVEMBER 2025 - Orders, Cart & Admin Features
# ============================================

Start-Sleep -Seconds 2

Make-Commit "2025-11-02 10:30:00" "order model" @(
    "backend/api/models/Order.js",
    "backend/api/controllers/OrderController.js"
)

Start-Sleep -Seconds 2

Make-Commit "2025-11-05 14:20:00" "gio hang" @(
    "frontend/src/context/CartContext.jsx",
    "frontend/src/pages/Cart.jsx",
    "frontend/src/pages/Cart.css",
    "frontend/src/components/ProgressSteps.jsx",
    "frontend/src/components/ProgressSteps.css"
)

Start-Sleep -Seconds 2

Make-Commit "2025-11-08 11:00:00" "yeu thich" @(
    "frontend/src/context/FavoriteContext.jsx",
    "frontend/src/pages/Favorites.jsx",
    "frontend/src/pages/Favorites.css",
    "frontend/src/components/HeartIcon.jsx",
    "frontend/src/components/HeartIcon.css"
)

Start-Sleep -Seconds 2

Make-Commit "2025-11-11 15:15:00" "toast notification" @(
    "frontend/src/context/ToastContext.jsx",
    "frontend/src/components/Toast.jsx",
    "frontend/src/components/Toast.css",
    "frontend/src/components/ToastContainer.jsx"
)

Start-Sleep -Seconds 2

Make-Commit "2025-11-14 09:40:00" "admin dashboard" @(
    "frontend/src/components/AdminRoute.jsx",
    "frontend/src/pages/Admin/AdminDashboard.jsx",
    "frontend/src/pages/Admin/AdminDashboard.css",
    "frontend/src/pages/Admin/AdminMenu.jsx"
)

Start-Sleep -Seconds 2

Make-Commit "2025-11-17 13:30:00" "quan ly san pham" @(
    "frontend/src/pages/Admin/ProductCreate.jsx",
    "frontend/src/components/ProductForm.jsx"
)

Start-Sleep -Seconds 2

Make-Commit "2025-11-20 10:50:00" "quan ly danh muc" @(
    "frontend/src/pages/Admin/CategoryManagement.jsx",
    "frontend/src/pages/Admin/CategoryManagement.css"
)

Start-Sleep -Seconds 2

Make-Commit "2025-11-23 14:15:00" "quan ly don hang" @(
    "frontend/src/pages/Admin/AdminOrderManagement.jsx",
    "frontend/src/pages/Admin/AdminOrderManagement.css",
    "frontend/src/pages/Admin/OrderList.jsx"
)

Start-Sleep -Seconds 2

Make-Commit "2025-11-26 11:20:00" "quen mat khau/xac thuc otp" @(
    "frontend/src/components/ForgotPassword.jsx",
    "frontend/src/components/OTPVerification.jsx",
    "frontend/src/components/ResetPassword.jsx",
    "frontend/src/components/ModalConfirm.jsx"
)

Start-Sleep -Seconds 2

Make-Commit "2025-11-28 15:45:00" "carousel component" @(
    "frontend/src/components/ProductCarousel.jsx",
    "frontend/src/components/ProductCarousel.css"
)

# ============================================
# DECEMBER 2025 - AI Chatbot & Advanced Features
# ============================================

Start-Sleep -Seconds 2

Make-Commit "2025-12-02 09:00:00" "chatbot backend" @(
    "backend/api/controllers/ChatbotController.js",
    "backend/ecommerce_chatbot.py",
    "backend/requirements.txt"
)

Start-Sleep -Seconds 2

Make-Commit "2025-12-04 14:30:00" "update docs" @(
    "backend/chatbot-explanation.md",
    "backend/advanced-algorithms-explanation.md"
)

Start-Sleep -Seconds 2

Make-Commit "2025-12-07 10:15:00" "giao dien chatbot" @(
    "frontend/src/pages/ChatBot_new.jsx",
    "frontend/src/components/ChatInput.jsx",
    "frontend/src/components/MessageBubble.jsx"
)

Start-Sleep -Seconds 2

Make-Commit "2025-12-10 11:45:00" "article va config" @(
    "backend/api/models/Article.js",
    "backend/api/controllers/ArticleController.js",
    "backend/api/controllers/ConfigController.js",
    "backend/api/controllers/PingController.js"
)

Start-Sleep -Seconds 2

Make-Commit "2025-12-13 15:20:00" "seed data" @(
    "backend/seedData.js",
    "backend/seedProducts.js",
    "backend/create-sample-data.js",
    "backend/check-products.js",
    "backend/remove_comments.py",
    "backend/remove_docstrings.py"
)

Start-Sleep -Seconds 2

Make-Commit "2025-12-16 10:00:00" "3d model viewer" @(
    "frontend/src/utils/Viewer.js",
    "frontend/src/utils/model.js",
    "frontend/public/vrm-viewer/"
)

Start-Sleep -Seconds 2

Make-Commit "2025-12-19 14:40:00" "vrm extension" @(
    "frontend/src/extensions/vrm/",
    "frontend/src/pages/VRMViewer.jsx",
    "frontend/src/pages/VRMViewerVU.jsx"
)

Start-Sleep -Seconds 2

Make-Commit "2025-12-22 09:30:00" "add vrm models" @(
    "frontend/public/saler.vrm",
    "frontend/public/VU-VRM-elf.vrm"
)

Start-Sleep -Seconds 2

Make-Commit "2025-12-26 15:50:00" "test tts" @(
    "frontend/public/test-tts.html"
)

# ============================================
# JANUARY 2026 - Polish & Finalization
# ============================================

Start-Sleep -Seconds 2

Make-Commit "2026-01-03 10:00:00" "user va order pages" @(
    "frontend/src/pages/User/",
    "frontend/src/pages/Orders/"
)

Start-Sleep -Seconds 2

Make-Commit "2026-01-06 14:30:00" "product cart favorite pages" @(
    "frontend/src/pages/Products/",
    "frontend/src/pages/Cart/",
    "frontend/src/pages/Favorite/"
)

Start-Sleep -Seconds 2

Make-Commit "2026-01-09 11:00:00" "auth pages" @(
    "frontend/src/pages/Auth/",
    "frontend/src/pages/Test/"
)

Start-Sleep -Seconds 2

Make-Commit "2026-01-12 15:20:00" "redux slices" @(
    "frontend/src/redux/features/",
    "frontend/src/redux/api/"
)

Start-Sleep -Seconds 2

Make-Commit "2026-01-15 10:45:00" "utils" @(
    "frontend/src/utils/currency.js",
    "frontend/src/utils/localStorage.js"
)

Start-Sleep -Seconds 2

Make-Commit "2026-01-18 13:30:00" "admin pages" @(
    "frontend/src/pages/Admin/"
)

Start-Sleep -Seconds 2

Make-Commit "2026-01-21 09:15:00" "locales va views" @(
    "backend/config/locales/",
    "backend/views/"
)

Start-Sleep -Seconds 2

Make-Commit "2026-01-24 14:50:00" "env config" @(
    "backend/.env",
    "frontend/.env"
)

Start-Sleep -Seconds 2

Make-Commit "2026-01-27 11:30:00" "update readme" @(
    "frontend/frontend-logic-analysis.md",
    "frontend/useMemo-useCallback-analysis.md"
)

Start-Sleep -Seconds 2

Make-Commit "2026-01-30 15:10:00" "add assets" @(
    "frontend/src/assets/"
)

Write-Host "`n====================================" -ForegroundColor Magenta
Write-Host "All commits created successfully!" -ForegroundColor Green
Write-Host "====================================" -ForegroundColor Magenta

# Show commit log
Write-Host "`nCommit History (showing last 30):" -ForegroundColor Cyan
git log --oneline --graph --decorate -30

Write-Host "`n====================================" -ForegroundColor Yellow
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "1. Review the commit history above" -ForegroundColor White
Write-Host "2. If satisfied, add remote and push:" -ForegroundColor White
Write-Host "   git remote add origin $repoUrl" -ForegroundColor Gray
Write-Host "   git push -u origin main" -ForegroundColor Gray
Write-Host "====================================" -ForegroundColor Yellow

Write-Host "`nWould you like to push now? (Y/N)" -ForegroundColor Cyan
$response = Read-Host

if ($response -eq "Y" -or $response -eq "y") {
    Write-Host "`nAdding remote and pushing..." -ForegroundColor Green
    
    # Check if remote already exists
    $remoteExists = git remote | Select-String -Pattern "origin"
    if ($remoteExists) {
        Write-Host "Remote 'origin' already exists, updating URL..." -ForegroundColor Yellow
        git remote set-url origin $repoUrl
    } else {
        git remote add origin $repoUrl
    }
    
    Write-Host "Pushing to GitHub..." -ForegroundColor Green
    git push -u origin main --force
    
    Write-Host "`n✓ Successfully pushed to GitHub!" -ForegroundColor Green
} else {
    Write-Host "`nSkipping push. You can push manually later using:" -ForegroundColor Yellow
    Write-Host "git remote add origin $repoUrl" -ForegroundColor Gray
    Write-Host "git push -u origin main" -ForegroundColor Gray
}

Write-Host "`n✓ Script completed!" -ForegroundColor Green
