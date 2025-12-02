import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from datetime import datetime, timezone, timedelta
import uuid
import random

load_dotenv()

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

async def init_sample_data():
    print("Initializing sample data for GrameenGo...")
    
    # Clear existing data
    await db.mfis.delete_many({})
    await db.loan_products.delete_many({})
    await db.applications.delete_many({})
    
    # Bangladesh MFIs
    mfis_data = [
        {
            "id": str(uuid.uuid4()),
            "name": "Grameen Bank",
            "description": "Pioneer of microfinance in Bangladesh, empowering rural communities since 1983.",
            "min_loan_amount": 5000,
            "max_loan_amount": 500000,
            "interest_rate": 20.0,
            "processing_time_days": 7,
            "requirements": ["National ID", "Business Registration", "Bank Statement"],
            "collateral_required": False,
            "website": "https://grameen-bank.org",
            "contact_email": "info@grameen-bank.org",
            "contact_phone": "+880-2-9004534",
            "logo_url": "https://via.placeholder.com/150/1E9A56/FFFFFF?text=Grameen",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "BRAC",
            "description": "One of the world's largest NGOs, providing microfinance and development services.",
            "min_loan_amount": 10000,
            "max_loan_amount": 1000000,
            "interest_rate": 18.5,
            "processing_time_days": 5,
            "requirements": ["National ID", "Trade License", "Business Plan"],
            "collateral_required": False,
            "website": "https://www.brac.net",
            "contact_email": "microfinance@brac.net",
            "contact_phone": "+880-2-9881265",
            "logo_url": "https://via.placeholder.com/150/2C5F2D/FFFFFF?text=BRAC",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "ASA",
            "description": "Association for Social Advancement - Serving millions with microfinance solutions.",
            "min_loan_amount": 8000,
            "max_loan_amount": 750000,
            "interest_rate": 19.0,
            "processing_time_days": 10,
            "requirements": ["National ID", "Business Registration"],
            "collateral_required": False,
            "website": "https://www.asa.org.bd",
            "contact_email": "info@asa.org.bd",
            "contact_phone": "+880-2-8837614",
            "logo_url": "https://via.placeholder.com/150/00529B/FFFFFF?text=ASA",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "BURO Bangladesh",
            "description": "Providing innovative financial services to rural and urban entrepreneurs.",
            "min_loan_amount": 5000,
            "max_loan_amount": 500000,
            "interest_rate": 21.0,
            "processing_time_days": 12,
            "requirements": ["National ID", "Business Proof"],
            "collateral_required": False,
            "website": "https://www.buro-bd.org",
            "contact_email": "info@buro-bd.org",
            "contact_phone": "+880-2-9889534",
            "logo_url": "https://via.placeholder.com/150/FF6B35/FFFFFF?text=BURO",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Sajida Foundation",
            "description": "Committed to poverty alleviation through sustainable microfinance programs.",
            "min_loan_amount": 10000,
            "max_loan_amount": 800000,
            "interest_rate": 17.5,
            "processing_time_days": 8,
            "requirements": ["National ID", "Business Registration", "Bank Statement"],
            "collateral_required": False,
            "website": "https://www.sajidafoundation.org",
            "contact_email": "info@sajidafoundation.org",
            "contact_phone": "+880-2-9853421",
            "logo_url": "https://via.placeholder.com/150/4A90E2/FFFFFF?text=Sajida",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Shakti Foundation",
            "description": "Empowering women entrepreneurs with accessible microfinance solutions.",
            "min_loan_amount": 7000,
            "max_loan_amount": 600000,
            "interest_rate": 19.5,
            "processing_time_days": 9,
            "requirements": ["National ID", "Business Plan"],
            "collateral_required": False,
            "website": "https://www.shaktifoundation.org.bd",
            "contact_email": "info@shaktifoundation.org.bd",
            "contact_phone": "+880-2-9834567",
            "logo_url": "https://via.placeholder.com/150/E94B3C/FFFFFF?text=Shakti",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "TMSS",
            "description": "Thengamara Mohila Sabuj Sangha - Supporting sustainable livelihoods.",
            "min_loan_amount": 6000,
            "max_loan_amount": 450000,
            "interest_rate": 20.5,
            "processing_time_days": 11,
            "requirements": ["National ID", "Business Registration"],
            "collateral_required": False,
            "website": "https://www.tmss-bd.org",
            "contact_email": "info@tmss-bd.org",
            "contact_phone": "+880-2-9867234",
            "logo_url": "https://via.placeholder.com/150/27AE60/FFFFFF?text=TMSS",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Jagorani Chakra Foundation",
            "description": "Rural development organization focused on sustainable microfinance.",
            "min_loan_amount": 8000,
            "max_loan_amount": 700000,
            "interest_rate": 18.0,
            "processing_time_days": 10,
            "requirements": ["National ID", "Trade License"],
            "collateral_required": False,
            "website": "https://www.jagorani.org",
            "contact_email": "info@jagorani.org",
            "contact_phone": "+880-2-9876543",
            "logo_url": "https://via.placeholder.com/150/8E44AD/FFFFFF?text=JCF",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Uddipan",
            "description": "Promoting social and economic development through microfinance.",
            "min_loan_amount": 5000,
            "max_loan_amount": 400000,
            "interest_rate": 21.5,
            "processing_time_days": 14,
            "requirements": ["National ID", "Business Proof"],
            "collateral_required": False,
            "website": "https://www.uddipan.org",
            "contact_email": "info@uddipan.org",
            "contact_phone": "+880-2-9834512",
            "logo_url": "https://via.placeholder.com/150/F39C12/FFFFFF?text=Uddipan",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": str(uuid.uuid4()),
            "name": "Palli Karma-Sahayak Foundation (PKSF)",
            "description": "Apex funding organization for microfinance in Bangladesh.",
            "min_loan_amount": 15000,
            "max_loan_amount": 1500000,
            "interest_rate": 16.5,
            "processing_time_days": 6,
            "requirements": ["National ID", "Business Registration", "Detailed Business Plan", "Bank Statement"],
            "collateral_required": True,
            "website": "https://www.pksf.gov.bd",
            "contact_email": "info@pksf.gov.bd",
            "contact_phone": "+880-2-9144200",
            "logo_url": "https://via.placeholder.com/150/16A085/FFFFFF?text=PKSF",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    await db.mfis.insert_many(mfis_data)
    print(f"✓ Inserted {len(mfis_data)} MFIs")
    
    # Create loan products for each MFI
    loan_products = []
    for mfi in mfis_data:
        products = [
            {
                "id": str(uuid.uuid4()),
                "mfi_id": mfi['id'],
                "name": "Micro Business Loan",
                "description": "Small loans for starting or expanding micro businesses",
                "min_amount": mfi['min_loan_amount'],
                "max_amount": min(mfi['max_loan_amount'], 200000),
                "interest_rate": mfi['interest_rate'],
                "tenure_months": [6, 12, 18],
                "eligibility_criteria": ["Must be 18+ years old", "Business operational for 6 months"],
                "created_at": datetime.now(timezone.utc).isoformat()
            },
            {
                "id": str(uuid.uuid4()),
                "mfi_id": mfi['id'],
                "name": "SME Growth Loan",
                "description": "Larger loans for established small and medium enterprises",
                "min_amount": 100000,
                "max_amount": mfi['max_loan_amount'],
                "interest_rate": mfi['interest_rate'] - 1,
                "tenure_months": [12, 24, 36],
                "eligibility_criteria": ["Business operational for 1+ year", "Annual revenue > BDT 500,000"],
                "created_at": datetime.now(timezone.utc).isoformat()
            }
        ]
        loan_products.extend(products)
    
    await db.loan_products.insert_many(loan_products)
    print(f"✓ Inserted {len(loan_products)} loan products")
    
    # Generate historical application data for analytics
    print("✓ Sample data initialization complete!")
    print("\nYou can now:")
    print("  1. Access the application")
    print("  2. Register or login")
    print("  3. Explore MFIs and apply for loans")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(init_sample_data())
