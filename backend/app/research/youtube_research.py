import httpx
from typing import List, Dict, Any, Optional
from datetime import datetime
from app.core.config import settings
from app.core.logger import logger
from app.schemas.research import NormalizedSource

class YouTubeResearchClient:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.YOUTUBE_API_KEY
        self.base_url = "https://www.googleapis.com/youtube/v3/search"

    async def search(self, query: str, max_results: int = 4) -> Dict[str, Any]:
        """
        Execute YouTube Data API v3 search for educational videos.
        Returns normalized list of video research sources.
        """
        if not self.api_key:
            logger.warning("YouTube API key is not configured. Video search cannot query live YouTube API.")
            return {
                "status": "UNAVAILABLE",
                "error": "YouTube API key is missing. Set YOUTUBE_API_KEY in .env.",
                "sources": []
            }

        params = {
            "key": self.api_key,
            "q": f"{query} educational tutorial",
            "part": "snippet",
            "type": "video",
            "videoEmbeddable": "true",
            "relevanceLanguage": "en",
            "maxResults": max_results
        }

        try:
            async with httpx.AsyncClient(timeout=12.0) as client:
                response = await client.get(self.base_url, params=params)
                if response.status_code == 200:
                    data = response.json()
                    items = data.get("items", [])
                    sources: List[NormalizedSource] = []
                    for item in items:
                        id_info = item.get("id", {})
                        video_id = id_info.get("videoId")
                        if not video_id:
                            continue
                        snippet = item.get("snippet", {})
                        thumbnails = snippet.get("thumbnails", {})
                        thumb_url = thumbnails.get("medium", {}).get("url") or thumbnails.get("default", {}).get("url")
                        video_url = f"https://www.youtube.com/watch?v={video_id}"

                        sources.append(NormalizedSource(
                            source_type="youtube",
                            title=snippet.get("title", "Educational Video"),
                            url=video_url,
                            author_publisher=snippet.get("channelTitle", "YouTube Educator"),
                            snippet=snippet.get("description", ""),
                            relevance_score=0.88,
                            is_accessible=True,
                            metadata={
                                "video_id": video_id,
                                "channel_id": snippet.get("channelId"),
                                "published_at": snippet.get("publishedAt"),
                                "thumbnail_url": thumb_url,
                                "retrieved_via": "YouTube Data API v3"
                            },
                            retrieved_at=datetime.utcnow()
                        ))
                    return {
                        "status": "SUCCESS",
                        "error": None,
                        "sources": sources
                    }
                else:
                    err_msg = f"YouTube API returned status code {response.status_code}: {response.text}"
                    logger.error(err_msg)
                    return {
                        "status": "ERROR",
                        "error": err_msg,
                        "sources": []
                    }
        except Exception as e:
            err_msg = f"Exception during YouTube search: {str(e)}"
            logger.error(err_msg)
            return {
                "status": "ERROR",
                "error": err_msg,
                "sources": []
            }

