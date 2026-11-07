import pytest
from app.research.orchestrator import ResearchOrchestrator
from app.research.tavily_research import TavilyResearchClient
from app.research.youtube_research import YouTubeResearchClient
from app.research.google_books_research import GoogleBooksResearchClient
from app.schemas.research import NormalizedSource

@pytest.mark.asyncio
async def test_tavily_missing_key_graceful_handling():
    client = TavilyResearchClient(api_key=None)
    result = await client.search("test query")
    assert result["status"] == "UNAVAILABLE"
    assert "missing" in result["error"].lower()
    assert result["sources"] == []

@pytest.mark.asyncio
async def test_youtube_missing_key_graceful_handling():
    client = YouTubeResearchClient(api_key=None)
    result = await client.search("test query")
    assert result["status"] == "UNAVAILABLE"
    assert "missing" in result["error"].lower()
    assert result["sources"] == []

@pytest.mark.asyncio
async def test_google_books_search_public():
    client = GoogleBooksResearchClient()
    # Google books public query does not require an API key
    result = await client.search("HTTP Computer Networks", max_results=2)
    # Either succeeds or handled gracefully on network timeout
    assert result["status"] in ["SUCCESS", "ERROR"]
    if result["status"] == "SUCCESS":
        assert len(result["sources"]) > 0
        src = result["sources"][0]
        assert src.source_type == "book"
        assert src.title is not None
        assert "viewability" in src.metadata

@pytest.mark.asyncio
async def test_orchestrator_deduplication_and_fallback():
    orchestrator = ResearchOrchestrator()
    summary = await orchestrator.execute_research(
        title="HTTP Requests and Responses",
        learning_objective="Explain GET and POST methods and distinguish between status categories"
    )
    assert summary.total_sources > 0
    assert summary.website_count >= 1
    assert summary.book_count >= 1
    assert summary.youtube_count >= 1

    # Verify no duplicate URLs
    urls = [s.url for s in summary.sources]
    assert len(urls) == len(set(urls))

