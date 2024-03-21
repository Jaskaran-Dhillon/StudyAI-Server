import os
import openai
from dotenv import load_dotenv, find_dotenv
from PyPDF2 import PdfReader
from pydub import AudioSegment
from moviepy.editor import *
from langchain.text_splitter import CharacterTextSplitter

# load environment
load_dotenv(find_dotenv())

client = openai.OpenAI()

OUTPUT_DIR = "temp_audio"


class Context:

    def __init__(self, file_path, verbosity):
        self.file_path = file_path

        if verbosity == 2:
            self.text_chunk_size = 2000
            self.audio_chunk_size = 5

        elif verbosity == 1:
            self.text_chunk_size = 3500
            self.audio_chunk_size = 10

        else:
            self.text_chunk_size = 5000
            self.audio_chunk_size = 15

    def pdf_to_text(self):
        doc = PdfReader(self.file_path)
        raw_text = ""
        for i, page in enumerate(doc.pages):
            text = page.extract_text()
            if text:
                raw_text += text
        return raw_text

    def audio_file_name(self, index):
        # Split the file path into directory and filename
        directory, filename = os.path.split(self.file_path)

        # Split the filename into name and extension
        name, extension = os.path.splitext(filename)

        # Add a new character (e.g., '_1') to the name
        new_name = f"{name}_{index}"

        # Reconnect the modified parts
        new_filename = f"{new_name}{extension}"

        return new_filename

    def chunk_audio(self, segment_length):
        # ensure output directory exists
        if not os.path.isdir(OUTPUT_DIR):
            os.mkdir(OUTPUT_DIR)

        audio = AudioSegment.from_mp3(self.file_path)

        duration = len(audio)  # in miliseconds

        scaled_segment_length = segment_length * 60 * 1000  # in miliseconds

        num_segments = int(duration / scaled_segment_length) + 1

        for i in range(num_segments):
            start = i * scaled_segment_length
            end = (i + 1) * scaled_segment_length

            audio_block = audio[start:end]

            new_path = os.path.join(OUTPUT_DIR, self.audio_file_name(i))

            audio_block.export(new_path, format="mp3")

        return num_segments

    def audio_to_text(self, audio_path):
        # Load audio file
        audio_file = open(audio_path, "rb")

        # Transcribe
        raw_text = client.audio.transcriptions.create(
            model="whisper-1", file=audio_file
        )

        audio_file.close()

        return raw_text.text

    def get_context(self):
        # Split the file path into directory and filename
        directory, filename = os.path.split(self.file_path)

        # Split the filename into name and extension
        name, extension = os.path.splitext(filename)

        context_chunks = []

        if extension == ".pdf":
            try:
                context = self.pdf_to_text()
                # Splitting up the text into smaller chunks for indexing
                text_splitter = CharacterTextSplitter(
                    separator="\n",
                    chunk_size=self.text_chunk_size,
                    chunk_overlap=200,  # striding over the text
                    length_function=len,
                )
                context_chunks = text_splitter.split_text(context)
            except:
                print("Failed to get context")

        elif extension == ".mp3" or extension == ".mp4":
            try:
                if extension == ".mp4":
                    new_path = os.path.join(directory, f"{name}.mp3")
                    # Load the mp4 file
                    videoClip = VideoFileClip(self.file_path)
                    # Extract audio from video
                    audioClip = videoClip.audio
                    audioClip.write_audiofile(new_path, logger=None)
                    # close files
                    videoClip.close()
                    audioClip.close()
                    os.remove(self.file_path)
                    self.file_path = new_path

                # chunk audio
                chunks = self.chunk_audio(self.audio_chunk_size)
                context_chunks = []
                for i in range(chunks):
                    new_path = os.path.join(OUTPUT_DIR, self.audio_file_name(i))
                    context = self.audio_to_text(new_path)
                    context_chunks.append(context)
                    os.remove(new_path)
            except:
                print("Failed to get context")
        else:
            raise TypeError("Unsupported file type provided")

        return context_chunks
