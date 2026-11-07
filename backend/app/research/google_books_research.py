import httpx
from typing import List, Dict, Any, Optional
from datetime import datetime
from app.core.config import settings
from app.core.logger import logger
from app.schemas.research import NormalizedSource

class GoogleBooksResearchClient:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.GOOGLE_BOOKS_API_KEY
        self.base_url = "https://www.googleapis.com/books/v1/volumes"

    async def search(self, query: str, max_results: int = 4) -> Dict[str, Any]:
        """
        Execute Google Books API search for relevant academic and technical books.
        Distinguishes between book metadata/preview and complete text.
        """
        params = {
            "q": query,
            "maxResults": max_results,
            "printType": "books",
            "orderBy": "relevance"
        }
        if self.api_key:
            params["key"] = self.api_key

        try:
            async with httpx.AsyncClient(timeout=12.0) as client:
                response = await client.get(self.base_url, params=params)
                if response.status_code == 200:
                    data = response.json()
                    items = data.get("items", [])
                    sources: List[NormalizedSource] = []
                    for item in items:
                        v_info = item.get("volumeInfo", {})
                        title = v_info.get("title", "Educational Book")
                        authors = ", ".join(v_info.get("authors", [])) or "Academic Authors"
                        publisher = v_info.get("publisher", "Academic Publisher")
                        published_date = v_info.get("publishedDate", "N/A")
                        preview_link = v_info.get("previewLink") or v_info.get("infoLink") or f"https://books.google.com/books?id={item.get('id', '')}"
                        description = v_info.get("description", "Book reference for foundational learning concepts.")

                        # Extract ISBN if available
                        industry_ids = v_info.get("industryIdentifiers", [])
                        isbn = "N/A"
                        for id_obj in industry_ids:
                            if "ISBN" in id_obj.get("type", ""):
                                isbn = id_obj.get("identifier", "N/A")
                                break

                        image_links = v_info.get("imageLinks", {})
                        thumb_url = image_links.get("thumbnail") or image_links.get("smallThumbnail")

                        # Distinguish metadata/preview from accessible full text
                        access_info = item.get("accessInfo", {})
                        viewability = access_info.get("viewability", "PARTIAL")
                        is_full_accessible = viewability == "ALL_PAGES"

                        sources.append(NormalizedSource(
                            source_type="book",
                            title=title,
                            url=preview_link,
                            author_publisher=f"{authors} ({publisher})",
                            snippet=description[:400] + "..." if len(description) > 400 else description,
                            relevance_score=0.92,
                            # Important: clearly differentiate metadata/previews vs full text
                            is_accessible=is_full_accessible,
                            metadata={
                                "book_id": item.get("id"),
                                "authors": v_info.get("authors", []),
                                "publisher": publisher,
                                "published_date": published_date,
                                "isbn": isbn,
                                "preview_link": preview_link,
                                "thumbnail_url": thumb_url,
                                "viewability": viewability,
                                "access_limitation": "Source provides book metadata and preview excerpts; not full text access.",
                                "retrieved_via": "Google Books API"
                            },
                            retrieved_at=datetime.utcnow()
                        ))
                    return {
                        "status": "SUCCESS",
                        "error": None,
                        "sources": sources
                    }
                else:
                    err_msg = f"Google Books returned status code {response.status_code}: {response.text}"
                    logger.error(err_msg)
                    return {
                        "status": "ERROR",
                        "error": err_msg,
                        "sources": []
                    }
        except Exception as e:
            err_msg = f"Exception during Google Books search: {str(e)}"
            logger.error(err_msg)
            return {
                "status": "ERROR",
                "error": err_msg,
                "sources": []
            }

