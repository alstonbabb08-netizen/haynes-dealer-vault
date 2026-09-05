"""
Parts Ordering Service
Handles parts search and referral link generation for multiple suppliers.
Integrates with VIN decoder for OEM part recommendations.
"""

import os
from typing import Dict, List, Optional
from urllib.parse import urlencode, quote

# Affiliate/Referral Configuration - UPDATE WITH YOUR IDs
AFFILIATE_CONFIG = {
    "autozone": os.getenv("AUTOZONE_AFFILIATE_ID", "YOUR_AUTOZONE_AFFILIATE_ID"),
    "oreilly": os.getenv("OREILLY_AFFILIATE_ID", "YOUR_OREILLY_AFFILIATE_ID"),
    "advance_auto": os.getenv("ADVANCE_AUTO_AFFILIATE_ID", "YOUR_ADVANCE_AUTO_AFFILIATE_ID"),
    "lkq_pull_a_part": os.getenv("LKQ_AFFILIATE_ID", "YOUR_LKQ_AFFILIATE_ID"),
    "napa": os.getenv("NAPA_AFFILIATE_ID", "YOUR_NAPA_AFFILIATE_ID"),
}

# Manufacturer OEM Sites - All Major Manufacturers
MANUFACTURER_OEM_URLS = {
    "ford": "https://www.fordparts.com",
    "gm": "https://www.gmparts.com",
    "chevrolet": "https://www.chevroletparts.com",
    "cadillac": "https://www.cadillacparts.com",
    "buick": "https://www.buickparts.com",
    "gmc": "https://www.gmcparts.com",
    "toyota": "https://www.toyota.com/parts",
    "lexus": "https://www.lexusparts.com",
    "honda": "https://www.hondaspartshouse.com",
    "acura": "https://www.acuraparts.com",
    "nissan": "https://www.nissanparts.com",
    "infiniti": "https://www.infinitiparts.com",
    "hyundai": "https://www.hyundaiparts.com",
    "kia": "https://www.kiaparts.com",
    "dodge": "https://www.dodgeparts.com",
    "jeep": "https://www.moparparts.com",
    "ram": "https://www.moparparts.com",
    "chrysler": "https://www.moparparts.com",
    "volkswagen": "https://www.vw-parts.com",
    "audi": "https://www.audiparts.com",
    "bmw": "https://www.bmwusa.com/parts",
    "mercedes": "https://www.mercedes-benz.com/parts",
    "volvo": "https://www.volvoparts.com",
    "subaru": "https://www.subaruparts.com",
    "mazda": "https://www.mazdaparts.com",
    "tesla": "https://www.tesla.com/parts",
    "porsche": "https://www.porscheparts.com",
    "jaguar": "https://www.jaguarparts.com",
    "landrover": "https://www.landroverparts.com",
    "fiat": "https://www.fiatparts.com",
    "alfa_romeo": "https://www.alfaromeousa.com",
    "maserati": "https://www.maserati.com",
    "ferrari": "https://www.ferrariparts.com",
}

