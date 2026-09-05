"""
Parts Ordering API Routes
FastAPI endpoints for parts search and referral link generation.
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Optional, List, Dict
from pydantic import BaseModel
from backend.parts_service import PartsOrderingService

router = APIRouter(prefix="/api/parts", tags=["parts"])

# Pydantic Models for request/response validation
class PartSearchRequest(BaseModel):
    """Request model for searching parts"""
    part_name: str
    part_number: Optional[str] = None
    manufacturer: Optional[str] = None
    include_oem: bool = True

class VINPartSearchRequest(BaseModel):
    """Request model for VIN-based parts search"""
    vin: str
    part_name: str
    part_number: Optional[str] = None

class DiagnosisPartsRequest(BaseModel):
    """Request model for extracting parts from diagnosis"""
    diagnosis_id: str
    parts_needed: List[Dict] = []
    manufacturer: Optional[str] = None
    vin: Optional[str] = None

class PartsLinksResponse(BaseModel):
    """Response model for parts links"""
    provider: str
    url: str
    icon: str
    priority: int

class PartSuggestionResponse(BaseModel):
    """Response model for a single part suggestion"""
    name: str
    description: Optional[str] = None
    part_number: Optional[str] = None
    estimated_price: Optional[float] = None
    links: List[PartsLinksResponse]

class DiagnosisPartsResponse(BaseModel):
    """Response model for diagnosis parts suggestions"""
    parts: List[PartSuggestionResponse]
    suppliers: List[str]
    total_parts: int
    estimated_total_cost: Optional[float] = None


@router.post("/search", response_model=List[PartsLinksResponse])
async def search_parts(request: PartSearchRequest) -> List[Dict]:
    """
    Search for parts across all suppliers and get referral links.
    
    Args:
        part_name: Name of the part to search
        part_number: Optional part number (OEM or aftermarket)
        manufacturer: Optional vehicle manufacturer for OEM prioritization
        include_oem: Whether to include OEM manufacturer links (default: True)
    
    Returns:
        List of supplier links with referral URLs sorted by priority
    
    Example:
        POST /api/parts/search
        {
            "part_name": "brake pads",
            "part_number": "34356794823",
            "manufacturer": "ford",
            "include_oem": true
        }
    """
    try:
        if not request.part_name or len(request.part_name.strip()) == 0:
            raise HTTPException(status_code=400, detail="part_name is required and cannot be empty")
        
        links = PartsOrderingService.get_all_parts_links(
            part_name=request.part_name,
            part_number=request.part_number,
            manufacturer=request.manufacturer,
            include_oem=request.include_oem
        )
        
        return links
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching parts: {str(e)}")


@router.get("/search", response_model=List[PartsLinksResponse])
async def search_parts_query(
    part_name: str = Query(..., min_length=1),
    part_number: Optional[str] = Query(None),
    manufacturer: Optional[str] = Query(None),
    include_oem: bool = Query(True)
) -> List[Dict]:
    """
    Search for parts using query parameters.
    
    Args:
        part_name: Name of the part to search (required)
        part_number: Optional part number
        manufacturer: Optional vehicle manufacturer
        include_oem: Whether to include OEM links (default: true)
    
    Returns:
        List of supplier links sorted by priority
    
    Example:
        GET /api/parts/search?part_name=brake%20pads&manufacturer=ford&include_oem=true
    """
    try:
        links = PartsOrderingService.get_all_parts_links(
            part_name=part_name,
            part_number=part_number,
            manufacturer=manufacturer,
            include_oem=include_oem
        )
        
        return links
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching parts: {str(e)}")


@router.post("/suppliers", response_model=List[str])
async def get_suppliers() -> List[str]:
    """
    Get list of all available parts suppliers.
    
    Returns:
        List of all supplier names
    
    Example:
        POST /api/parts/suppliers
    """
    try:
        suppliers = [
            "AutoZone",
            "O'Reilly Auto Parts",
            "Advanced Auto Parts",
            "LKQ Pull-A-Part",
            "NAPA Auto Parts"
        ]
        return suppliers
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving suppliers: {str(e)}")


@router.post("/diagnosis-suggestions", response_model=DiagnosisPartsResponse)
async def get_diagnosis_parts_suggestions(request: DiagnosisPartsRequest) -> Dict:
    """
    Extract parts recommendations from a diagnosis result and generate referral links.
    This endpoint is called automatically after a diagnosis is completed.
    
    Args:
        diagnosis_id: ID of the diagnosis result
        parts_needed: List of parts with name, description, part_number, estimated_price
        manufacturer: Vehicle manufacturer from VIN decoder
        vin: Vehicle VIN number
    
    Returns:
        Organized parts suggestions with supplier links and cost estimates
    
    Example:
        POST /api/parts/diagnosis-suggestions
        {
            "diagnosis_id": "diag_12345",
            "parts_needed": [
                {
                    "name": "Brake Pads",
                    "description": "Front disc brake pads",
                    "part_number": "34356794823",
                    "estimated_price": 45.99
                },
                {
                    "name": "Brake Fluid",
                    "description": "DOT 4 Brake Fluid",
                    "part_number": null,
                    "estimated_price": 12.99
                }
            ],
            "manufacturer": "ford",
            "vin": "1FTFW1ET5DFC10726"
        }
    """
    try:
        diagnosis_data = {
            "diagnosis_id": request.diagnosis_id,
            "parts_needed": request.parts_needed,
            "manufacturer": request.manufacturer,
            "vin": request.vin
        }
        
        suggestions = PartsOrderingService.get_diagnosis_parts_suggestions(diagnosis_data)
        
        # Calculate total estimated cost
        total_cost = 0
        for part in suggestions["parts"]:
            if part["estimated_price"]:
                total_cost += part["estimated_price"]
        
        response = {
            "parts": suggestions["parts"],
            "suppliers": suggestions["suppliers"],
            "total_parts": len(suggestions["parts"]),
            "estimated_total_cost": total_cost if total_cost > 0 else None
        }
        
        return response
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating parts suggestions: {str(e)}")


@router.get("/single-supplier/{supplier_name}", response_model=List[PartsLinksResponse])
async def search_single_supplier(
    supplier_name: str = Query(...),
    part_name: str = Query(..., min_length=1),
    part_number: Optional[str] = Query(None)
) -> List[Dict]:
    """
    Search for parts on a specific supplier only.
    
    Args:
        supplier_name: Name of the supplier (autozone, oreilly, advance_auto, lkq, napa, oem)
        part_name: Name of the part to search
        part_number: Optional part number
    
    Returns:
        Supplier link with referral URL
    
    Example:
        GET /api/parts/single-supplier/autozone?part_name=brake%20pads&part_number=34356794823
    """
    try:
        supplier_name_lower = supplier_name.lower().replace(" ", "_")
        
        # Map supplier names to service methods
        supplier_methods = {
            "autozone": PartsOrderingService.generate_autozone_link,
            "oreilly": PartsOrderingService.generate_oreilly_link,
            "advance_auto": PartsOrderingService.generate_advance_auto_link,
            "lkq": PartsOrderingService.generate_lkq_link,
            "lkq_pull_a_part": PartsOrderingService.generate_lkq_link,
            "napa": PartsOrderingService.generate_napa_link,
        }
        
        if supplier_name_lower not in supplier_methods:
            raise HTTPException(
                status_code=400,
                detail=f"Unknown supplier: {supplier_name}. Available: autozone, oreilly, advance_auto, lkq, napa"
            )
        
        link = supplier_methods[supplier_name_lower](part_name, part_number)
        return [link]
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error searching supplier: {str(e)}")


@router.get("/oem-links/{manufacturer}")
async def get_oem_links(
    manufacturer: str = Query(...),
    part_name: str = Query(..., min_length=1),
    part_number: Optional[str] = Query(None)
) -> List[Dict]:
    """
    Get OEM manufacturer parts links for a specific vehicle manufacturer.
    
    Args:
        manufacturer: Vehicle manufacturer name (ford, gm, toyota, honda, etc.)
        part_name: Name of the part to search
        part_number: Optional part number
    
    Returns:
        List of OEM links prioritizing the requested manufacturer
    
    Example:
        GET /api/parts/oem-links/ford?part_name=brake%20pads
    """
    try:
        oem_links = PartsOrderingService.generate_oem_links(
            manufacturer=manufacturer,
            part_name=part_name,
            part_number=part_number
        )
        
        if not oem_links:
            raise HTTPException(
                status_code=404,
                detail=f"No OEM links found for manufacturer: {manufacturer}"
            )
        
        return oem_links
    
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving OEM links: {str(e)}")


@router.get("/health")
async def health_check() -> Dict:
    """
    Health check endpoint for the parts service.
    
    Returns:
        Service status and available endpoints
    
    Example:
        GET /api/parts/health
    """
    return {
        "status": "healthy",
        "service": "Parts Ordering API",
        "endpoints": [
            "POST /api/parts/search",
            "GET /api/parts/search",
            "POST /api/parts/suppliers",
            "POST /api/parts/diagnosis-suggestions",
            "GET /api/parts/single-supplier/{supplier_name}",
            "GET /api/parts/oem-links/{manufacturer}",
            "GET /api/parts/health"
        ]
    }
