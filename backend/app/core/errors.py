from fastapi import HTTPException, status

class AppBaseException(Exception):
    def __init__(self, message: str, status_code: int = status.HTTP_500_INTERNAL_SERVER_ERROR, details: dict = None):
        super().__init__(message)
        self.message = message
        self.status_code = status_code
        self.details = details or {}

class ResourceNotFoundException(AppBaseException):
    def __init__(self, resource_type: str, resource_id: str):
        super().__init__(
            message=f"{resource_type} with ID '{resource_id}' was not found.",
            status_code=status.HTTP_404_NOT_FOUND
        )

class ResearchProviderException(AppBaseException):
    def __init__(self, provider: str, error_detail: str):
        super().__init__(
            message=f"Research provider '{provider}' encountered an error: {error_detail}",
            status_code=status.HTTP_502_BAD_GATEWAY,
            details={"provider": provider, "error": error_detail}
        )

class GeminiAPIException(AppBaseException):
    def __init__(self, operation: str, error_detail: str):
        super().__init__(
            message=f"AI model error during '{operation}': {error_detail}",
            status_code=status.HTTP_502_BAD_GATEWAY,
            details={"operation": operation, "error": error_detail}
        )

class DurationValidationException(AppBaseException):
    def __init__(self, total_duration: int, max_allowed: int = 45):
        super().__init__(
            message=f"Lesson estimated duration ({total_duration} mins) exceeds the strict {max_allowed}-minute constraint.",
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            details={"total_duration": total_duration, "max_allowed": max_allowed}
        )

class ExportGenerationException(AppBaseException):
    def __init__(self, export_type: str, error_detail: str):
        super().__init__(
            message=f"Failed to generate {export_type} export: {error_detail}",
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            details={"export_type": export_type, "error": error_detail}
        )

