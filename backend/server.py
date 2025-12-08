from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, Response, Header, Cookie
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, timezone, timedelta
import uuid
import httpx

# Import models
from models.user import User, UserCreate, UserLogin, UserResponse, UserSession
from models.mfi import MFI, LoanProduct
from models.application import LoanApplication, ApplicationCreate, ApplicationUpdate
from models.notification import Notification
from utils.auth import hash_password, verify_password, create_access_token, get_current_user

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Dependency to get current user from cookie or header
async def get_auth_user(request: Request, authorization: Optional[str] = Header(None)):
    # Try to get session token from cookie
    session_token = request.cookies.get('session_token')
    
    # Try to get JWT token from Authorization header
    jwt_token = None
    if authorization and authorization.startswith('Bearer '):
        jwt_token = authorization.split(' ')[1]
    
    user = await get_current_user(db, token=jwt_token, session_token=session_token)
    if not user:
        raise HTTPException(status_code=401, detail="Not authenticated")
    return user

# ========== HEALTH CHECK ==========

@api_router.get("/")
async def health_check():
    return {"status": "ok", "message": "GrameenGo API is running"}

@api_router.get("/health")
async def health():
    return {"status": "healthy"}

# ========== AUTH ROUTES ==========

@api_router.post("/auth/register")
async def register(user_data: UserCreate, response: Response):
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user
    user_id = str(uuid.uuid4())
    user_dict = {
        "id": user_id,
        "email": user_data.email,
        "name": user_data.name,
        "password_hash": hash_password(user_data.password),
        "role": user_data.role,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.users.insert_one(user_dict)
    
    # Create JWT token
    token = create_access_token({"user_id": user_id})
    
    # Set cookie
    response.set_cookie(
        key="auth_token",
        value=token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=7*24*60*60
    )
    
    return {
        "id": user_id,
        "email": user_data.email,
        "name": user_data.name,
        "role": user_data.role,
        "token": token
    }

@api_router.post("/auth/login")
async def login(credentials: UserLogin, response: Response):
    user = await db.users.find_one({"email": credentials.email})
    if not user or not verify_password(credentials.password, user['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Create JWT token
    token = create_access_token({"user_id": user['id']})
    
    # Set cookie
    response.set_cookie(
        key="auth_token",
        value=token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=7*24*60*60
    )
    
    return {
        "id": user['id'],
        "email": user['email'],
        "name": user['name'],
        "role": user['role'],
        "picture": user.get('picture'),
        "token": token
    }

@api_router.post("/auth/session")
async def create_session_from_emergent(x_session_id: str = Header(...), response: Response = None):
    """Exchange Emergent session_id for user data and store session."""
    try:
        async with httpx.AsyncClient() as client:
            resp = await client.get(
                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                headers={"X-Session-ID": x_session_id}
            )
            
            if resp.status_code != 200:
                raise HTTPException(status_code=400, detail="Invalid session ID")
            
            data = resp.json()
            
            # Check if user exists
            user = await db.users.find_one({"email": data['email']})
            
            if not user:
                # Create new user
                user_id = str(uuid.uuid4())
                user_dict = {
                    "id": user_id,
                    "email": data['email'],
                    "name": data['name'],
                    "picture": data.get('picture'),
                    "role": "borrower",
                    "created_at": datetime.now(timezone.utc).isoformat()
                }
                await db.users.insert_one(user_dict)
                user = user_dict
            
            # Store session token
            session_token = data['session_token']
            session_doc = {
                "user_id": user['id'],
                "session_token": session_token,
                "expires_at": datetime.now(timezone.utc) + timedelta(days=7),
                "created_at": datetime.now(timezone.utc)
            }
            await db.user_sessions.insert_one(session_doc)
            
            # Set cookie
            if response:
                response.set_cookie(
                    key="session_token",
                    value=session_token,
                    httponly=True,
                    secure=True,
                    samesite="none",
                    path="/",
                    max_age=7*24*60*60
                )
            
            return {
                "id": user['id'],
                "email": user['email'],
                "name": user['name'],
                "role": user['role'],
                "picture": user.get('picture'),
                "session_token": session_token
            }
    except httpx.RequestError as e:
        raise HTTPException(status_code=500, detail=f"Session exchange failed: {str(e)}")

@api_router.get("/auth/me", response_model=UserResponse)
async def get_me(user: dict = Depends(get_auth_user)):
    return user

@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    session_token = request.cookies.get('session_token')
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    
    response.delete_cookie("session_token")
    response.delete_cookie("auth_token")
    return {"message": "Logged out"}

# ========== MFI ROUTES ==========

@api_router.get("/mfis", response_model=List[dict])
async def get_mfis():
    mfis = await db.mfis.find({}, {"_id": 0}).to_list(100)
    return mfis

@api_router.get("/mfis/{mfi_id}")
async def get_mfi(mfi_id: str):
    mfi = await db.mfis.find_one({"id": mfi_id}, {"_id": 0})
    if not mfi:
        raise HTTPException(status_code=404, detail="MFI not found")
    return mfi

@api_router.post("/mfis")
async def create_mfi(mfi_data: dict, user: dict = Depends(get_auth_user)):
    if user['role'] != 'admin':
        raise HTTPException(status_code=403, detail="Only admins can create MFIs")
    
    mfi_id = str(uuid.uuid4())
    mfi_data['id'] = mfi_id
    mfi_data['created_at'] = datetime.now(timezone.utc).isoformat()
    await db.mfis.insert_one(mfi_data)
    return mfi_data

# ========== LOAN PRODUCTS ROUTES ==========

@api_router.get("/loan-products")
async def get_loan_products(mfi_id: Optional[str] = None):
    query = {}
    if mfi_id:
        query['mfi_id'] = mfi_id
    products = await db.loan_products.find(query, {"_id": 0}).to_list(100)
    return products

# ========== APPLICATION ROUTES ==========

@api_router.get("/applications")
async def get_applications(user: dict = Depends(get_auth_user)):
    query = {}
    if user['role'] == 'borrower':
        query['user_id'] = user['id']
    
    applications = await db.applications.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
    return applications

@api_router.get("/applications/{app_id}")
async def get_application(app_id: str, user: dict = Depends(get_auth_user)):
    app = await db.applications.find_one({"id": app_id}, {"_id": 0})
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # Check permissions
    if user['role'] == 'borrower' and app['user_id'] != user['id']:
        raise HTTPException(status_code=403, detail="Access denied")
    
    return app

@api_router.post("/applications")
async def create_application(app_data: ApplicationCreate, user: dict = Depends(get_auth_user)):
    app_id = str(uuid.uuid4())
    app_dict = app_data.model_dump()
    app_dict.update({
        "id": app_id,
        "user_id": user['id'],
        "status": "submitted",
        "documents": [],
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    })
    
    # Insert into database
    result = await db.applications.insert_one(app_dict)
    
    # Create notification
    notif_id = str(uuid.uuid4())
    notif = {
        "id": notif_id,
        "user_id": user['id'],
        "title": "Application Submitted",
        "message": f"Your loan application for BDT {app_data.loan_amount} has been submitted successfully.",
        "type": "success",
        "read": False,
        "link": f"/applications/{app_id}",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.notifications.insert_one(notif)
    
    # Return the application without MongoDB _id
    response_dict = app_dict.copy()
    return response_dict

@api_router.patch("/applications/{app_id}")
async def update_application(app_id: str, update_data: ApplicationUpdate, user: dict = Depends(get_auth_user)):
    app = await db.applications.find_one({"id": app_id})
    if not app:
        raise HTTPException(status_code=404, detail="Application not found")
    
    # Only officers and admins can update
    if user['role'] not in ['officer', 'admin']:
        raise HTTPException(status_code=403, detail="Access denied")
    
    update_dict = update_data.model_dump(exclude_unset=True)
    update_dict['updated_at'] = datetime.now(timezone.utc).isoformat()
    update_dict['officer_id'] = user['id']
    
    await db.applications.update_one({"id": app_id}, {"$set": update_dict})
    
    # Create notification for borrower
    if update_data.status:
        notif_id = str(uuid.uuid4())
        status_msg = {
            "approved": "Your loan application has been approved!",
            "rejected": "Your loan application has been rejected.",
            "under_review": "Your loan application is under review.",
            "disbursed": "Your loan has been disbursed successfully!"
        }
        notif = {
            "id": notif_id,
            "user_id": app['user_id'],
            "title": "Application Status Update",
            "message": status_msg.get(update_data.status, "Your application status has been updated."),
            "type": "info" if update_data.status != "rejected" else "warning",
            "read": False,
            "link": f"/applications/{app_id}",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.notifications.insert_one(notif)
    
    updated_app = await db.applications.find_one({"id": app_id}, {"_id": 0})
    return updated_app

# ========== NOTIFICATION ROUTES ==========

@api_router.get("/notifications")
async def get_notifications(user: dict = Depends(get_auth_user)):
    notifications = await db.notifications.find(
        {"user_id": user['id']},
        {"_id": 0}
    ).sort("created_at", -1).limit(50).to_list(50)
    return notifications

@api_router.patch("/notifications/{notif_id}/read")
async def mark_notification_read(notif_id: str, user: dict = Depends(get_auth_user)):
    await db.notifications.update_one(
        {"id": notif_id, "user_id": user['id']},
        {"$set": {"read": True}}
    )
    return {"message": "Notification marked as read"}

# ========== ANALYTICS ROUTES ==========

@api_router.get("/analytics/stats")
async def get_analytics_stats(user: dict = Depends(get_auth_user)):
    if user['role'] not in ['officer', 'admin']:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Get various statistics
    total_applications = await db.applications.count_documents({})
    approved = await db.applications.count_documents({"status": "approved"})
    rejected = await db.applications.count_documents({"status": "rejected"})
    pending = await db.applications.count_documents({"status": {"$in": ["submitted", "under_review"]}})
    
    # Get total loan amount
    pipeline = [
        {"$match": {"status": "approved"}},
        {"$group": {"_id": None, "total": {"$sum": "$loan_amount"}}}
    ]
    total_amount_result = await db.applications.aggregate(pipeline).to_list(1)
    total_loan_amount = total_amount_result[0]['total'] if total_amount_result else 0
    
    return {
        "total_applications": total_applications,
        "approved": approved,
        "rejected": rejected,
        "pending": pending,
        "total_loan_amount": total_loan_amount
    }

@api_router.get("/analytics/trends")
async def get_trends(user: dict = Depends(get_auth_user)):
    """Get application trends over time."""
    if user['role'] not in ['officer', 'admin']:
        raise HTTPException(status_code=403, detail="Access denied")
    
    # Aggregate by month
    pipeline = [
        {
            "$group": {
                "_id": {
                    "year": {"$year": {"$toDate": "$created_at"}},
                    "month": {"$month": {"$toDate": "$created_at"}}
                },
                "count": {"$sum": 1},
                "total_amount": {"$sum": "$loan_amount"}
            }
        },
        {"$sort": {"_id.year": 1, "_id.month": 1}},
        {"$limit": 12}
    ]
    
    trends = await db.applications.aggregate(pipeline).to_list(12)
    return trends

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