class PartsOrderingService:
    """Service for generating parts search links and referral URLs"""
    
    @staticmethod
    def generate_autozone_link(part_name: str, part_number: Optional[str] = None) -> Dict[str, str]:
        """Generate AutoZone referral link"""
        affiliate_id = AFFILIATE_CONFIG["autozone"]
        search_query = part_number if part_number else part_name
        base_url = "https://www.autozone.com"
        search_url = f"{base_url}/search?q={quote(search_query)}"
        
        if affiliate_id != "YOUR_AUTOZONE_AFFILIATE_ID":
            search_url += f"&ref={affiliate_id}"
        
        return {
            "provider": "AutoZone",
            "url": search_url,
            "icon": "autozone",
            "priority": 1
        }
    
    @staticmethod
    def generate_oreilly_link(part_name: str, part_number: Optional[str] = None) -> Dict[str, str]:
        """Generate O'Reilly Auto Parts referral link"""
        affiliate_id = AFFILIATE_CONFIG["oreilly"]
        search_query = part_number if part_number else part_name
        base_url = "https://www.oreillyauto.com"
        search_url = f"{base_url}/c/search?q={quote(search_query)}"
        
        if affiliate_id != "YOUR_OREILLY_AFFILIATE_ID":
            search_url += f"&partner={affiliate_id}"
        
        return {
            "provider": "O'Reilly Auto Parts",
            "url": search_url,
            "icon": "oreilly",
            "priority": 2
        }
    
    @staticmethod
    def generate_advance_auto_link(part_name: str, part_number: Optional[str] = None) -> Dict[str, str]:
        """Generate Advanced Auto Parts referral link"""
        affiliate_id = AFFILIATE_CONFIG["advance_auto"]
        search_query = part_number if part_number else part_name
        base_url = "https://www.advanceautoparts.com"
        search_url = f"{base_url}/shop/search?q={quote(search_query)}"
        
        if affiliate_id != "YOUR_ADVANCE_AUTO_AFFILIATE_ID":
            search_url += f"&ref={affiliate_id}"
        
        return {
            "provider": "Advanced Auto Parts",
            "url": search_url,
            "icon": "advance",
            "priority": 3
        }
    
    @staticmethod
    def generate_lkq_link(part_name: str, part_number: Optional[str] = None) -> Dict[str, str]:
        """Generate LKQ Pull-A-Part referral link"""
        affiliate_id = AFFILIATE_CONFIG["lkq_pull_a_part"]
        search_query = part_number if part_number else part_name
        base_url = "https://www.lkqpullapart.com"
        search_url = f"{base_url}/search?q={quote(search_query)}"
        
        if affiliate_id != "YOUR_LKQ_AFFILIATE_ID":
            search_url += f"&ref={affiliate_id}"
        
        return {
            "provider": "LKQ Pull-A-Part",
            "url": search_url,
            "icon": "lkq",
            "priority": 4
        }
    
    @staticmethod
    def generate_napa_link(part_name: str, part_number: Optional[str] = None) -> Dict[str, str]:
        """Generate NAPA Auto Parts referral link"""
        affiliate_id = AFFILIATE_CONFIG["napa"]
        search_query = part_number if part_number else part_name
        base_url = "https://www.napaonline.com"
        search_url = f"{base_url}/p/search?q={quote(search_query)}"
        
        if affiliate_id != "YOUR_NAPA_AFFILIATE_ID":
            search_url += f"&ref={affiliate_id}"
        
        return {
            "provider": "NAPA Auto Parts",
            "url": search_url,
            "icon": "napa",
            "priority": 5
        }
    
    @staticmethod
    def generate_oem_links(manufacturer: str, part_name: str, part_number: Optional[str] = None) -> List[Dict[str, str]]:
        """Generate OEM manufacturer links for all available manufacturers"""
        oem_links = []
        
        # If specific manufacturer provided, prioritize it
        if manufacturer.lower() in MANUFACTURER_OEM_URLS:
            oem_url = MANUFACTURER_OEM_URLS[manufacturer.lower()]
            search_param = f"?q={quote(part_number if part_number else part_name)}"
            oem_links.append({
                "provider": f"{manufacturer} OEM Parts",
                "url": f"{oem_url}{search_param}",
                "icon": "oem",
                "priority": 0
            })
        
        # Add other manufacturers as fallback options
        for mfg, url in MANUFACTURER_OEM_URLS.items():
            if mfg.lower() != manufacturer.lower():
                search_param = f"?q={quote(part_number if part_number else part_name)}"
                oem_links.append({
                    "provider": f"{mfg.replace('_', ' ').title()} OEM Parts",
                    "url": f"{url}{search_param}",
                    "icon": "oem",
                    "priority": 10  # Lower priority for non-matching manufacturers
                })
        
        return oem_links
    
    @staticmethod
    def get_all_parts_links(
        part_name: str,
        part_number: Optional[str] = None,
        manufacturer: Optional[str] = None,
        include_oem: bool = True
    ) -> List[Dict[str, str]]:
        """
        Generate referral links for all available parts suppliers.
        
        Args:
            part_name: Name of the part to search
            part_number: OEM or aftermarket part number
            manufacturer: Vehicle manufacturer for OEM prioritization
            include_oem: Whether to include OEM manufacturer links
        
        Returns:
            List of supplier links sorted by priority
        """
        links = []
        
        # Add aftermarket suppliers
        links.append(PartsOrderingService.generate_autozone_link(part_name, part_number))
        links.append(PartsOrderingService.generate_oreilly_link(part_name, part_number))
        links.append(PartsOrderingService.generate_advance_auto_link(part_name, part_number))
        links.append(PartsOrderingService.generate_lkq_link(part_name, part_number))
        links.append(PartsOrderingService.generate_napa_link(part_name, part_number))
        
        # Add OEM links if requested
        if include_oem and manufacturer:
            oem_links = PartsOrderingService.generate_oem_links(manufacturer, part_name, part_number)
            links.extend(oem_links)
        
        # Sort by priority
        links.sort(key=lambda x: x.get("priority", 999))
        
        return links
    
    @staticmethod
    def get_diagnosis_parts_suggestions(diagnosis_result: Dict) -> Dict:
        """
        Extract parts recommendations from a diagnosis result
        and generate referral links automatically.
        
        Args:
            diagnosis_result: Dictionary containing diagnosis data with optional 'parts_needed' key
        
        Returns:
            Dictionary with organized parts suggestions and links
        """
        parts_suggestions = {
            "parts": [],
            "suppliers": [],
            "oem_options": [],
            "estimated_cost_range": None
        }
        
        # Extract parts from diagnosis
        parts_list = diagnosis_result.get("parts_needed", [])
        manufacturer = diagnosis_result.get("manufacturer", None)
        vin = diagnosis_result.get("vin", None)
        
        for part in parts_list:
            part_info = {
                "name": part.get("name", ""),
                "description": part.get("description", ""),
                "part_number": part.get("part_number", None),
                "links": PartsOrderingService.get_all_parts_links(
                    part.get("name", ""),
                    part.get("part_number", None),
                    manufacturer,
                    include_oem=True
                ),
                "estimated_price": part.get("estimated_price", None)
            }
            parts_suggestions["parts"].append(part_info)
        
        # Compile all unique suppliers
        suppliers_set = set()
        for part in parts_suggestions["parts"]:
            for link in part["links"]:
                suppliers_set.add(link["provider"])
        
        parts_suggestions["suppliers"] = sorted(list(suppliers_set))
        
        return parts_suggestions


def create_parts_service() -> PartsOrderingService:
    """Factory function to create parts service instance"""
    return PartsOrderingService()
