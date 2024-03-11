import openai
from dotenv import load_dotenv, find_dotenv
from PyPDF2 import PdfReader

# load environment
load_dotenv(find_dotenv())

client = openai.OpenAI()


class Studyai_Notes:
    def __init__(self, file_path, file_type):
        self.file_path = file_path
        self.file_type = file_type

    def pdf_to_text(self):
        doc = PdfReader(self.file_path)
        raw_text = ""
        for i, page in enumerate(doc.pages):
            text = page.extract_text()
            if text:
                raw_text += text
        return raw_text

    def audio_to_text(self):
        raw_text = "TODO"

        return raw_text

    def get_context(self):
        context = None

        if self.file_type == "pdf":
            try:
                context = self.pdf_to_text()
            except:
                print("Failed to get context")

        elif self.file_type == "audio":
            try:
                context = self.audio_to_text()
            except:
                print("Failed to get context")

        else:
            raise TypeError("Unsupported file type provided")

        return context

    def note_taker(self, prompt):
        context = self.get_context()

        # Adjust temperature and max tokens as needed (model options gpt-3.5-turbo- 1106 or 0125)
        response = client.chat.completions.create(
            model="gpt-3.5-turbo-0125",
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": prompt},
                {
                    "role": "user",
                    "content": f"The context:\n{context}",
                },
            ],
            temperature=0.2,
            max_tokens=4096,
        )

        # Extract and print the generated summary
        summary = response.choices[0].message.content
        # print(response.usage)

        return summary
