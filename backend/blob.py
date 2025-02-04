from fastapi import FastAPI, HTTPException, File, UploadFile
import aiofiles

async def save_file(file: UploadFile) -> str:
    try:
        contents = await file.read()
        location = f"/tmp/{file.filename}"
        async with aiofiles.open(location, 'wb') as f:
            await f.write(contents)
        return location
    except Exception:
        raise HTTPException(status_code=500, detail='Something went wrong')
    finally:
        await file.close()


def read_pdf_content(pdf_path: str) -> str:
    try:
        with open(pdf_path, 'rb') as file:
            reader = PyPDF2.PdfReader(file)
            return ' '.join(page.extract_text() for page in reader.pages)
    except Exception as e:
        print(f"Error reading PDF {pdf_path}: {str(e)}")
        return ""