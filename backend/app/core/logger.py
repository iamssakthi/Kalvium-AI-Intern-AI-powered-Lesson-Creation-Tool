import logging
import sys
import re

class SensitiveDataFilter(logging.Filter):
    """Filter out API keys or tokens from log messages."""
    SENSITIVE_PATTERNS = [
        re.compile(r'AIza[0-9A-Za-z-_]{35}'),  # Google API keys
        re.compile(r'tvly-[0-9A-Za-z-_]{32}'), # Tavily keys
        re.compile(r'key=([^\s&]+)'),
        re.compile(r'api_key=([^\s&]+)')
    ]

    def filter(self, record: logging.LogRecord) -> bool:
        if isinstance(record.msg, str):
            for pattern in self.SENSITIVE_PATTERNS:
                record.msg = pattern.sub("[REDACTED_API_KEY]", record.msg)
        return True

def setup_logger(name: str = "ai_lesson_creator") -> logging.Logger:
    logger = logging.getLogger(name)
    if not logger.handlers:
        logger.setLevel(logging.INFO)
        handler = logging.StreamHandler(sys.stdout)
        formatter = logging.Formatter(
            fmt="%(asctime)s | %(levelname)-7s | %(name)s:%(funcName)s:%(lineno)d - %(message)s",
            datefmt="%Y-%m-%d %H:%M:%S"
        )
        handler.setFormatter(formatter)
        handler.addFilter(SensitiveDataFilter())
        logger.addHandler(handler)
        logger.propagate = False
    return logger

logger = setup_logger()

