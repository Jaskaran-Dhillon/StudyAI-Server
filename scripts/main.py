from studyai_notes import Studyai_Notes
from prompt import Prompt
from context import Context
import sys


def main():
    # PDF File Options: League_Rules_Guidelines.pdf     lec4.pdf    Topic14Part2.pdf    Topic2_Lecture2.pdf
    # Audio File Options: 4DN4 _Lecture_20240307.mp3
    # Video File Options: 4DN4 _Lecture_20240307.mp4
    file_path = sys.argv[1]  # relative file path
    verbosity_setting = sys.argv[2]  # 0 - short 1 - medium 2 - long
    summary_setting = sys.argv[3]  # True - include False - exclude
    bullet_setting = sys.argv[4]  # True - include False - exclude
    key_word_setting = sys.argv[5]  # True - include False - exclude
    mcq = sys.argv[6]  # True - include False - exclude

    # get context from file
    context_creator = Context(file_path, verbosity_setting)

    context = context_creator.get_context()

    # create system prompt
    prompt_creator = Prompt(
        summary=summary_setting,
        bullet=bullet_setting,
        key_word=key_word_setting,
        equation=False,
        example=False,
        audio=True if ".mp3" in file_path or ".mp4" in file_path else False,
        mcq=mcq,
    )

    system_prompt = prompt_creator.create_prompt()

    study = Studyai_Notes(system_prompt, context)

    notes = study.note_taker()
    print(notes)


if __name__ == "__main__":
    main()
