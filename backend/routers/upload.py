from fastapi import APIRouter

router = APIRouter(prefix="", tags=["upload"])


@router.post(
    "/upload",
    summary="Upload file",
    description="Upload a file to the server.",
)
def upload_file():
    return {"message": "Upload endpoint ready"}
